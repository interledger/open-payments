import { resolve } from 'node:path'

// process.cwd() is the docs/ directory both when Astro loads astro.config.mjs
// and when it prerenders pages. import.meta.url can't be used for the latter
// — Vite rebases it to the prerender chunk location, which breaks the
// relative traversal to the submodule.
export const SPEC_DIR = resolve(
  process.cwd(),
  '..',
  'open-payments-specifications',
  'openapi'
)
