import Koa from 'koa'
import * as httpMocks from 'node-mocks-http'
import { v4 as uuid } from 'uuid'
import assert from 'assert'
import {
  createOpenAPI,
  OpenAPI,
  HttpMethod,
  RequestValidator,
  ResponseValidator
} from './'
import {
  createValidatorMiddleware,
  OpenAPIValidatorMiddlewareError
} from './middleware'
import * as path from 'path'

declare module 'koa' {
  interface Request {
    // Set by @koa/router.
    params: { [key: string]: string }
  }
}

export interface ContextData {
  // Set by @koa/router.
  params: { [key: string]: string }
}

type AppMiddleware = (
  ctx: Koa.Context,
  next: () => Promise<void>
) => Promise<void>

export function createContext<T extends Koa.Context>(
  reqOpts: httpMocks.RequestOptions,
  params: Record<string, string>
): T {
  const req = httpMocks.createRequest(reqOpts)
  const res = httpMocks.createResponse({ req })
  const koa = new Koa<unknown, ContextData>()
  const ctx = koa.createContext(req, res)
  ctx.params = ctx.request.params = params
  return ctx as T
}

const PATH = '/incoming-payments'
const SPEC = path.resolve(__dirname, '../../../openapi/resource-server.yaml')
const WALLET_ADDRESS = 'https://openpayments.dev/alice'

describe('OpenAPI Validator', (): void => {
  let openApi: OpenAPI

  beforeAll(async (): Promise<void> => {
    openApi = await createOpenAPI(SPEC)
  })

  describe('createValidatorMiddleware', (): void => {
    let next: jest.MockedFunction<() => Promise<void>>
    let validatePostMiddleware: AppMiddleware
    let validateListMiddleware: AppMiddleware
    const accountId = uuid()

    beforeAll((): void => {
      validatePostMiddleware = createValidatorMiddleware(openApi, {
        path: PATH,
        method: HttpMethod.POST
      })
      validateListMiddleware = createValidatorMiddleware(openApi, {
        path: PATH,
        method: HttpMethod.GET
      })
    })

    beforeEach((): void => {
      next = jest.fn()
    })

    test('coerces query parameter type', async (): Promise<void> => {
      const first = 5
      const next = jest.fn().mockImplementation(() => {
        expect(ctx.request.query.first).toEqual(first)
        ctx.response.body = {}
      })
      const ctx = createContext(
        {
          headers: { Accept: 'application/json' },
          url: `${PATH}?first=${first}&wallet-address=${WALLET_ADDRESS}`
        },
        {}
      )
      addTestSignatureHeaders(ctx)
      await expect(validateListMiddleware(ctx, next)).resolves.toBeUndefined()
      expect(next).toHaveBeenCalled()
    })

    test('returns 400 on invalid query parameter', async (): Promise<void> => {
      const ctx = createContext(
        {
          headers: { Accept: 'application/json' },
          url: `${PATH}?first=NaN&wallet-address=${WALLET_ADDRESS}`
        },
        {}
      )
      addTestSignatureHeaders(ctx)

      try {
        await validateListMiddleware(ctx, next)
      } catch (err) {
        assert.ok(err instanceof OpenAPIValidatorMiddlewareError)
        expect(err.message).toBe(
          'Received error validating OpenAPI request: first must be integer'
        )
        expect(err.status).toBe(400)
      }
      expect(next).not.toHaveBeenCalled()
    })

    test('returns 406 on invalid Accept header', async (): Promise<void> => {
      const ctx = createContext({ headers: { Accept: 'text/plain' } }, {})
      addTestSignatureHeaders(ctx)

      try {
        await validatePostMiddleware(ctx, next)
      } catch (err) {
        assert.ok(err instanceof OpenAPIValidatorMiddlewareError)
        expect(err.message).toBe(
          'Received error validating OpenAPI request: Must accept application/json'
        )
        expect(err.status).toBe(406)
      }

      expect(next).not.toHaveBeenCalled()
    })

    test('returns 415 on invalid Content-Type header', async (): Promise<void> => {
      const ctx = createContext(
        { headers: { 'Content-Type': 'text/plain' } },
        {}
      )
      addTestSignatureHeaders(ctx)

      try {
        await validatePostMiddleware(ctx, next)
      } catch (err) {
        assert.ok(err instanceof OpenAPIValidatorMiddlewareError)
        expect(err.message).toBe(
          'Received error validating OpenAPI request: Unsupported Content-Type text/plain'
        )
        expect(err.status).toBe(415)
      }

      expect(next).not.toHaveBeenCalled()
    })

    test.each`
      body                                                                    | message                                                                         | description
      ${undefined}                                                            | ${'request.body was not present in the request.  Is a body-parser being used?'} | ${'missing body'}
      ${{ incomingAmount: 'fail' }}                                           | ${'body.incomingAmount must be object'}                                         | ${'non-object incomingAmount'}
      ${{ incomingAmount: { value: '-2', assetCode: 'USD', assetScale: 2 } }} | ${'body.incomingAmount.value must match format "uint64"'}                       | ${'invalid incomingAmount, value non-positive'}
      ${{ incomingAmount: { value: '2', assetCode: 4, assetScale: 2 } }}      | ${'body.incomingAmount.assetCode must be string'}                               | ${'invalid incomingAmount, assetCode not string'}
      ${{ incomingAmount: { value: '2', assetCode: 'USD', assetScale: -2 } }} | ${'body.incomingAmount.assetScale must be >= 0'}                                | ${'invalid incomingAmount, assetScale negative'}
      ${{ expiresAt: 'fail' }}                                                | ${'body.expiresAt must match format "date-time"'}                               | ${'invalid expiresAt'}
      ${{ additionalProp: 'disallowed' }}                                     | ${'body must NOT have additional properties: additionalProp'}                   | ${'invalid additional property'}
    `(
      'returns 400 on invalid body ($description)',
      async ({ body, message }): Promise<void> => {
        const ctx = createContext(
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            }
          },
          {}
        )
        addTestSignatureHeaders(ctx)
        ctx.request['body'] = body
          ? { ...body, walletAddress: WALLET_ADDRESS }
          : body

        try {
          await validatePostMiddleware(ctx, next)
        } catch (err) {
          assert.ok(err instanceof OpenAPIValidatorMiddlewareError)
          expect(err.message).toBe(
            `Received error validating OpenAPI request: ${message}`
          )
          expect(err.status).toBe(400)
        }

        expect(next).not.toHaveBeenCalled()
      }
    )

    test('sets default query params and calls next on valid request', async (): Promise<void> => {
      const ctx = createContext(
        {
          headers: { Accept: 'application/json' }
        },
        {}
      )
      addTestSignatureHeaders(ctx)
      ctx.request.query = { 'wallet-address': WALLET_ADDRESS }
      const next = jest.fn().mockImplementation(() => {
        expect(ctx.request.query).toEqual({
          'wallet-address': WALLET_ADDRESS
        })
        ctx.response.body = {}
      })
      await expect(validateListMiddleware(ctx, next)).resolves.toBeUndefined()
      expect(next).toHaveBeenCalled()
    })

    test('returns 500 with additional properties', async (): Promise<void> => {
      const ctx = createContext(
        {
          headers: { Accept: 'application/json' }
        },
        {}
      )
      addTestSignatureHeaders(ctx)
      ctx.request.query = { 'wallet-address': WALLET_ADDRESS }

      const next = jest.fn().mockImplementation(() => {
        ctx.response.body = {
          pagination: { hasNextPage: false, hasPreviousPage: false },
          result: [
            {
              id: uuid(),
              walletAddress: WALLET_ADDRESS,
              completed: false,
              receivedAmount: { value: '0', assetCode: 'USD', assetScale: 2 },
              createdAt: '2022-03-12T23:20:50.52Z',
              additionalProp: 'disallowed'
            }
          ]
        }
      })

      try {
        await validateListMiddleware(ctx, next)
      } catch (err) {
        assert.ok(err instanceof OpenAPIValidatorMiddlewareError)
        expect(err.message).toBe(
          'Received error validating OpenAPI response: response.result.0 must NOT have additional properties: additionalProp'
        )
        expect(err.status).toBe(500)
      }

      expect(next).toHaveBeenCalled()
    })

    test.each`
      validateRequest | validateResponse
      ${true}         | ${true}
      ${true}         | ${false}
      ${false}        | ${true}
      ${false}        | ${false}
    `(
      'calls validators correctly with validateRequest=$validateRequest and validateResponse=$validateResponse',
      async ({ validateRequest, validateResponse }): Promise<void> => {
        const ctx = createContext(
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            }
          },
          {}
        )
        addTestSignatureHeaders(ctx)
        ctx.request['body'] = { walletAddress: WALLET_ADDRESS }

        const mockRequestValidator = jest.fn()

        jest.spyOn(openApi, 'createRequestValidator').mockReturnValueOnce(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mockRequestValidator as unknown as RequestValidator<any>
        )

        const mockResponseValidator = jest.fn()

        jest.spyOn(openApi, 'createResponseValidator').mockReturnValueOnce(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mockResponseValidator as unknown as ResponseValidator<any>
        )

        await createValidatorMiddleware(
          openApi,
          {
            path: PATH,
            method: HttpMethod.POST
          },
          { validateRequest, validateResponse }
        )(ctx, next)

        expect(mockRequestValidator).toHaveBeenCalledTimes(
          validateRequest ? 1 : 0
        )
        expect(mockResponseValidator).toHaveBeenCalledTimes(
          validateResponse ? 1 : 0
        )
        expect(next).toHaveBeenCalled()
      }
    )

    const body = {
      id: `https://${accountId}/incoming-payments/${uuid()}`,
      walletAddress: 'https://openpayments.dev/alice',
      receivedAmount: {
        value: '0',
        assetCode: 'USD',
        assetScale: 2
      },
      methods: [
        {
          type: 'ilp',
          ilpAddress: 'g.ilp.iwuyge987y.98y08y',
          sharedSecret: '1c7eaXa4rd2fFOBl1iydvCT1tV5TbM3RW1WLCafu_JA'
        }
      ],
      createdAt: '2022-03-12T23:20:50.52Z'
    }
    test.each`
      status | body                                                                    | message                                                           | description
      ${202} | ${{}}                                                                   | ${'An unknown status code was used and no default was provided.'} | ${'status code'}
      ${201} | ${{ ...body, receivedAmount: { ...body.receivedAmount, value: '-1' } }} | ${'response.receivedAmount.value must match format "uint64"'}     | ${'body with invalid type'}
    `(
      'returns 500 on invalid response $description',
      async ({ status, body, message }): Promise<void> => {
        const ctx = createContext(
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            }
          },
          {}
        )
        addTestSignatureHeaders(ctx)
        ctx.request['body'] = { walletAddress: WALLET_ADDRESS }
        const next = jest.fn().mockImplementation(() => {
          ctx.status = status
          ctx.response.body = body
        })
        try {
          await validatePostMiddleware(ctx, next)
        } catch (err) {
          assert.ok(err instanceof OpenAPIValidatorMiddlewareError)
          expect(err.message).toBe(
            `Received error validating OpenAPI response: ${message}`
          )
          expect(err.status).toBe(500)
        }

        expect(next).toHaveBeenCalled()
      }
    )

    describe('Quote', (): void => {
      let validateQuotePostMiddleware: AppMiddleware

      beforeAll((): void => {
        validateQuotePostMiddleware = createValidatorMiddleware(openApi, {
          path: '/quotes',
          method: HttpMethod.POST
        })
      })

      test.each`
        body                                                                                     | description
        ${{ receiver: 'http://something.com/connections/c3a0d182-b221-4612-a500-07ad106b5f5d' }} | ${'invalid receiver, wrong path'}
      `(
        'returns 400 on invalid quote body ($description)',
        async ({ body }): Promise<void> => {
          const ctx = createContext(
            {
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
              }
            },
            {}
          )
          addTestSignatureHeaders(ctx)
          ctx.request['body'] = {
            ...body,
            walletAddress: WALLET_ADDRESS,
            method: 'ilp'
          }
          try {
            await validateQuotePostMiddleware(ctx, next)
          } catch (err) {
            assert.ok(err instanceof OpenAPIValidatorMiddlewareError)
            expect(err.message).toBe(
              'Received error validating OpenAPI request: body.receiver must match pattern "^(https|http):..(.+).incoming-payments.(.+)$"'
            )
            expect(err.status).toBe(400)
          }

          expect(next).not.toHaveBeenCalled()
        }
      )
      test.each`
        receiver                                                                         | description
        ${'http://something.com/incoming-payments/c3a0d182-b221-4612-a500-07ad106b5f5d'} | ${'accepts http and uuid'}
        ${'https://something.com/incoming-payments/123'}                                 | ${'accepts http and non uuid id format'}
      `(
        'calls next on valid request: ($description)',
        async ({ receiver }): Promise<void> => {
          const ctx = createContext(
            {
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
              },
              url: '/quotes'
            },
            {}
          )
          addTestSignatureHeaders(ctx)
          ctx.request['body'] = {
            receiver,
            walletAddress: WALLET_ADDRESS,
            method: 'ilp'
          }
          const next = jest.fn().mockImplementation(() => {
            expect(ctx.request['body'].receiver).toEqual(receiver)
            ctx.status = 201
            ctx.response.body = {
              id: 'https://something-else/quotes/3b461206-daae-4d97-88b0-abffbcaa6f96',
              walletAddress: 'https://something-else/accounts/someone',
              receiveAmount: {
                value: '100',
                assetCode: 'USD',
                assetScale: 2
              },
              debitAmount: {
                value: '205',
                assetCode: 'USD',
                assetScale: 2
              },
              receiver,
              expiresAt: '2024-02-28T16:26:32.444Z',
              createdAt: '2024-02-28T16:21:32.444Z',
              method: 'ilp'
            }
          })

          await expect(
            validateQuotePostMiddleware(ctx, next)
          ).resolves.toBeUndefined()

          expect(next).toHaveBeenCalled()
        }
      )
    })
  })
})

function addTestSignatureHeaders(ctx: Koa.Context) {
  ctx.request.headers['Signature-Input'] = 'test signature input'
  ctx.request.headers['Signature'] = 'test signature'
}
