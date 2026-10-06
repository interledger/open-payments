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
//
// Each operation also carries the servers of the spec it came from. A merged
// document has one document-level server list, which OpenAPI applies to every
// path in it, so Scalar would otherwise offer the authorization server for a
// resource server endpoint and build the code samples from it.
//
// This has to sit on the operation rather than the path, because `/` is a
// grant request on the authorization server for POST and a wallet address
// lookup on the wallet address server for GET.
function mergePaths(...docs: OpenAPIV3_1.Document[]): OpenAPIV3_1.PathsObject {
  const result: OpenAPIV3_1.PathsObject = {}
  for (const { paths, servers } of docs) {
    for (const [path, item] of Object.entries(paths ?? {})) {
      const scoped: OpenAPIV3_1.PathItemObject = { ...item }
      if (servers?.length) {
        for (const method of HTTP_METHODS) {
          const op = scoped[method]
          if (op) scoped[method] = { ...op, servers }
        }
      }
      result[path] = { ...(result[path] ?? {}), ...scoped }
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

// Sorted by display title so Scalar's "Models" sidebar section reads
// alphabetically rather than in spec-declaration order.
function sortSchemas(
  schemas: Record<string, OpenAPIV3_1.SchemaObject>
): Record<string, OpenAPIV3_1.SchemaObject> {
  return Object.fromEntries(
    Object.entries(schemas).sort(([keyA, schemaA], [keyB, schemaB]) =>
      (schemaA.title ?? keyA).localeCompare(schemaB.title ?? keyB, undefined, {
        sensitivity: 'base'
      })
    )
  )
}

// Every component section present in any spec is carried over, rather than a
// hand-listed few. The specs also define `responses` and `examples`, and
// naming those explicitly is easy to forget — a missed section leaves every
// `$ref` that points into it dangling in the merged document.
//
// Spread order (auth, then resource, then wallet) resolves all 4 known
// collisions:
// amount, receiver: identical in auth + resource — either copy wins
// json-web-key: wallet version has property descriptions — wallet wins (last)
// GNAP securityScheme: resource version has description — resource wins
function mergeComponents(
  ...docs: OpenAPIV3_1.Document[]
): OpenAPIV3_1.ComponentsObject {
  const componentSets = docs.map(
    (doc) => (doc.components ?? {}) as Record<string, Record<string, unknown>>
  )
  const sections = new Set(componentSets.flatMap(Object.keys))
  const merged: Record<string, Record<string, unknown>> = {}

  for (const section of sections) {
    const entries = Object.assign(
      {},
      ...componentSets.map((components) => components[section] ?? {})
    )
    if (Object.keys(entries).length) merged[section] = entries
  }

  if (merged.schemas) {
    merged.schemas = sortSchemas(
      merged.schemas as Record<string, OpenAPIV3_1.SchemaObject>
    )
  }

  return merged as OpenAPIV3_1.ComponentsObject
}

export function mergeSpecs(): string {
  const auth = load('auth-server.yaml')
  const resource = load('resource-server.yaml')
  const wallet = load('wallet-address-server.yaml')

  // One server per spec, agreed with Max on 2026-09-28. The specs list several
  // each, which read as examples rather than deployments, and the extras only
  // widened the server picker without making any sample more useful. Drop this
  // override once the specs themselves carry a single server.
  auth.servers = [{ url: 'https://auth.interledger-test.dev' }]
  resource.servers = [{ url: 'https://ilp.interledger-test.dev' }]
  wallet.servers = [{ url: 'https://ilp.interledger-test.dev/alice' }]

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
    // No document-level servers. Each operation carries the servers of the spec
    // it came from, and a document-level list would only add a control on the
    // introduction that changes nothing.
    tags: mergeTags(auth, resource, wallet),
    paths: sentenceCaseSummaries(mergePaths(auth, resource, wallet)),
    components: mergeComponents(auth, resource, wallet)
  }

  return yaml.dump(merged, { lineWidth: -1 })
}
