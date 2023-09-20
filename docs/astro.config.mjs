import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import { generateAPI } from 'starlight-openapi'
// import overrideIntegration from './src/overrideIntegration.mjs'

// Generate the documentation and get the associated sidebar groups.
const { openAPISidebarGroups, starlightOpenAPI } = await generateAPI([
  {
    base: 'apis/resource-server',
    label: 'Open Payments',
    schema: '../openapi/resource-server.yaml'
  },
  {
    base: 'apis/auth-server',
    label: 'Open Payments Authorization Server',
    schema: '../openapi/auth-server.yaml'
  }
])

// https://astro.build/config
export default defineConfig({
  integrations: [
    // overrideIntegration(),
    starlight({
      title: 'OpenPayments',
      customCss: [
        './node_modules/@interledger/docs-design-system/src/styles/green-theme.css',
        './node_modules/@interledger/docs-design-system/src/styles/ilf-docs.css',
        './src/styles/openpayments.css'
      ],
      logo: {
        src: './public/favicon.svg'
      },
      sidebar: [
        {
          label: 'Intro to Open Payments',
          autogenerate: {
            directory: 'introduction'
          }
        },
        {
          label: 'Security',
          autogenerate: {
            directory: 'security'
          }
        },
        {
          label: 'Guides',
          autogenerate: {
            directory: 'guides'
          }
        },
        {
          label: 'API references',
          autogenerate: {
            directory: 'api_references'
          }
        },
        // Add the generated sidebar groups to the sidebar.
        {
          label: 'API specifications',
          items: openAPISidebarGroups
        }
      ]
    }),
    starlightOpenAPI()
  ]
})
