import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import starlightOpenAPI from 'starlight-openapi'
import starlightLinksValidator from 'starlight-links-validator'
import starlightFullViewMode from 'starlight-fullview-mode'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

// https://astro.build/config
export default defineConfig({
  output: 'static',          // forces SSG
  site: 'https://openpayments.dev',
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  },
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
        PageSidebar: './src/components/PageSidebar.astro',
        Footer: "./src/components/Footer.astro",
      },
      customCss: [
        './node_modules/@interledger/docs-design-system/src/styles/teal-theme.css',
        './node_modules/@interledger/docs-design-system/src/styles/ilf-docs.css',
        './src/styles/openpayments.css',
        'katex/dist/katex.min.css'
      ],
      // defaultLocale: 'root',
      locales: {
        root: {
          // English docs in `src/content/docs`
          label: 'English',
          lang: 'en'
        },
        es: {
          // Spanish docs in `src/content/docs/es`
          label: 'Español',
          lang: 'es'
        }
      },
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
            schema:
              '../open-payments-specifications/openapi/resource-server.yaml',
            sidebar: { label: 'Open Payments' }
          },
          {
            base: 'es/apis/resource-server',
            schema:
              '../open-payments-specifications/openapi/resource-server.yaml',
            sidebar: { label: 'Open Payments' }
          },
          {
            base: 'apis/wallet-address-server',
            schema:
              '../open-payments-specifications/openapi/wallet-address-server.yaml',
            sidebar: { label: 'Wallet Addresses' }
          },
          {
            base: 'es/apis/wallet-address-server',
            schema:
              '../open-payments-specifications/openapi/wallet-address-server.yaml',
            sidebar: { label: 'Wallet Addresses' }
          },
          {
            base: 'apis/auth-server',
            schema: '../open-payments-specifications/openapi/auth-server.yaml',
            sidebar: { label: 'Open Payments Authorization Server' }
          },
          {
            base: 'es/apis/auth-server',
            schema: '../open-payments-specifications/openapi/auth-server.yaml',
            sidebar: { label: 'Open Payments Authorization Server' }
          }
        ]),
        starlightLinksValidator({
          errorOnLocalLinks: false,
          errorOnFallbackPages: false,
          exclude: [
            '/apis/{auth-server,resource-server,wallet-address-server}/**/*',
            '/es/apis/{auth-server,resource-server,wallet-address-server}/**/*'
          ]
        }),
        starlightFullViewMode()
      ],
      sidebar: [
        {
          label: 'Overview',
          translations: { es: 'Descripción general' },
          items: [
            {
              label: 'Getting started',
              translations: { es: 'Cómo empezar' },
              link: '/overview/getting-started/'
            },
            {
              label: 'Concepts',
              translations: { es: 'Conceptos' },
              collapsed: false,
              items: [
                {
                  label: 'Wallet addresses',
                  translations: { es: 'Direcciones de billetera' },
                  link: '/concepts/wallet-addresses/'
                },
                {
                  label: 'Resources',
                  translations: { es: 'Recursos' },
                  link: '/concepts/resources/'
                },
                {
                  label: 'Authorization',
                  translations: { es: 'Autorización' },
                  link: '/concepts/auth/'
                },
                {
                  label: 'Amounts',
                  translations: { es: `Montos` },
                  link: '/concepts/amounts/'
                },
                {
                  label: 'Payment methods',
                  translations: { es: 'Métodos de pago' },
                  link: '/concepts/payments/'
                },
                {
                  label: 'Open Payments flow',
                  translations: { es: 'Flujo de Open Payments' },
                  link: '/concepts/op-flow/'
                }
              ]
            },
            {
              label: 'Identity and access management',
              translations: { es: 'Gestión de la identidad y el acceso' },
              collapsed: true,
              items: [
                {
                  label: 'Grant negotiation and authorization',
                  translations: {
                    es: 'Negociación y autorización de las concesiones'
                  },
                  link: '/identity/grants/'
                },
                {
                  label: 'Identity providers',
                  translations: { es: 'Proveedores de identidad' },
                  link: '/identity/idp/'
                },
                {
                  label: 'Client keys',
                  translations: { es: 'Claves de cliente' },
                  link: '/identity/client-keys/'
                },
                {
                  label: 'HTTP signatures',
                  translations: { es: 'Firmas de mensajes HTTP' },
                  link: '/identity/http-signatures/'
                },
                {
                  label: 'Hash verification',
                  translations: { es: 'Verificación de hash' },
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
                  label: 'Create an incoming payment grant request',
                  link: '/sdk/grant-create-incoming'
                },
                {
                  label: 'Create a quote grant request',
                  link: '/sdk/grant-create-quote'
                },
                {
                  label: 'Create an outgoing payment grant request',
                  link: '/sdk/grant-create-outgoing'
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
          translations: { es: 'Guías' },
          collapsed: true,
          items: [
            {
              label: 'Accept a one-time payment for an online purchase',
              translations: {
                es: 'Aceptar un pago único por una compra en línea'
              },
              link: '/guides/accept-otp-online-purchase/'
            },
            {
              label: 'Send a remittance payment with fixed debit amount',
              translations: {
                es: 'Enviar un pago de remesa con un monto de débito fijo'
              },
              link: '/guides/onetime-remittance-fixed-debit'
            },
            {
              label: 'Send a remittance payment with a fixed receive amount',
              translations: {
                es: 'Enviar una remesa con un monto de recepción fijo'
              },
              link: '/guides/onetime-remittance-fixed-receive/'
            },
            {
              label: 'Set up recurring payments with a fixed incoming amount',
              link: '/guides/recurring-subscription-incoming-amount/'
            },
            {
              label: 'Send recurring remittances with a fixed debit amount',
              link: '/guides/recurring-remittance-fixed-debit/'
            },
            {
              label: 'Send recurring remittances with a fixed receive amount',
              link: '/guides/recurring-remittance-fixed-receive/'
            },
            {
              label: 'Split an incoming payment',
              translations: { es: 'Dividir un pago entrante' },
              link: '/guides/split-payments/'
            },
            {
              label: 'Get an outgoing payment grant for future payments',
              translations: {
                es: 'Obtener una concesión de pago saliente para pagos futuros'
              },
              link: '/guides/outgoing-grant-future-payments/'
            }
          ]
        },
        {
          label: 'Resources',
          translations: { es: 'Recursos' },
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
    })
  ],
  redirects: {
    '/introduction/wallet-addresses': '/concepts/wallet-addresses',
    '/sdk/grant-create': '/sdk/grant-create-incoming'
  },
  server: {
    port: 1104
  }
})
