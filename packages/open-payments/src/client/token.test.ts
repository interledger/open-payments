/* eslint-disable @typescript-eslint/no-explicit-any */
import { createTokenRoutes, revokeToken, rotateToken } from './token'
import { OpenAPI, HttpMethod } from '@interledger/openapi'
import nock from 'nock'
import {
  createTestDeps,
  mockAccessToken,
  mockOpenApiResponseValidators
} from '../test/helpers'
import * as requestors from './requests'
import { getAuthServerOpenAPI } from '../openapi'
import { BaseDeps } from '.'

jest.mock('./requests', () => {
  return {
    // https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options
    __esModule: true,
    ...jest.requireActual('./requests')
  }
})

describe('token', (): void => {
  let openApi: OpenAPI
  let deps: BaseDeps

  beforeAll(async () => {
    openApi = await getAuthServerOpenAPI()
    deps = await createTestDeps()
  })

  const openApiValidators = mockOpenApiResponseValidators()

  describe('rotateToken', (): void => {
    test('returns accessToken if passes validation', async (): Promise<void> => {
      const accessToken = mockAccessToken()

      const manageUrl = new URL(accessToken.access_token.manage)
      const scope = nock(manageUrl.origin)
        .post(manageUrl.pathname)
        .reply(200, accessToken)

      const result = await rotateToken(
        deps,
        {
          url: accessToken.access_token.manage,
          accessToken: 'accessToken'
        },
        openApiValidators.successfulValidator
      )
      expect(result).toEqual(accessToken)
      scope.done()
    })

    test('throws if rotate token does not pass open api validation', async (): Promise<void> => {
      const accessToken = mockAccessToken()

      const manageUrl = new URL(accessToken.access_token.manage)
      const scope = nock(manageUrl.origin)
        .post(manageUrl.pathname)
        .reply(200, accessToken)

      await expect(() =>
        rotateToken(
          deps,
          {
            url: accessToken.access_token.manage,
            accessToken: 'accessToken'
          },
          openApiValidators.failedValidator
        )
      ).rejects.toThrowError()
      scope.done()
    })
  })

  describe('revokeToken', (): void => {
    test('returns undefined if successfully revokes token', async (): Promise<void> => {
      const accessToken = mockAccessToken()

      const manageUrl = new URL(accessToken.access_token.manage)
      const scope = nock(manageUrl.origin).delete(manageUrl.pathname).reply(204)

      const result = await revokeToken(
        deps,
        {
          url: accessToken.access_token.manage,
          accessToken: 'accessToken'
        },
        openApiValidators.successfulValidator
      )
      expect(result).toBeUndefined()
      scope.done()
    })

    test('throws if revoke token does not pass open api validation', async (): Promise<void> => {
      const accessToken = mockAccessToken()

      const manageUrl = new URL(accessToken.access_token.manage)
      const scope = nock(manageUrl.origin)
        .delete(manageUrl.pathname)
        .reply(204, accessToken)

      await expect(() =>
        revokeToken(
          deps,
          {
            url: accessToken.access_token.manage,
            accessToken: 'accessToken'
          },
          openApiValidators.failedValidator
        )
      ).rejects.toThrowError()
      scope.done()
    })
  })

  describe('routes', (): void => {
    const url = 'http://localhost:1000'
    const accessToken = 'someAccessToken'

    describe('rotate', (): void => {
      test.each`
        validateResponses | description
        ${true}           | ${'with response validation'}
        ${false}          | ${'without response validation'}
      `(
        'calls post method $description',
        async ({ validateResponses }): Promise<void> => {
          const mockedAccessToken = mockAccessToken()
          const mockResponseValidator = ({ path, method }) =>
            path === '/token/{id}' && method === HttpMethod.POST

          jest
            .spyOn(openApi, 'createResponseValidator')
            .mockImplementation(mockResponseValidator as any)

          const postSpy = jest
            .spyOn(requestors, 'post')
            .mockResolvedValueOnce(mockedAccessToken)

          createTokenRoutes({
            openApi: validateResponses ? openApi : undefined,
            ...deps
          }).rotate({
            url,
            accessToken
          })
          expect(postSpy).toHaveBeenCalledWith(
            deps,
            { url, accessToken },
            validateResponses ? true : undefined
          )
        }
      )
    })

    describe('revoke', (): void => {
      test.each`
        validateResponses | description
        ${true}           | ${'with response validation'}
        ${false}          | ${'without response validation'}
      `(
        'calls delete method $description',
        async ({ validateResponses }): Promise<void> => {
          const mockResponseValidator = ({ path, method }) =>
            path === '/token/{id}' && method === HttpMethod.DELETE

          jest
            .spyOn(openApi, 'createResponseValidator')
            .mockImplementation(mockResponseValidator as any)

          const deleteSpy = jest
            .spyOn(requestors, 'deleteRequest')
            .mockResolvedValueOnce()

          createTokenRoutes({
            openApi: validateResponses ? openApi : undefined,
            ...deps
          }).revoke({
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
  })
})
