import { createWalletAddressRoutes } from './wallet-address'
import { OpenAPI, HttpMethod } from '@interledger/openapi'
import {
  createTestDeps,
  mockDIDDocument,
  mockJwk,
  mockWalletAddress
} from '../test/helpers'
import * as requestors from './requests'
import { getWalletAddressServerOpenAPI } from '../openapi'

jest.mock('./requests', () => {
  return {
    // https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options
    __esModule: true,
    ...jest.requireActual('./requests')
  }
})

describe('wallet-address', (): void => {
  let openApi: OpenAPI

  beforeAll(async () => {
    openApi = await getWalletAddressServerOpenAPI()
  })

  const deps = createTestDeps()

  describe('routes', (): void => {
    const walletAddress = mockWalletAddress()

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
          .mockResolvedValueOnce(walletAddress)

        await createWalletAddressRoutes({
          openApi,
          ...deps
        }).get({ url: walletAddress.id })

        expect(getSpy).toHaveBeenCalledWith(
          deps,
          { url: walletAddress.id },
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

        await createWalletAddressRoutes({
          openApi,
          ...deps
        }).getKeys({ url: walletAddress.id })

        expect(getSpy).toHaveBeenCalledWith(
          deps,
          { url: `${walletAddress.id}/jwks.json` },
          true
        )
      })
    })

    describe('getDIDDocument', (): void => {
      test('calls get method with correct validator', async (): Promise<void> => {
        const mockResponseValidator = ({ path, method }) =>
          path === '/did.json' && method === HttpMethod.GET

        jest
          .spyOn(openApi, 'createResponseValidator')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .mockImplementation(mockResponseValidator as any)

        const getSpy = jest
          .spyOn(requestors, 'get')
          .mockResolvedValueOnce([mockDIDDocument()])

        await createWalletAddressRoutes({
          openApi,
          ...deps
        }).getDIDDocument({ url: walletAddress.id })

        expect(getSpy).toHaveBeenCalledWith(
          deps,
          { url: `${walletAddress.id}/did.json` },
          true
        )
      })
    })
  })
})
