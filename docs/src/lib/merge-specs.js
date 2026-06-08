import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import yaml from 'js-yaml'

// process.cwd() is the docs/ directory at both dev and build time.
// import.meta.url cannot be used here — Vite rebases it to the prerender
// chunk location, which breaks the relative traversal to the submodule.
const SPEC_DIR = resolve(
  process.cwd(),
  '..',
  'open-payments-specifications',
  'openapi'
)

function load(file) {
  return yaml.load(readFileSync(resolve(SPEC_DIR, file), 'utf-8'))
}

// Merges path maps — when two specs share a path (e.g. auth POST / and wallet GET /),
// their HTTP methods are combined rather than one overwriting the other.
function mergePaths(...pathMaps) {
  const result = {}
  for (const paths of pathMaps) {
    for (const [path, item] of Object.entries(paths ?? {})) {
      result[path] = { ...(result[path] ?? {}), ...item }
    }
  }
  return result
}

export function mergeSpecs() {
  const auth = load('auth-server.yaml')
  const resource = load('resource-server.yaml')
  const wallet = load('wallet-address-server.yaml')

  // Spread order resolves all 4 known collisions:
  // amount, receiver: identical in auth + resource — either copy wins
  // json-web-key: wallet version has property descriptions — wallet wins (last)
  // GNAP securityScheme: resource version has description — resource wins
  const merged = {
    openapi: '3.1.0',
    info: {
      title: 'Open Payments API',
      version: auth.info.version,
      license: auth.info.license,
      contact: auth.info.contact,
      description:
        'API reference for the Open Payments authorization, resource, and wallet address servers.'
    },
    servers: [
      ...(auth.servers ?? []),
      ...(resource.servers ?? []),
      ...(wallet.servers ?? [])
    ],
    tags: [
      {
        name: 'Authorization server overview',
        'x-displayName': 'Overview',
        description: auth.info.description
      },
      ...(auth.tags ?? []),
      {
        name: 'Resource server overview',
        'x-displayName': 'Overview',
        description: resource.info.description
      },
      ...(resource.tags ?? []),
      {
        name: 'Wallet address server overview',
        'x-displayName': 'Overview',
        description: wallet.info.description
      },
      ...(wallet.tags ?? [])
    ],
    'x-tagGroups': [
      {
        name: 'Authorization server',
        tags: [
          'Authorization server overview',
          ...(auth.tags ?? []).map((t) => t.name)
        ]
      },
      {
        name: 'Resource server',
        tags: [
          'Resource server overview',
          ...(resource.tags ?? []).map((t) => t.name)
        ]
      },
      {
        name: 'Wallet address server',
        tags: [
          'Wallet address server overview',
          ...(wallet.tags ?? []).map((t) => t.name)
        ]
      }
    ],
    paths: mergePaths(auth.paths, resource.paths, wallet.paths),
    components: (() => {
      const parameters = {
        ...(auth.components?.parameters ?? {}),
        ...(resource.components?.parameters ?? {}),
        ...(wallet.components?.parameters ?? {})
      }
      const headers = {
        ...(auth.components?.headers ?? {}),
        ...(resource.components?.headers ?? {}),
        ...(wallet.components?.headers ?? {})
      }
      return {
        schemas: Object.fromEntries(
          Object.entries({
            ...(auth.components?.schemas ?? {}),
            ...(resource.components?.schemas ?? {}),
            ...(wallet.components?.schemas ?? {})
          }).sort(([keyA, schemaA], [keyB, schemaB]) =>
            (schemaA.title ?? keyA).localeCompare(
              schemaB.title ?? keyB,
              undefined,
              { sensitivity: 'base' }
            )
          )
        ),
        securitySchemes: {
          ...(auth.components?.securitySchemes ?? {}),
          ...(resource.components?.securitySchemes ?? {}),
          ...(wallet.components?.securitySchemes ?? {})
        },
        ...(Object.keys(parameters).length && { parameters }),
        ...(Object.keys(headers).length && { headers })
      }
    })()
  }

  return yaml.dump(merged, { lineWidth: -1 })
}
