import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import yaml from 'js-yaml'
import type { OpenAPIV3_1 } from 'openapi-types'
import { SPEC_DIR } from './spec-dir.js'
import { HTTP_METHODS } from './http-methods.js'

// OpenAPIV3_1.TagObject doesn't model vendor extensions, but 'x-displayName'
// is a real, legal OpenAPI extension key that Scalar reads for sidebar labels.
interface OverviewTagObject extends OpenAPIV3_1.TagObject {
  'x-displayName'?: string
}

function load(file: string): OpenAPIV3_1.Document {
  return yaml.load(
    readFileSync(resolve(SPEC_DIR, file), 'utf-8')
  ) as OpenAPIV3_1.Document
}

function toSentenceCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function overviewTag(
  name: string,
  displayName: string,
  description?: string
): OverviewTagObject {
  return { name, 'x-displayName': displayName, description }
}

function mergeTags(
  auth: OpenAPIV3_1.Document,
  resource: OpenAPIV3_1.Document,
  wallet: OpenAPIV3_1.Document
): OverviewTagObject[] {
  return [
    overviewTag(
      'Authorization server overview',
      'Authorization server',
      auth.info.description
    ),
    ...(auth.tags ?? []),
    overviewTag(
      'Resource server overview',
      'Resource server',
      resource.info.description
    ),
    ...(resource.tags ?? []),
    overviewTag(
      'Wallet address server overview',
      'Wallet address server',
      wallet.info.description
    ),
    ...(wallet.tags ?? [])
  ] as OverviewTagObject[]
}

// Merges path maps — when two specs share a path (e.g. auth POST / and wallet GET /),
// their HTTP methods are combined rather than one overwriting the other.
function mergePaths(
  ...pathMaps: (OpenAPIV3_1.PathsObject | undefined)[]
): OpenAPIV3_1.PathsObject {
  const result: OpenAPIV3_1.PathsObject = {}
  for (const paths of pathMaps) {
    for (const [path, item] of Object.entries(paths ?? {})) {
      result[path] = { ...(result[path] ?? {}), ...item }
    }
  }
  return result
}

function sentenceCaseSummaries(
  paths: OpenAPIV3_1.PathsObject
): OpenAPIV3_1.PathsObject {
  for (const item of Object.values(paths)) {
    for (const method of HTTP_METHODS) {
      const op = item?.[method]
      if (op?.summary) op.summary = toSentenceCase(op.summary)
    }
  }
  return paths
}

// Spread order resolves all 4 known collisions:
// amount, receiver: identical in auth + resource — either copy wins
// json-web-key: wallet version has property descriptions — wallet wins (last)
// GNAP securityScheme: resource version has description — resource wins
function mergeComponents(
  auth: OpenAPIV3_1.Document,
  resource: OpenAPIV3_1.Document,
  wallet: OpenAPIV3_1.Document
): OpenAPIV3_1.ComponentsObject {
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
}

export function mergeSpecs(): string {
  const auth = load('auth-server.yaml')
  const resource = load('resource-server.yaml')
  const wallet = load('wallet-address-server.yaml')

  const merged: OpenAPIV3_1.Document = {
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
    tags: mergeTags(auth, resource, wallet),
    paths: sentenceCaseSummaries(
      mergePaths(auth.paths, resource.paths, wallet.paths)
    ),
    components: mergeComponents(auth, resource, wallet)
  }

  return yaml.dump(merged, { lineWidth: -1 })
}
