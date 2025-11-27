/* eslint-disable no-console */
// Simple guard to ensure LinkOut components stay on one line.
// Fails if it finds a <LinkOut> without its closing tag on the same line.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const contentRoot = join(__dirname, '..', 'src')

const mdxFiles = []
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stats = statSync(full)
    if (stats.isDirectory()) {
      walk(full)
    } else if (full.endsWith('.mdx')) {
      mdxFiles.push(full)
    }
  }
}

walk(contentRoot)

const issues = []
for (const file of mdxFiles) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/)
  let inFence = false
  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inFence = !inFence
      return
    }
    if (inFence) return
    if (line.includes('<LinkOut') && !line.includes('</LinkOut>')) {
      issues.push(`${file}:${idx + 1}`)
    }
  })
}

if (issues.length) {
  console.error('Found multiline <LinkOut> components:')
  for (const issue of issues) console.error(`  - ${issue}`)
  process.exit(1)
}
