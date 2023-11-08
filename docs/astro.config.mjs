import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import { generateAPI } from 'starlight-openapi'
import remarkMermaid from 'remark-mermaidjs'

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
  site: 'https://openpayments.guide',
  markdown: {
    remarkPlugins: [remarkMermaid]
  },
  integrations: [
    starlight({
      title: 'Open Payments',
      description:
        'An API for open access to financial accounts to send and receive payments.',
      customCss: [
        './node_modules/@interledger/docs-design-system/src/styles/green-theme.css',
        './node_modules/@interledger/docs-design-system/src/styles/ilf-docs.css',
        './src/styles/openpayments.css'
      ],
      logo: {
        src: './public/favicon.svg'
      },
      components: {
        Header: './src/components/Header.astro'
      },
      social: {
        github: 'https://github.com/interledger/open-payments'
      },
      sidebar: [
        {
          label: 'Intro to Open Payments',
          items: [
            { label: 'Overview', link: '/introduction/overview/' },
            {
              label: 'Open Payments concepts',
              link: '/introduction/op-concepts'
            },
            { label: 'Open Payments flow', link: '/introduction/op-flow/' },
            {
              label: 'Wallet addresses',
              link: '/introduction/wallet-addresses/'
            },
            {
              label: 'Grant negotiation and authorization',
              link: '/introduction/grants/'
            },
            {
              label: 'Client keys',
              link: '/introduction/client-keys/'
            },
            {
              label: 'HTTP message signatures',
              link: '/introduction/http-signatures/'
            }
          ]
        },
        {
          label: 'Code snippets',
          collapsed: true,
          items: [
            {
              label: 'Wallet addresses',
              collapsed: true,
              items: [
                {
                  label: 'Get wallet address info',
                  link: '/snippets/wallet-get-info'
                },
                {
                  label: 'Get keys bound to a wallet address',
                  link: '/snippets/wallet-get-keys'
                }
              ]
            },
            {
              label: 'Grants',
              collapsed: true,
              items: [
                {
                  label: 'Create a grant request',
                  link: '/snippets/grant-create'
                },
                {
                  label: 'Continue a grant request',
                  link: '/snippets/grant-continue'
                },
                {
                  label: 'Revoke a grant request',
                  link: '/snippets/grant-revoke'
                }
              ]
            },
            {
              label: 'Incoming payments',
              collapsed: true,
              items: [
                {
                  label: 'Create an incoming payment',
                  link: '/snippets/incoming-create/'
                },
                {
                  label: 'List incoming payments',
                  link: '/snippets/incoming-list/'
                },
                {
                  label: 'Get an incoming payment',
                  link: '/snippets/incoming-get/'
                },
                {
                  label: 'Complete an incoming payment',
                  link: '/snippets/incoming-complete/'
                }
              ]
            },
            {
              label: 'Quotes',
              collapsed: true,
              items: [
                {
                  label: 'Create a quote',
                  link: '/snippets/quote-create/'
                },
                {
                  label: 'Get a quote',
                  link: '/snippets/quote-get/'
                }
              ]
            },
            {
              label: 'Outgoing payments',
              collapsed: true,
              items: [
                {
                  label: 'Create an outgoing payment',
                  link: '/snippets/outgoing-create/'
                },
                {
                  label: 'List outgoing payments',
                  link: '/snippets/outgoing-list/'
                },
                {
                  label: 'Get an outgoing payment',
                  link: '/snippets/outgoing-get/'
                }
              ]
            },
            {
              label: 'Tokens',
              collapsed: true,
              items: [
                {
                  label: 'Rotate an access token',
                  link: '/snippets/token-rotate/'
                },
                {
                  label: 'Revoke an access token',
                  link: '/snippets/token-revoke/'
                }
              ]
            }
          ]
        },
        {
          label: 'Guides',
          collapsed: true,
          items: [
            {
              label: 'Create an interactive grant',
              link: '/guides/create-interactive-grant/'
            },
            {
              label: 'Make a one-time payment',
              link: '/guides/make-onetime-payment/'
            },
            {
              label: 'Make recurring payments',
              link: '/guides/make-recurring-payments/'
            }
          ]
        },
        {
          label: 'Resources',
          collapsed: true,
          items: [
            // {
            //   label: 'Glossary',
            //   link: '/resources/glossary/'
            // },
            {
              label: 'Open Payments-enabled wallets',
              link: '/resources/op-wallets/'
            },
            {
              label: 'Supported payment methods',
              link: '/resources/payment-methods/'
            }
          ]
        },
        // Add the generated sidebar groups to the sidebar.
        {
          label: 'API specification',
          collapsed: true,
          items: openAPISidebarGroups
        }
      ]
    }),
    starlightOpenAPI()
  ],
  server: {
    port: 1104
  }
})
