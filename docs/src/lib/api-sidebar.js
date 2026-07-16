import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

const SPEC_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  'open-payments-specifications',
  'openapi'
)

const SPECS = [
  { file: 'auth-server.yaml', title: 'Auth server' },
  { file: 'resource-server.yaml', title: 'Resource server' },
  { file: 'wallet-address-server.yaml', title: 'Wallet address server' }
]

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete']

const METHOD_BADGE = {
  get: { text: 'GET', variant: 'note' },
  post: { text: 'POST', variant: 'success' },
  put: { text: 'PUT', variant: 'caution' },
  patch: { text: 'PATCH', variant: 'caution' },
  delete: { text: 'DELETE', variant: 'danger' }
}

function formatTag(tag) {
  return tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' ')
}

function encodePath(path) {
  return path.replace(/\{([^}]+)\}/g, '%7B$1%7D')
}

export function generateApiSidebar() {
  return SPECS.map(({ file, title }) => {
    const spec = yaml.load(readFileSync(resolve(SPEC_DIR, file), 'utf-8'))
    const byTag = {}

    for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
      for (const method of HTTP_METHODS) {
        const op = pathItem[method]
        if (!op) continue
        const tag = op.tags?.[0] ?? 'other'
        if (!byTag[tag]) byTag[tag] = []
        byTag[tag].push({
          label: op.summary ?? path,
          badge: METHOD_BADGE[method],
          link: `/apis/#tag/${tag}/${method.toUpperCase()}${encodePath(path)}`
        })
      }
    }

    return {
      label: title,
      collapsed: true,
      items: Object.entries(byTag).map(([tag, items]) => ({
        label: formatTag(tag),
        collapsed: true,
        items
      }))
    }
  })
}
