/**
 * This file was auto-generated by generate-schema-objects.js.
 * Do not make direct changes to the file.
 */

import { OpenAPIV3_1 } from '@interledger/openapi'

export default {
  openapi: '3.1.0',
  info: {
    title: 'Wallet Address API',
    version: '1.4',
    license: {
      name: 'Apache 2.0',
      identifier: 'Apache-2.0'
    },
    description:
      'The Wallet Address API is a simple REST API to get basic details about a wallet address.',
    contact: {
      email: 'tech@interledger.org'
    }
  },
  servers: [
    {
      url: 'https://rafiki.money/alice',
      description: "Server for Alice's wallet address"
    },
    {
      url: 'https://rafiki.money/bob',
      description: "Server for Bob's wallet address"
    }
  ],
  tags: [
    {
      name: 'wallet-address',
      description: 'wallet address operations'
    }
  ],
  paths: {
    '/': {
      get: {
        summary: 'Get a Wallet Address',
        tags: ['wallet-address'],
        responses: {
          '200': {
            description: 'Wallet Address Found',
            content: {
              'application/json': {
                schema: {
                  title: 'Wallet Address',
                  type: 'object',
                  description:
                    'A **wallet address** resource is the root of the API and contains the public details of the financial account represented by the Wallet Address that is also the service endpoint URL.',
                  additionalProperties: true,
                  examples: [
                    {
                      id: 'https://rafiki.money/alice',
                      publicName: 'Alice',
                      assetCode: 'USD',
                      assetScale: 2,
                      authServer: 'https://rafiki.money/auth',
                      resourceServer: 'https://rafiki.money/op'
                    }
                  ],
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uri',
                      description: 'The URL identifying the wallet address.',
                      readOnly: true
                    },
                    publicName: {
                      type: 'string',
                      description:
                        'A public name for the account. This should be set by the account holder with their provider to provide a hint to counterparties as to the identity of the account holder.',
                      readOnly: true
                    },
                    assetCode: {
                      title: 'Asset code',
                      type: 'string',
                      description:
                        'The assetCode is a code that indicates the underlying asset. This SHOULD be an ISO4217 currency code.'
                    },
                    assetScale: {
                      title: 'Asset scale',
                      type: 'integer',
                      minimum: 0,
                      maximum: 255,
                      description:
                        'The scale of amounts denoted in the corresponding asset code.'
                    },
                    authServer: {
                      type: 'string',
                      format: 'uri',
                      description:
                        'The URL of the authorization server endpoint for getting grants and access tokens for this wallet address.',
                      readOnly: true
                    },
                    resourceServer: {
                      type: 'string',
                      format: 'uri',
                      description:
                        'The URL of the resource server endpoint for performing Open Payments with this wallet address.',
                      readOnly: true
                    }
                  },
                  required: [
                    'id',
                    'assetCode',
                    'assetScale',
                    'authServer',
                    'resourceServer'
                  ]
                },
                examples: {
                  'Get wallet address for $rafiki.money/alice': {
                    value: {
                      id: 'https://rafiki.money/alice',
                      publicName: 'Alice',
                      assetCode: 'USD',
                      assetScale: 2,
                      authServer: 'https://rafiki.money/auth',
                      resourceServer: 'https://rafiki.money/op'
                    }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Wallet Address Not Found'
          }
        },
        operationId: 'get-wallet-address',
        description:
          'Retrieve the public information of the Wallet Address.\n' +
          '\n' +
          'This end-point should be open to anonymous requests as it allows clients to verify a Wallet Address URL and get the basic information required to construct new transactions and discover the grant request URL.\n' +
          '\n' +
          'The content should be slow changing and cacheable for long periods. Servers SHOULD use cache control headers.',
        security: [],
        'x-internal': false
      }
    },
    '/jwks.json': {
      get: {
        summary: 'Get the keys bound to a Wallet Address',
        tags: ['wallet-address'],
        responses: {
          '200': {
            description: 'JWKS Document Found',
            content: {
              'application/json': {
                schema: {
                  title: 'JSON Web Key Set document',
                  type: 'object',
                  description:
                    'A JSON Web Key Set document according to [rfc7517](https://datatracker.ietf.org/doc/html/rfc7517) listing the keys associated with this wallet address. These keys are used to sign requests made by this wallet address.',
                  additionalProperties: false,
                  properties: {
                    keys: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          kid: {
                            type: 'string'
                          },
                          alg: {
                            type: 'string',
                            description:
                              'The cryptographic algorithm family used with the key. The only allowed value is `EdDSA`. ',
                            enum: ['EdDSA']
                          },
                          use: {
                            type: 'string',
                            enum: ['sig']
                          },
                          kty: {
                            type: 'string',
                            enum: ['OKP']
                          },
                          crv: {
                            type: 'string',
                            enum: ['Ed25519']
                          },
                          x: {
                            type: 'string',
                            pattern: '^[a-zA-Z0-9-_]+$',
                            description: 'The base64 url-encoded public key.'
                          }
                        },
                        required: ['kid', 'alg', 'kty', 'crv', 'x'],
                        title: 'Ed25519 Public Key',
                        description:
                          'A JWK representation of an Ed25519 Public Key',
                        examples: [
                          {
                            kid: 'key-1',
                            use: 'sig',
                            kty: 'OKP',
                            crv: 'Ed25519',
                            x: '11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo'
                          },
                          {
                            kid: '2022-09-02',
                            use: 'sig',
                            kty: 'OKP',
                            crv: 'Ed25519',
                            x: 'oy0L_vTygNE4IogRyn_F5GmHXdqYVjIXkWs2jky7zsI'
                          }
                        ]
                      },
                      readOnly: true
                    }
                  },
                  required: ['keys'],
                  examples: [
                    {
                      keys: [
                        {
                          kid: 'key-1',
                          alg: 'EdDSA',
                          use: 'sig',
                          kty: 'OKP',
                          crv: 'Ed25519',
                          x: '11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo'
                        }
                      ]
                    }
                  ]
                },
                examples: {}
              }
            }
          },
          '404': {
            description: 'JWKS Document Not Found'
          }
        },
        operationId: 'get-wallet-address-keys',
        description: 'Retrieve the public keys of the Wallet Address.',
        security: []
      }
    },
    '/did.json': {
      get: {
        summary: 'Get the DID Document for this wallet',
        tags: ['wallet-address'],
        responses: {
          '200': {
            description: 'DID Document Found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  title: 'DID Document',
                  description: 'A DID Document using JSON encoding'
                }
              }
            }
          },
          '500': {
            description: 'DID Document not yet implemented'
          }
        },
        operationId: 'get-wallet-address-did-document',
        description: 'Retrieve the DID Document of the Wallet Address.',
        security: []
      }
    }
  },
  components: {
    schemas: {
      'wallet-address': {
        title: 'Wallet Address',
        type: 'object',
        description:
          'A **wallet address** resource is the root of the API and contains the public details of the financial account represented by the Wallet Address that is also the service endpoint URL.',
        additionalProperties: true,
        examples: [
          {
            id: 'https://rafiki.money/alice',
            publicName: 'Alice',
            assetCode: 'USD',
            assetScale: 2,
            authServer: 'https://rafiki.money/auth',
            resourceServer: 'https://rafiki.money/op'
          }
        ],
        properties: {
          id: {
            type: 'string',
            format: 'uri',
            description: 'The URL identifying the wallet address.',
            readOnly: true
          },
          publicName: {
            type: 'string',
            description:
              'A public name for the account. This should be set by the account holder with their provider to provide a hint to counterparties as to the identity of the account holder.',
            readOnly: true
          },
          assetCode: {
            title: 'Asset code',
            type: 'string',
            description:
              'The assetCode is a code that indicates the underlying asset. This SHOULD be an ISO4217 currency code.'
          },
          assetScale: {
            title: 'Asset scale',
            type: 'integer',
            minimum: 0,
            maximum: 255,
            description:
              'The scale of amounts denoted in the corresponding asset code.'
          },
          authServer: {
            type: 'string',
            format: 'uri',
            description:
              'The URL of the authorization server endpoint for getting grants and access tokens for this wallet address.',
            readOnly: true
          },
          resourceServer: {
            type: 'string',
            format: 'uri',
            description:
              'The URL of the resource server endpoint for performing Open Payments with this wallet address.',
            readOnly: true
          }
        },
        required: [
          'id',
          'assetCode',
          'assetScale',
          'authServer',
          'resourceServer'
        ]
      },
      'json-web-key-set': {
        title: 'JSON Web Key Set document',
        type: 'object',
        description:
          'A JSON Web Key Set document according to [rfc7517](https://datatracker.ietf.org/doc/html/rfc7517) listing the keys associated with this wallet address. These keys are used to sign requests made by this wallet address.',
        additionalProperties: false,
        properties: {
          keys: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                kid: {
                  type: 'string'
                },
                alg: {
                  type: 'string',
                  description:
                    'The cryptographic algorithm family used with the key. The only allowed value is `EdDSA`. ',
                  enum: ['EdDSA']
                },
                use: {
                  type: 'string',
                  enum: ['sig']
                },
                kty: {
                  type: 'string',
                  enum: ['OKP']
                },
                crv: {
                  type: 'string',
                  enum: ['Ed25519']
                },
                x: {
                  type: 'string',
                  pattern: '^[a-zA-Z0-9-_]+$',
                  description: 'The base64 url-encoded public key.'
                }
              },
              required: ['kid', 'alg', 'kty', 'crv', 'x'],
              title: 'Ed25519 Public Key',
              description: 'A JWK representation of an Ed25519 Public Key',
              examples: [
                {
                  kid: 'key-1',
                  use: 'sig',
                  kty: 'OKP',
                  crv: 'Ed25519',
                  x: '11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo'
                },
                {
                  kid: '2022-09-02',
                  use: 'sig',
                  kty: 'OKP',
                  crv: 'Ed25519',
                  x: 'oy0L_vTygNE4IogRyn_F5GmHXdqYVjIXkWs2jky7zsI'
                }
              ]
            },
            readOnly: true
          }
        },
        required: ['keys'],
        examples: [
          {
            keys: [
              {
                kid: 'key-1',
                alg: 'EdDSA',
                use: 'sig',
                kty: 'OKP',
                crv: 'Ed25519',
                x: '11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo'
              }
            ]
          }
        ]
      },
      'json-web-key': {
        type: 'object',
        properties: {
          kid: {
            type: 'string'
          },
          alg: {
            type: 'string',
            description:
              'The cryptographic algorithm family used with the key. The only allowed value is `EdDSA`. ',
            enum: ['EdDSA']
          },
          use: {
            type: 'string',
            enum: ['sig']
          },
          kty: {
            type: 'string',
            enum: ['OKP']
          },
          crv: {
            type: 'string',
            enum: ['Ed25519']
          },
          x: {
            type: 'string',
            pattern: '^[a-zA-Z0-9-_]+$',
            description: 'The base64 url-encoded public key.'
          }
        },
        required: ['kid', 'alg', 'kty', 'crv', 'x'],
        title: 'Ed25519 Public Key',
        description: 'A JWK representation of an Ed25519 Public Key',
        examples: [
          {
            kid: 'key-1',
            use: 'sig',
            kty: 'OKP',
            crv: 'Ed25519',
            x: '11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo'
          },
          {
            kid: '2022-09-02',
            use: 'sig',
            kty: 'OKP',
            crv: 'Ed25519',
            x: 'oy0L_vTygNE4IogRyn_F5GmHXdqYVjIXkWs2jky7zsI'
          }
        ]
      },
      'did-document': {
        type: 'object',
        title: 'DID Document',
        description: 'A DID Document using JSON encoding'
      }
    }
  }
} as OpenAPIV3_1.Document