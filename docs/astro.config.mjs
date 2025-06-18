import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import starlightOpenAPI from 'starlight-openapi'
import starlightLinksValidator from 'starlight-links-validator'
import starlightFullViewMode from 'starlight-fullview-mode'

// https://astro.build/config
export default defineConfig({
  site: 'https://openpayments.dev',
  integrations: [
    starlight({
      title: 'Open Payments',
      description:
        'An API for open access to financial accounts to send and receive payments.',
      head: [
        {
          tag: 'script',
          attrs: {
            defer: true,
            'data-website-id': '76afa57f-78bb-48ab-a9e4-095a32d8a1b9',
            src: 'https://ilf-site-analytics.netlify.app/script.js',
            'data-domains': 'openpayments.dev'
          }
        }
      ],
      components: {
        Header: './src/components/Header.astro',
        PageSidebar: './src/components/PageSidebar.astro'
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
            schema: '../openapi/resource-server.yaml',
            sidebar: { label: 'Open Payments' }
          },
          {
            base: 'apis/wallet-address-server',
            schema: '../openapi/wallet-address-server.yaml',
            sidebar: { label: 'Wallet Addresses' }
          },
          {
            base: 'apis/auth-server',
            schema: '../openapi/auth-server.yaml',
            sidebar: { label: 'Open Payments Authorization Server' }
          }
        ]),
        starlightLinksValidator({
          exclude: [
            '/apis/{auth-server,resource-server,wallet-address-server}/**/*'
          ]
        }),
        starlightFullViewMode()
      ],
      sidebar: [
        {
          label: 'Overview',
          items: [
            { label: 'Getting started', link: '/overview/getting-started/' },
            {
              label: 'Concepts',
              collapsed: false,
              items: [
                {
                  label: 'Wallet addresses',
                  link: '/concepts/wallet-addresses/'
                },
                {
                  label: 'Resources',
                  link: '/concepts/resources/'
                },
                {
                  label: 'Authorization',
                  link: '/concepts/auth/'
                },
                {
                  label: 'Payment methods',
                  link: '/concepts/payments/'
                },
                {
                  label: 'Open Payments flow',
                  link: '/concepts/op-flow/'
                }
              ]
            },
            {
              label: 'Identity and access management',
              collapsed: true,
              items: [
                {
                  label: 'Grant negotiation and authorization',
                  link: '/identity/grants/'
                },
                {
                  label: 'Identity providers',
                  link: '/identity/idp/'
                },
                {
                  label: 'Client keys',
                  link: '/identity/client-keys/'
                },
                {
                  label: 'HTTP signatures',
                  link: '/identity/http-signatures/'
                },
                {
                  label: 'Hash verification',
                  link: '/identity/hash-verification/'
                }
              ]
            }
          ]
        },
        {
          label: 'SDKs',
          collapsed: true,
          items: [
            {
              label: 'Before you begin',
              link: '/sdk/before-you-begin'
            },
            {
              label: 'Wallet addresses',
              collapsed: true,
              items: [
                {
                  label: 'Get wallet address info',
                  link: '/sdk/wallet-get-info'
                },
                {
                  label: 'Get keys bound to a wallet address',
                  link: '/sdk/wallet-get-keys'
                }
              ]
            },
            {
              label: 'Grants',
              collapsed: true,
              items: [
                {
                  label: 'Create a grant request',
                  link: '/sdk/grant-create'
                },
                {
                  label: 'Continue a grant request',
                  link: '/sdk/grant-continue'
                },
                {
                  label: 'Revoke a grant request',
                  link: '/sdk/grant-revoke'
                }
              ]
            },
            {
              label: 'Incoming payments',
              collapsed: true,
              items: [
                {
                  label: 'Create an incoming payment',
                  link: '/sdk/incoming-create/'
                },
                {
                  label: 'List incoming payments',
                  link: '/sdk/incoming-list/'
                },
                {
                  label: 'Get an incoming payment',
                  link: '/sdk/incoming-get/'
                },
                {
                  label: 'Complete an incoming payment',
                  link: '/sdk/incoming-complete/'
                }
              ]
            },
            {
              label: 'Quotes',
              collapsed: true,
              items: [
                {
                  label: 'Create a quote',
                  link: '/sdk/quote-create/'
                },
                {
                  label: 'Get a quote',
                  link: '/sdk/quote-get/'
                }
              ]
            },
            {
              label: 'Outgoing payments',
              collapsed: true,
              items: [
                {
                  label: 'Create an outgoing payment',
                  link: '/sdk/outgoing-create/'
                },
                {
                  label: 'List outgoing payments',
                  link: '/sdk/outgoing-list/'
                },
                {
                  label: 'Get an outgoing payment',
                  link: '/sdk/outgoing-get/'
                }
              ]
            },
            {
              label: 'Tokens',
              collapsed: true,
              items: [
                {
                  label: 'Rotate an access token',
                  link: '/sdk/token-rotate/'
                },
                {
                  label: 'Revoke an access token',
                  link: '/sdk/token-revoke/'
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
              label: 'Make a one-time payment',
              link: '/guides/make-onetime-payment/'
            },
            {
              label: 'Make recurring payments',
              link: '/guides/make-recurring-payments/'
            },
            {
              label: 'Split an incoming payment',
              link: '/guides/split-payments/'
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
            },
            {
              label: 'Further learning',
              link: '/resources/further-learning/'
            }
          ]
        },
        {
          label: 'API specifications',
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
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/interledger/open-payments'
        }
      ]
    }),
    starlightOpenAPI()
  ],
  redirects: {
    '/introduction/wallet-addresses': '/concepts/wallet-addresses'
  },
  server: {
    port: 1104
  }
})
