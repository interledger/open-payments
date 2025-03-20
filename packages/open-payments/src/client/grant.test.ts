/* eslint-disable @typescript-eslint/no-explicit-any */
import { createGrantRoutes } from './grant'
import { OpenAPI, HttpMethod } from '@interledger/openapi'
import { createTestDeps, mockGrantRequest } from '../test/helpers'
import * as requestors from './requests'
import { v4 as uuid } from 'uuid'
import { getAuthServerOpenAPI } from '../openapi'
import { BaseDeps } from '.'
import { GrantRequest } from '../types'

jest.mock('./requests', () => ({
  ...jest.requireActual('./requests.ts'),
  deleteRequest: jest.fn(),
  post: jest.fn(),
  get: jest.fn()
}))

describe('grant', (): void => {
  let openApi: OpenAPI
  let deps: BaseDeps

  beforeAll(async () => {
    openApi = await getAuthServerOpenAPI()
    deps = await createTestDeps()
  })

  const client = 'https://example.com/.well-known/pay'

  describe('routes', () => {
    const url = 'http://localhost:1000'
    const accessToken = 'someAccessToken'

    describe('request', () => {
      test.each`
        validateResponses | description
        ${true}           | ${'with response validation'}
        ${false}          | ${'without response validation'}
      `(
        'calls post method $description',
        async ({ validateResponses }): Promise<void> => {
          const mockResponseValidator = ({ path, method }) =>
            path === '/' && method === HttpMethod.POST

          jest
            .spyOn(openApi, 'createResponseValidator')
            .mockImplementation(mockResponseValidator as any)

          const postSpy = jest.spyOn(requestors, 'post')
          const grantRequest = mockGrantRequest()

          await createGrantRoutes({
            openApi: validateResponses ? openApi : undefined,
            client,
            ...deps
          }).request({ url }, grantRequest)

          expect(postSpy).toHaveBeenCalledWith(
            deps,
            {
              url,
              body: {
                ...grantRequest,
                client
              }
            },
            validateResponses ? true : undefined
          )
        }
      )

      test.each`
        debitAmount | receiveAmount | isValid  | description
        ${true}     | ${true}       | ${false} | ${'fails with both debit and send amount'}
        ${true}     | ${false}      | ${true}  | ${'passes with debit amount but not send amount'}
        ${false}    | ${true}       | ${true}  | ${'passes with send amount but not debit amount'}
        ${false}    | ${false}      | ${true}  | ${'passes with neither send nor debit amount'}
      `(
        'POST grant request $description',
        async ({ debitAmount, receiveAmount, isValid }): Promise<void> => {
          const grantRequest = mockGrantRequest()
          const testGrantRequest = {
            ...grantRequest,
            access_token: {
              access: [
                {
                  type: 'outgoing-payment',
                  actions: ['create', 'read'],
                  identifier: 'https://example.com/alice',
                  limits: {
                    debitAmount: debitAmount
                      ? {
                          assetCode: 'USD',
                          assetScale: 2,
                          value: '500'
                        }
                      : undefined,
                    receiveAmount: receiveAmount
                      ? {
                          assetCode: 'USD',
                          assetScale: 2,
                          value: '500'
                        }
                      : undefined
                  }
                }
              ]
            }
          }

          const postSpy = jest.spyOn(requestors, 'post')
          if (isValid) {
            await createGrantRoutes({
              openApi,
              client,
              ...deps
            }).request({ url }, testGrantRequest as GrantRequest)
            expect(postSpy).toHaveBeenCalledWith(
              deps,
              {
                url,
                body: {
                  ...testGrantRequest,
                  client
                }
              },
              true
            )
          } else {
            await expect(
              createGrantRoutes({
                openApi,
                client,
                ...deps
              }).request({ url }, testGrantRequest as GrantRequest)
            ).rejects.toThrow('Invalid Grant Request')
          }
        }
      )
    })

    describe('cancel', () => {
      test.each`
        validateResponses | description
        ${true}           | ${'with response validation'}
        ${false}          | ${'without response validation'}
      `(
        'calls delete method $description',
        async ({ validateResponses }): Promise<void> => {
          const mockResponseValidator = ({ path, method }) =>
            path === '/continue/{id}' && method === HttpMethod.DELETE

          jest
            .spyOn(openApi, 'createResponseValidator')
            .mockImplementation(mockResponseValidator as any)

          const deleteSpy = jest
            .spyOn(requestors, 'deleteRequest')
            .mockResolvedValueOnce()

          await createGrantRoutes({
            openApi: validateResponses ? openApi : undefined,
            client,
            ...deps
          }).cancel({
            url,
            accessToken
          })

          expect(deleteSpy).toHaveBeenCalledWith(
            deps,
            { url, accessToken },
            validateResponses ? true : undefined
          )
        }
      )
    })

    describe('continue', () => {
      describe('calls post method', (): void => {
        const mockResponseValidator = ({ path, method }) =>
          path === '/continue/{id}' && method === HttpMethod.POST

        test('without response validation', async (): Promise<void> => {
          const postSpy = jest.spyOn(requestors, 'post')

          await createGrantRoutes({
            openApi: undefined,
            client,
            ...deps
          }).continue({
            url,
            accessToken
          })

          expect(postSpy).toHaveBeenCalledWith(
            deps,
            { url, accessToken },
            undefined
          )
        })

        test('with interact_ref', async (): Promise<void> => {
          jest
            .spyOn(openApi, 'createResponseValidator')
            .mockImplementation(mockResponseValidator as any)

          const postSpy = jest.spyOn(requestors, 'post')
          const interact_ref = uuid()

          await createGrantRoutes({
            openApi,
            client,
            ...deps
          }).continue(
            {
              url,
              accessToken
            },
            { interact_ref }
          )

          expect(postSpy).toHaveBeenCalledWith(
            deps,
            { url, accessToken, body: { interact_ref } },
            true
          )
        })
        test('without interact_ref', async (): Promise<void> => {
          jest
            .spyOn(openApi, 'createResponseValidator')
            .mockImplementation(mockResponseValidator as any)

          const postSpy = jest.spyOn(requestors, 'post')
          const body = {}

          await createGrantRoutes({
            openApi,
            client,
            ...deps
          }).continue(
            {
              url,
              accessToken
            },
            body
          )

          expect(postSpy).toHaveBeenCalledWith(
            deps,
            { url, accessToken, body },
            true
          )
        })
        test('without body', async (): Promise<void> => {
          jest
            .spyOn(openApi, 'createResponseValidator')
            .mockImplementation(mockResponseValidator as any)

          const postSpy = jest.spyOn(requestors, 'post')

          await createGrantRoutes({
            openApi,
            client,
            ...deps
          }).continue({
            url,
            accessToken
          })

          expect(postSpy).toHaveBeenCalledWith(deps, { url, accessToken }, true)
        })
      })
    })
  })
})
