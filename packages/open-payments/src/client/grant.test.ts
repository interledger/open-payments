/* eslint-disable @typescript-eslint/no-explicit-any */
import { createGrantRoutes } from './grant'
import { OpenAPI, HttpMethod } from '@interledger/openapi'
import { createTestDeps, mockGrantRequest } from '../test/helpers'
import * as requestors from './requests'
import { v4 as uuid } from 'uuid'
import { getAuthServerOpenAPI } from '../openapi'
import { BaseDeps } from '.'

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
