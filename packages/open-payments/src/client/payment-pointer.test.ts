import { createPaymentPointerRoutes } from './payment-pointer'
import { OpenAPI, HttpMethod, createOpenAPI } from '@interledger/openapi'
import path from 'path'
import {
  defaultAxiosInstance,
  mockJwk,
  mockPaymentPointer,
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

describe('payment-pointer', (): void => {
  let openApi: OpenAPI

  beforeAll(async () => {
    openApi = await createOpenAPI(
      path.resolve(__dirname, '../openapi/resource-server.yaml')
    )
  })

  const axiosInstance = defaultAxiosInstance
  const logger = silentLogger

  describe('routes', (): void => {
    const paymentPointer = mockPaymentPointer()

    describe('get', (): void => {
      test('calls get method with correct validator', async (): Promise<void> => {
        const mockResponseValidator = ({ path, method }) =>
          path === '/' && method === HttpMethod.GET

        jest
          .spyOn(openApi, 'createResponseValidator')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .mockImplementation(mockResponseValidator as any)

        const getSpy = jest
          .spyOn(requestors, 'get')
          .mockResolvedValueOnce(paymentPointer)

        await createPaymentPointerRoutes({
          openApi,
          axiosInstance,
          logger
        }).get({ url: paymentPointer.id })

        expect(getSpy).toHaveBeenCalledWith(
          { axiosInstance, logger },
          { url: paymentPointer.id },
          true
        )
      })
    })

    describe('getKeys', (): void => {
      test('calls get method with correct validator', async (): Promise<void> => {
        const mockResponseValidator = ({ path, method }) =>
          path === '/jwks.json' && method === HttpMethod.GET

        jest
          .spyOn(openApi, 'createResponseValidator')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .mockImplementation(mockResponseValidator as any)

        const getSpy = jest
          .spyOn(requestors, 'get')
          .mockResolvedValueOnce([mockJwk()])

        await createPaymentPointerRoutes({
          openApi,
          axiosInstance,
          logger
        }).getKeys({ url: paymentPointer.id })

        expect(getSpy).toHaveBeenCalledWith(
          {
            axiosInstance,
            logger
          },
          { url: `${paymentPointer.id}/jwks.json` },
          true
        )
      })
    })
  })
})
