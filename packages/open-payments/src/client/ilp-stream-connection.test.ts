import { createILPStreamConnectionRoutes } from './ilp-stream-connection'
import { OpenAPI, HttpMethod, createOpenAPI } from '@interledger/openapi'
import path from 'path'
import {
  defaultAxiosInstance,
  mockILPStreamConnection,
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

describe('ilp-stream-connection', (): void => {
  let openApi: OpenAPI

  beforeAll(async () => {
    openApi = await createOpenAPI(
      path.resolve(__dirname, '../openapi/resource-server.yaml')
    )
  })

  const axiosInstance = defaultAxiosInstance
  const logger = silentLogger

  describe('routes', (): void => {
    const ilpStreamConnection = mockILPStreamConnection()

    describe('get', (): void => {
      test('calls get method with correct validator', async (): Promise<void> => {
        const mockResponseValidator = ({ path, method }) =>
          path === '/connections/{id}' && method === HttpMethod.GET

        jest
          .spyOn(openApi, 'createResponseValidator')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .mockImplementation(mockResponseValidator as any)

        const getSpy = jest
          .spyOn(requestors, 'get')
          .mockResolvedValueOnce(ilpStreamConnection)

        await createILPStreamConnectionRoutes({
          openApi,
          axiosInstance,
          logger
        }).get({ url: ilpStreamConnection.id })

        expect(getSpy).toHaveBeenCalledWith(
          { axiosInstance, logger },
          { url: ilpStreamConnection.id },
          true
        )
      })
    })
  })
})
