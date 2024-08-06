import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import starlightOpenAPI from 'starlight-openapi'
import starlightLinksValidator from 'starlight-links-validator'

// https://astro.build/config
export default defineConfig({
  site: 'https://openpayments.guide',
  integrations: [
    starlight({
      title: 'Open Payments',
      description:
        'An API for open access to financial accounts to send and receive payments.',
      components: {
        Header: './src/components/Header.astro'
      },
      customCss: [
        './node_modules/@interledger/docs-design-system/src/styles/teal-theme.css',
        './node_modules/@interledger/docs-design-system/src/styles/ilf-docs.css',
        './src/styles/openpayments.css'
      ],
      expressiveCode: {
        styleOverrides: {
          borderColor: 'transparent',
          borderRadius: 'var(--border-radius)'
        }
      },
      logo: {
        src: './public/favicon.svg'
      },
      plugins: [
        // Generate the OpenAPI documentation pages.
        starlightOpenAPI([
          {
            base: 'apis/resource-server',
            label: 'Open Payments',
            schema: '../openapi/resource-server.yaml'
          },
          {
            base: 'apis/wallet-address-server',
            label: 'Wallet Addresses',
            schema: '../openapi/wallet-address-server.yaml'
          },
          {
            base: 'apis/auth-server',
            label: 'Open Payments Authorization Server',
            schema: '../openapi/auth-server.yaml'
          }
        ]),
        starlightLinksValidator({
          exclude: [
            '/apis/{auth-server,resource-server,wallet-address-server}/**/*'
          ]
        })
      ],
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
              label: 'Before you begin',
              link: '/snippets/before-you-begin'
            },
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
            {
              label: 'Glossary',
              link: '/resources/glossary/'
            },
            {
              label: 'Open Payments-enabled wallets',
              link: '/resources/op-wallets/'
            },
            {
              label: 'Supported payment methods',
              link: '/resources/payment-methods/'
            },
            {
              label: 'Get involved',
              link: '/resources/get-involved/'
            }
          ]
        },
        {
          label: 'API Specifications',
          collapsed: true,
          items: [
            {
              label: 'Wallet address server',
              collapsed: true,
              items: [
                {
                  label: 'Get wallet address',
                  link: '/apis/wallet-address-server/operations/get-wallet-address',
                  badge: { text: 'GET', variant: 'note' }
                },
                {
                  label: 'Get keys bound to wallet address',
                  link: '/apis/wallet-address-server/operations/get-wallet-address-keys',
                  badge: { text: 'GET', variant: 'note' }
                }
              ]
            },
            {
              label: 'Resource server',
              collapsed: true,
              items: [
                {
                  label: 'Incoming payment',
                  collapsed: true,
                  items: [
                    {
                      label: 'Create incoming payment',
                      link: '/apis/resource-server/operations/create-incoming-payment',
                      badge: { text: 'POST', variant: 'success' }
                    },
                    {
                      label: 'List incoming payments',
                      link: '/apis/resource-server/operations/list-incoming-payments',
                      badge: { text: 'GET', variant: 'note' }
                    },
                    {
                      label: 'Get an incoming payment',
                      link: '/apis/resource-server/operations/get-incoming-payment',
                      badge: { text: 'GET', variant: 'note' }
                    },
                    {
                      label: 'Complete an incoming payment',
                      link: '/apis/resource-server/operations/complete-incoming-payment',
                      badge: { text: 'POST', variant: 'success' }
                    }
                  ]
                },
                {
                  label: 'Outgoing payment',
                  collapsed: true,
                  items: [
                    {
                      label: 'Create outgoing payment',
                      link: '/apis/resource-server/operations/create-outgoing-payment',
                      badge: { text: 'POST', variant: 'success' }
                    },
                    {
                      label: 'List outgoing payments',
                      link: '/apis/resource-server/operations/list-outgoing-payments',
                      badge: { text: 'GET', variant: 'note' }
                    },
                    {
                      label: 'Get an outgoing payment',
                      link: '/apis/resource-server/operations/get-outgoing-payment',
                      badge: { text: 'GET', variant: 'note' }
                    }
                  ]
                },
                {
                  label: 'Quote',
                  collapsed: true,
                  items: [
                    {
                      label: 'Create quote',
                      link: '/apis/resource-server/operations/create-quote',
                      badge: { text: 'POST', variant: 'success' }
                    },
                    {
                      label: 'Get a quote',
                      link: '/apis/resource-server/operations/get-quote',
                      badge: { text: 'GET', variant: 'note' }
                    }
                  ]
                }
              ]
            },
            {
              label: 'Auth server',
              collapsed: true,
              items: [
                {
                  label: 'Grants',
                  collapsed: true,
                  items: [
                    {
                      label: 'Grant request',
                      link: '/apis/auth-server/operations/post-request',
                      badge: { text: 'POST', variant: 'success' }
                    },
                    {
                      label: 'Grant continuation request',
                      link: '/apis/auth-server/operations/post-continue',
                      badge: { text: 'POST', variant: 'success' }
                    },
                    {
                      label: 'Cancel grant',
                      link: '/apis/auth-server/operations/delete-continue',
                      badge: { text: 'DELETE', variant: 'danger' }
                    }
                  ]
                },
                {
                  label: 'Access token',
                  collapsed: true,
                  items: [
                    {
                      label: 'Rotate access token',
                      link: '/apis/auth-server/operations/post-token',
                      badge: { text: 'POST', variant: 'success' }
                    },
                    {
                      label: 'Revoke access token',
                      link: '/apis/auth-server/operations/delete-token',
                      badge: { text: 'DELETE', variant: 'danger' }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      social: {
        github: 'https://github.com/interledger/open-payments'
      }
    }),
    starlightOpenAPI()
  ],
  server: {
    port: 1104
  }
})
