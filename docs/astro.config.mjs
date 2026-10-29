import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import starlightLinksValidator from 'starlight-links-validator'
import starlightLlmsTxt from 'starlight-llms-txt'
import starlightFullViewMode from 'starlight-fullview-mode'
import { unified } from '@astrojs/markdown-remark'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { loadEnv } from 'vite'
import { generateApiSidebar } from './src/lib/api-sidebar.js'

const docsRoot = path.dirname(fileURLToPath(import.meta.url))
const envFromFile = loadEnv(
  process.env.NODE_ENV === 'production' ? 'production' : 'development',
  docsRoot,
  ''
)

const isNetlifyDev =
  process.env.NETLIFY_DEV === 'true' || process.env.NETLIFY_DEV === '1'

const netlifyDevFunctionsProxyTarget = (() => {
  const raw =
    process.env.URL ||
    process.env.DEPLOY_URL ||
    envFromFile.NETLIFY_FUNCTIONS_PROXY_TARGET
  if (!raw) {
    return null
  }
  try {
    return new URL(raw).origin
  } catch {
    return null
  }
})()

// https://astro.build/config
export default defineConfig({
  site: 'https://openpayments.dev',
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex]
    })
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
            src: 'https://uwa.interledger.org/script.js',
            'data-domains': 'openpayments.dev'
          }
        }
      ],
      components: {
        Header: './src/components/Header.astro',
        PageSidebar: './src/components/PageSidebar.astro',
        Footer: './src/components/Footer.astro',
        PageTitle: './src/components/PageTitle.astro',
        LastUpdated: './src/components/LastUpdated.astro'
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
      lastUpdated: true,
      logo: {
        src: './public/favicon.svg'
      },
      plugins: [
        starlightLlmsTxt({
          details: `Open Payments documentation serves two audiences: developers building payment applications using the Open Payments SDKs, and financial service providers (FSPs) implementing the protocol on their own infrastructure. The appropriate guidance differs significantly between these two groups.

Key terminology notes:

- Wallet addresses are URL-based identifiers for financial accounts — not cryptocurrency wallets
- Grants are authorization tokens specific to the Open Payments grant negotiation flow — not standard OAuth grants
- Open Payments covers the API layer for initiating and receiving payments; it does not handle settlement or the underlying transfer mechanism (that is Interledger Protocol/ILP)
- Rafiki is the reference implementation of the Open Payments protocol — relevant when a user is asking about implementing rather than consuming the API`,
          optionalLinks: [
            {
              label: 'GitHub repository',
              url: 'https://github.com/interledger/open-payments',
              description:
                'Source code, issues, and contributions for the Open Payments project'
            },
            {
              label: 'OpenAPI specifications',
              url: 'https://github.com/interledger/open-payments-specifications',
              description:
                'Hand-authored OpenAPI YAML specs for the auth server, resource server, and wallet address server'
            }
          ],
          customSets: [
            {
              label: 'Concepts',
              description:
                'Core protocol concepts including wallet addresses, grants, resources, and the Open Payments flow',
              paths: ['concepts/**']
            },
            {
              label: 'Guides',
              description:
                'Step-by-step implementation guides for common payment scenarios such as one-time payments, remittances, and recurring payments',
              paths: ['guides/**']
            },
            {
              label: 'Identity and Access Management',
              description:
                'Grant negotiation and authorization, identity providers, client keys, and HTTP signatures',
              paths: ['identity/**']
            },
            {
              label: 'Implementing Open Payments',
              description:
                'Guides for financial service providers (FSPs) implementing the Open Payments protocol on their own infrastructure',
              paths: ['implement/**']
            }
          ]
        }),
        starlightLinksValidator({
          errorOnLocalLinks: false,
          errorOnFallbackPages: false,
          exclude: ['/apis/**', '/es/apis/**']
        }),
        starlightFullViewMode({
          leftSidebarEnabled: true,
          rightSidebarEnabled: true
        })
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
              label: 'Building with Open Payments',
              translations: { es: 'Desarrollo con Open Payments' },
              link: '/overview/for-developers/'
            },
            {
              label: 'Implementing Open Payments',
              translations: { es: 'Implementación de Open Payments' },
              link: '/overview/for-fsps/'
            }
          ]
        },
        {
          label: 'For Developers',
          translations: { es: 'Para desarrolladores' },
          items: [
            {
              label: 'Concepts',
              translations: { es: 'Conceptos' },
              collapsed: true,
              items: [
                {
                  label: 'Wallet addresses',
                  translations: { es: 'Wallet addresses' },
                  link: '/concepts/wallet-addresses/'
                },
                {
                  label: 'Resources',
                  translations: { es: 'Recursos' },
                  collapsed: false,
                  items: [
                    {
                      label: 'Payment resource types',
                      translations: { es: 'Tipos de recursos de pago' },
                      link: '/concepts/resources/'
                    },
                    {
                      label: 'incoming-payment',
                      translations: { es: 'Pago entrante' },
                      link: '/concepts/resources/#incoming-payment'
                    },
                    {
                      label: 'quote',
                      translations: { es: 'Cotización' },
                      link: '/concepts/resources/#quote'
                    },
                    {
                      label: 'outgoing-payment',
                      translations: { es: 'Pago saliente' },
                      link: '/concepts/resources/#outgoing-payment'
                    }
                  ]
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
                },
                {
                  label: 'Identity and access management',
                  translations: {
                    es: 'Gestión de la identidad y el acceso'
                  },
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
                      label: 'Cancel a grant request',
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
                    },
                    {
                      label:
                        'Get spent amounts for current outgoing payment grant',
                      link: '/sdk/outgoing-grant-spent-amounts/'
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
                  label: 'Send a remittance payment with a fixed debit amount',
                  translations: {
                    es: 'Enviar un pago de remesa con un monto de débito fijo'
                  },
                  link: '/guides/onetime-remittance-fixed-debit'
                },
                {
                  label:
                    'Send a remittance payment with a fixed receive amount',
                  translations: {
                    es: 'Enviar una remesa con un monto de recepción fijo'
                  },
                  link: '/guides/onetime-remittance-fixed-receive/'
                },
                {
                  label:
                    'Set up recurring payments with a fixed incoming amount',
                  translations: {
                    es: 'Configurar pagos recurrentes con un monto entrante fijo'
                  },
                  link: '/guides/recurring-subscription-incoming-amount/'
                },
                {
                  label: 'Send recurring remittances with a fixed debit amount',
                  translations: {
                    es: 'Enviar remesas recurrentes con un monto de débito fijo'
                  },
                  link: '/guides/recurring-remittance-fixed-debit/'
                },
                {
                  label:
                    'Send recurring remittances with a fixed receive amount',
                  translations: {
                    es: 'Enviar remesas recurrentes con un monto de recepción fijo'
                  },
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
                },
                {
                  label: 'Verify ownership of a wallet address',
                  translations: {
                    es: 'Verificar la propiedad de una wallet address'
                  },
                  link: '/guides/verify-wallet-address-ownership/'
                }
              ]
            }
          ]
        },
        {
          label: 'For FSPs',
          translations: { es: 'Para FSPs' },
          collapsed: true,
          items: [
            {
              label: 'FSP overview',
              translations: { es: 'Descripción general de el FSP' },
              link: '/implement/fsp-overview/'
            },
            {
              label: 'Wallet address architecture',
              translations: { es: 'Arquitectura de wallet address' },
              link: '/implement/wallet-address-architecture/'
            },
            {
              label: 'Resource server',
              translations: { es: 'Servidor de recursos' },
              link: '/implement/resource-server/'
            },
            {
              label: 'Authorization server',
              translations: { es: 'Servidor de autorización' },
              link: '/implement/auth-server/'
            },
            {
              label: 'Identity provider integration',
              translations: { es: 'Integración del proveedor de identidad' },
              link: '/implement/identity-provider/'
            },
            {
              label: 'Security',
              translations: { es: 'Seguridad' },
              link: '/implement/security/'
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
          label: 'API reference',
          collapsed: true,
          items: generateApiSidebar()
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
    '/docs': '/overview/getting-started',
    '/apis/wallet-address-server/operations/get-wallet-address/':
      '/apis/#tag/wallet-address/GET/',
    '/apis/wallet-address-server/operations/get-wallet-address-keys/':
      '/apis/#tag/wallet-address/GET/jwks.json',
    '/apis/resource-server/operations/create-incoming-payment/':
      '/apis/#tag/incoming-payment/POST/incoming-payments',
    '/apis/resource-server/operations/list-incoming-payments/':
      '/apis/#tag/incoming-payment/GET/incoming-payments',
    '/apis/resource-server/operations/get-incoming-payment/':
      '/apis/#tag/incoming-payment/GET/incoming-payments/{id}',
    '/apis/resource-server/operations/complete-incoming-payment/':
      '/apis/#tag/incoming-payment/POST/incoming-payments/{id}/complete',
    '/apis/resource-server/operations/create-outgoing-payment/':
      '/apis/#tag/outgoing-payment/POST/outgoing-payments',
    '/apis/resource-server/operations/list-outgoing-payments/':
      '/apis/#tag/outgoing-payment/GET/outgoing-payments',
    '/apis/resource-server/operations/get-outgoing-payment/':
      '/apis/#tag/outgoing-payment/GET/outgoing-payments/{id}',
    '/apis/resource-server/operations/get-outgoing-payment-grant/':
      '/apis/#tag/outgoing-payment/GET/outgoing-payment-grant',
    '/apis/resource-server/operations/create-quote/':
      '/apis/#tag/quote/POST/quotes',
    '/apis/resource-server/operations/get-quote/':
      '/apis/#tag/quote/GET/quotes/{id}',
    '/apis/auth-server/operations/post-request/': '/apis/#tag/grant/POST/',
    '/apis/auth-server/operations/post-continue/':
      '/apis/#tag/grant/POST/continue/{id}',
    '/apis/auth-server/operations/delete-continue/':
      '/apis/#tag/grant/DELETE/continue/{id}',
    '/apis/auth-server/operations/post-token/':
      '/apis/#tag/token/POST/token/{id}',
    '/apis/auth-server/operations/delete-token/':
      '/apis/#tag/token/DELETE/token/{id}',
    '/introduction/overview/': '/overview/getting-started',
    '/introduction/grants/': '/identity/grants/',
    '/introduction/http-signatures/': '/identity/http-signatures/',
    '/introduction/op-flow/': '/concepts/op-flow/',
    '/introduction/wallet-addresses': '/concepts/wallet-addresses',
    '/implement': '/implement/fsp-overview/',
    '/implement/ase-overview/': '/implement/fsp-overview/',
    '/overview/for-ases': '/overview/for-fsps',
    '/sdk/grant-create': '/sdk/grant-create-incoming',
    '/snippets/token-rotate': '/sdk/token-rotate/'
  },
  server: {
    port: 1104,
    ...(isNetlifyDev &&
      netlifyDevFunctionsProxyTarget && {
        proxy: {
          '/.netlify/functions': {
            target: netlifyDevFunctionsProxyTarget,
            changeOrigin: true
          }
        }
      })
  }
})
