import { createQuoteRoutes, getQuote, createQuote } from './quote'
import { OpenAPI, HttpMethod, createOpenAPI } from '@interledger/openapi'
import path from 'path'
import {
  defaultAxiosInstance,
  mockOpenApiResponseValidators,
  mockQuote,
  silentLogger
} from '../test/helpers'
import nock from 'nock'
import * as requestors from './requests'
import { getRSPath } from '../types'

jest.mock('./requests', () => {
  return {
    __esModule: true,
    ...jest.requireActual('./requests')
  }
})

describe('quote', (): void => {
  let openApi: OpenAPI

  beforeAll(async () => {
    openApi = await createOpenAPI(
      path.resolve(__dirname, '../openapi/resource-server.yaml')
    )
  })

  const quote = mockQuote()
  const axiosInstance = defaultAxiosInstance
  const logger = silentLogger
  const useHttp = false
  const baseUrl = 'http://localhost:1000'
  const openApiValidators = mockOpenApiResponseValidators()
  const walletAddress = 'http://localhost:1000/.well-known/pay'
  const accessToken = 'accessToken'

  describe('getQuote', (): void => {
    test('returns the quote if it passes open api validation', async (): Promise<void> => {
      const scope = nock(baseUrl).get(`/quotes/${quote.id}`).reply(200, quote)
      const result = await getQuote(
        {
          axiosInstance,
          logger,
          useHttp
        },
        {
          url: `${baseUrl}/quotes/${quote.id}`,
          accessToken
        },
        openApiValidators.successfulValidator
      )
      expect(result).toStrictEqual(quote)
      scope.done()
    })

    test('throws if quote does not pass open api validation', async (): Promise<void> => {
      const scope = nock(baseUrl).get(`/quotes/${quote.id}`).reply(200, quote)

      await expect(() =>
        getQuote(
          {
            axiosInstance,
            logger,
            useHttp
          },
          {
            url: `${baseUrl}/quotes/${quote.id}`,
            accessToken
          },
          openApiValidators.failedValidator
        )
      ).rejects.toThrowError()
      scope.done()
    })
  })

  describe('createQuote', (): void => {
    test('returns the quote if it passes open api validation', async (): Promise<void> => {
      const scope = nock(baseUrl).post(`/quotes`).reply(200, quote)
      const result = await createQuote(
        {
          axiosInstance,
          logger,
          useHttp
        },
        {
          url: baseUrl,
          accessToken
        },
        openApiValidators.successfulValidator,
        { receiver: quote.receiver, method: 'ilp', walletAddress }
      )
      expect(result).toStrictEqual(quote)
      scope.done()
    })

    test('throws if quote does not pass open api validation', async (): Promise<void> => {
      const scope = nock(baseUrl).post(`/quotes`).reply(200, quote)
      await expect(() =>
        createQuote(
          {
            axiosInstance,
            logger,
            useHttp
          },
          {
            url: baseUrl,
            accessToken
          },
          openApiValidators.failedValidator,
          { receiver: quote.receiver, method: 'ilp', walletAddress }
        )
      ).rejects.toThrowError()
      scope.done()
    })
  })

  describe('routes', (): void => {
    describe('get', (): void => {
      test('calls get method with the correct validator', async (): Promise<void> => {
        const mockResponseValidator = ({ path, method }) =>
          path === `/quotes/{id}` && method === HttpMethod.GET

        jest
          .spyOn(openApi, 'createResponseValidator')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .mockImplementation(mockResponseValidator as any)

        const getSpy = jest
          .spyOn(requestors, 'get')
          .mockResolvedValueOnce(quote)
        const url = `${baseUrl}${getRSPath('/quotes/{id}')}`

        await createQuoteRoutes({
          openApi,
          axiosInstance,
          logger,
          useHttp
        }).get({
          url,
          accessToken
        })

        expect(getSpy).toHaveBeenCalledWith(
          {
            axiosInstance,
            logger,
            useHttp
          },
          { url, accessToken },
          true
        )
      })
    })

    describe('create', (): void => {
      test('calls post method with the correct validator', async (): Promise<void> => {
        const mockResponseValidator = ({ path, method }) =>
          path === `/quotes` && method === HttpMethod.POST

        jest
          .spyOn(openApi, 'createResponseValidator')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .mockImplementation(mockResponseValidator as any)

        const postSpy = jest
          .spyOn(requestors, 'post')
          .mockResolvedValueOnce(quote)
        const url = `${baseUrl}${getRSPath('/quotes')}`

        await createQuoteRoutes({
          openApi,
          axiosInstance,
          logger,
          useHttp
        }).create(
          {
            url: baseUrl,
            accessToken
          },
          { receiver: quote.receiver, method: 'ilp', walletAddress }
        )

        expect(postSpy).toHaveBeenCalledWith(
          {
            axiosInstance,
            logger,
            useHttp
          },
          {
            url,
            accessToken,
            body: { receiver: quote.receiver, method: 'ilp', walletAddress }
          },
          true
        )
      })
    })
  })
})
