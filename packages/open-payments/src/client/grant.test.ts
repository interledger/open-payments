/* eslint-disable @typescript-eslint/no-explicit-any */
import { createGrantRoutes } from './grant'
import { OpenAPI, HttpMethod, createOpenAPI } from '@interledger/openapi'
import path from 'path'
import {
  defaultAxiosInstance,
  mockGrantRequest,
  silentLogger
} from '../test/helpers'
import * as requestors from './requests'
import { v4 as uuid } from 'uuid'

jest.mock('./requests', () => ({
  ...jest.requireActual('./requests.ts'),
  deleteRequest: jest.fn(),
  post: jest.fn(),
  get: jest.fn()
}))

describe('grant', (): void => {
  let openApi: OpenAPI

  beforeAll(async () => {
    openApi = await createOpenAPI(
      path.resolve(__dirname, '../openapi/auth-server.yaml')
    )
  })

  const deps = {
    axiosInstance: defaultAxiosInstance,
    logger: silentLogger,
    client: 'https://example.com/.well-known/pay'
  }

  describe('routes', () => {
    const url = 'http://localhost:1000'
    const accessToken = 'someAccessToken'

    describe('request', () => {
      test('calls post method with correct validator', async (): Promise<void> => {
        const mockResponseValidator = ({ path, method }) =>
          path === '/' && method === HttpMethod.POST

        jest
          .spyOn(openApi, 'createResponseValidator')
          .mockImplementation(mockResponseValidator as any)

        const postSpy = jest.spyOn(requestors, 'post')
        const grantRequest = mockGrantRequest()

        await createGrantRoutes({ openApi, ...deps }).request(
          { url },
          grantRequest
        )

        expect(postSpy).toHaveBeenCalledWith(
          { openApi, ...deps },
          {
            url,
            body: {
              ...grantRequest,
              client: deps.client
            }
          },
          true
        )
      })
    })

    describe('cancel', () => {
      test('calls delete method with correct validator', async (): Promise<void> => {
        const mockResponseValidator = ({ path, method }) =>
          path === '/continue/{id}' && method === HttpMethod.DELETE

        jest
          .spyOn(openApi, 'createResponseValidator')
          .mockImplementation(mockResponseValidator as any)

        const deleteSpy = jest
          .spyOn(requestors, 'deleteRequest')
          .mockResolvedValueOnce()

        await createGrantRoutes({ openApi, ...deps }).cancel({
          url,
          accessToken
        })

        expect(deleteSpy).toHaveBeenCalledWith(
          { openApi, ...deps },
          { url, accessToken },
          true
        )
      })
    })

    describe('continue', () => {
      test('calls post method with correct validator', async (): Promise<void> => {
        const mockResponseValidator = ({ path, method }) =>
          path === '/continue/{id}' && method === HttpMethod.POST

        jest
          .spyOn(openApi, 'createResponseValidator')
          .mockImplementation(mockResponseValidator as any)

        const postSpy = jest.spyOn(requestors, 'post')
        const interact_ref = uuid()

        await createGrantRoutes({ openApi, ...deps }).continue(
          {
            url,
            accessToken
          },
          { interact_ref }
        )

        expect(postSpy).toHaveBeenCalledWith(
          { openApi, ...deps },
          { url, accessToken, body: { interact_ref } },
          true
        )
      })
    })
  })
})
