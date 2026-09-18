import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import yaml from 'js-yaml'
import type { OpenAPIV3_1 } from 'openapi-types'
import { SPEC_DIR } from './spec-dir.js'
import { HTTP_METHODS, type HttpMethod } from './http-methods.js'

const SPECS = [
  { file: 'auth-server.yaml', title: 'Auth server' },
  { file: 'resource-server.yaml', title: 'Resource server' },
  { file: 'wallet-address-server.yaml', title: 'Wallet address server' }
]

interface SidebarBadge {
  text: string
  variant: 'note' | 'success' | 'caution' | 'danger'
}

const METHOD_BADGE: Record<HttpMethod, SidebarBadge> = {
  get: { text: 'GET', variant: 'note' },
  post: { text: 'POST', variant: 'success' },
  put: { text: 'PUT', variant: 'caution' },
  patch: { text: 'PATCH', variant: 'caution' },
  delete: { text: 'DELETE', variant: 'danger' }
}

interface SidebarLinkItem {
  label: string
  badge: SidebarBadge
  link: string
}

interface SidebarTagGroup {
  label: string
  collapsed: boolean
  items: SidebarLinkItem[]
}

interface SidebarSpecGroup {
  label: string
  collapsed: boolean
  items: SidebarTagGroup[]
}

function formatTag(tag: string): string {
  return tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' ')
}

function encodePath(path: string): string {
  return path.replace(/\{([^}]+)\}/g, '%7B$1%7D')
}

export function generateApiSidebar(): SidebarSpecGroup[] {
  return SPECS.map(({ file, title }) => {
    const spec = yaml.load(
      readFileSync(resolve(SPEC_DIR, file), 'utf-8')
    ) as OpenAPIV3_1.Document
    const byTag: Record<string, SidebarLinkItem[]> = {}

    for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
      for (const method of HTTP_METHODS) {
        const op = pathItem?.[method]
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
