import { defineCollection } from 'astro:content'
import { docsLoader } from '@astrojs/starlight/loaders'
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema'
import { docsVersionsLoader } from 'starlight-versions/loader'

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  i18n: defineCollection({ type: 'data', schema: i18nSchema() }),
  versions: defineCollection({ loader: docsVersionsLoader() })
}
