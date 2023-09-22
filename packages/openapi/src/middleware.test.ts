import Koa from 'koa'
import * as httpMocks from 'node-mocks-http'
import { v4 as uuid } from 'uuid'

import { createOpenAPI, OpenAPI, HttpMethod } from './'
import { createValidatorMiddleware } from './middleware'
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
          url: `${PATH}?first=${first}`
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
          url: `${PATH}?first=NaN`
        },
        {}
      )
      addTestSignatureHeaders(ctx)
      await expect(validateListMiddleware(ctx, next)).rejects.toMatchObject({
        status: 400,
        message: 'first must be integer'
      })
      expect(next).not.toHaveBeenCalled()
    })

    test.each`
      headers                             | status | message                                  | description
      ${{ Accept: 'text/plain' }}         | ${406} | ${'must accept json'}                    | ${'Accept'}
      ${{ 'Content-Type': 'text/plain' }} | ${415} | ${'Unsupported Content-Type text/plain'} | ${'Content-Type'}
    `(
      'returns $status on invalid $description header',
      async ({ headers, status, message }): Promise<void> => {
        const ctx = createContext(
          {
            headers
          },
          {}
        )
        addTestSignatureHeaders(ctx)
        await expect(validatePostMiddleware(ctx, next)).rejects.toMatchObject({
          status,
          message
        })
        expect(next).not.toHaveBeenCalled()
      }
    )

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
        ctx.request.body = body
        await expect(validatePostMiddleware(ctx, next)).rejects.toMatchObject({
          status: 400,
          message
        })
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
      const next = jest.fn().mockImplementation(() => {
        expect(ctx.request.query).toEqual({
          first: 10,
          last: 10
        })
        ctx.response.body = {}
      })
      await expect(validateListMiddleware(ctx, next)).resolves.toBeUndefined()
      expect(next).toHaveBeenCalled()
    })

    const body = {
      id: `https://${accountId}/incoming-payments/${uuid()}`,
      walletAddress: 'https://openpayments.guide/alice',
      receivedAmount: {
        value: '0',
        assetCode: 'USD',
        assetScale: 2
      },
      createdAt: '2022-03-12T23:20:50.52Z',
      updatedAt: '2022-04-01T10:24:36.11Z'
    }
    test.each`
      status | body                                                                    | message                                                           | description
      ${202} | ${{}}                                                                   | ${'An unknown status code was used and no default was provided.'} | ${'status code'}
      ${201} | ${{ ...body, invalid: 'field' }}                                        | ${'response must NOT have additional properties: invalid'}        | ${'body with additional property'}
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
        ctx.request.body = {}
        const next = jest.fn().mockImplementation(() => {
          ctx.status = status
          ctx.response.body = body
        })
        await expect(validatePostMiddleware(ctx, next)).rejects.toMatchObject({
          status: 500,
          message
        })
        expect(next).toHaveBeenCalled()
      }
    )
  })
})

function addTestSignatureHeaders(ctx: Koa.Context) {
  ctx.request.headers['Signature-Input'] = 'test signature input'
  ctx.request.headers['Signature'] = 'test signature'
}
