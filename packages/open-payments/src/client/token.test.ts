/* eslint-disable @typescript-eslint/no-explicit-any */
import { createTokenRoutes, revokeToken, rotateToken } from './token'
import { OpenAPI, HttpMethod, createOpenAPI } from '@interledger/openapi'
import path from 'path'
import nock from 'nock'
import {
  defaultAxiosInstance,
  mockAccessToken,
  mockOpenApiResponseValidators,
  silentLogger
} from '../test/helpers'
import * as requestors from './requests'

jest.mock('./requests', () => {
  return {
    // https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options
    __esModule: true,
    ...jest.requireActual('./requests')
  }
})

describe('token', (): void => {
  let openApi: OpenAPI

  beforeAll(async () => {
    openApi = await createOpenAPI(
      path.resolve(__dirname, '../openapi/auth-server.yaml')
    )
  })

  const axiosInstance = defaultAxiosInstance
  const logger = silentLogger
  const openApiValidators = mockOpenApiResponseValidators()

  describe('createTokenRoutes', (): void => {
    const url = 'http://localhost:1000'
    const accessToken = 'someAccessToken'

    test('creates rotateTokenValidator properly', async (): Promise<void> => {
      const mockedAccessToken = mockAccessToken()
      const mockResponseValidator = ({ path, method }) =>
        path === '/token/{id}' && method === HttpMethod.POST

      jest
        .spyOn(openApi, 'createResponseValidator')
        .mockImplementation(mockResponseValidator as any)

      const postSpy = jest
        .spyOn(requestors, 'post')
        .mockResolvedValueOnce(mockedAccessToken)

      createTokenRoutes({ axiosInstance, openApi, logger }).rotate({
        url,
        accessToken
      })
      expect(postSpy).toHaveBeenCalledWith(
        {
          axiosInstance,
          logger
        },
        { url, accessToken },
        true
      )
    })

    test('creates revokeTokenValidator properly', async (): Promise<void> => {
      const mockResponseValidator = ({ path, method }) =>
        path === '/token/{id}' && method === HttpMethod.DELETE

      jest
        .spyOn(openApi, 'createResponseValidator')
        .mockImplementation(mockResponseValidator as any)

      const deleteSpy = jest
        .spyOn(requestors, 'deleteRequest')
        .mockResolvedValueOnce()

      createTokenRoutes({ axiosInstance, openApi, logger }).revoke({
        url,
        accessToken
      })
      expect(deleteSpy).toHaveBeenCalledWith(
        {
          axiosInstance,
          logger
        },
        { url, accessToken },
        true
      )
    })
  })

  describe('rotateToken', (): void => {
    test('returns accessToken if passes validation', async (): Promise<void> => {
      const accessToken = mockAccessToken()

      const manageUrl = new URL(accessToken.access_token.manage)
      const scope = nock(manageUrl.origin)
        .post(manageUrl.pathname)
        .reply(200, accessToken)

      const result = await rotateToken(
        {
          axiosInstance,
          openApi,
          logger
        },
        {
          url: accessToken.access_token.manage,
          accessToken: 'accessToken'
        },
        openApiValidators.successfulValidator
      )
      expect(result).toStrictEqual(accessToken)
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
          {
            axiosInstance,
            openApi,
            logger
          },
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
        {
          axiosInstance,
          openApi,
          logger
        },
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
          {
            axiosInstance,
            openApi,
            logger
          },
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
})
