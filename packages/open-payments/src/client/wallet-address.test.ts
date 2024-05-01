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
import { BaseDeps } from '.'

jest.mock('./requests', () => {
  return {
    // https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options
    __esModule: true,
    ...jest.requireActual('./requests')
  }
})

describe('wallet-address', (): void => {
  let openApi: OpenAPI
  let deps: BaseDeps

  beforeAll(async () => {
    openApi = await getWalletAddressServerOpenAPI()
    deps = await createTestDeps()
  })

  describe('routes', (): void => {
    const walletAddress = mockWalletAddress()

    describe('get', (): void => {
      test.each`
        validateResponses | description
        ${true}           | ${'with response validation'}
        ${false}          | ${'without response validation'}
      `(
        'calls get method $description',
        async ({ validateResponses }): Promise<void> => {
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
            ...deps,
            openApi: validateResponses ? openApi : undefined
          }).get({ url: walletAddress.id })

          expect(getSpy).toHaveBeenCalledWith(
            deps,
            { url: walletAddress.id },
            validateResponses ? true : undefined
          )
        }
      )
    })

    describe('getKeys', (): void => {
      test.each`
        validateResponses | description
        ${true}           | ${'with response validation'}
        ${false}          | ${'without response validation'}
      `(
        'calls get method $description',
        async ({ validateResponses }): Promise<void> => {
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
            ...deps,
            openApi: validateResponses ? openApi : undefined
          }).getKeys({ url: walletAddress.id })

          expect(getSpy).toHaveBeenCalledWith(
            deps,
            { url: `${walletAddress.id}/jwks.json` },
            validateResponses ? true : undefined
          )
        }
      )
    })

    describe('getDIDDocument', (): void => {
      test.each`
        validateResponses | description
        ${true}           | ${'with response validation'}
        ${false}          | ${'without response validation'}
      `(
        'calls get method $description',
        async ({ validateResponses }): Promise<void> => {
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
            ...deps,
            openApi: validateResponses ? openApi : undefined
          }).getDIDDocument({ url: walletAddress.id })

          expect(getSpy).toHaveBeenCalledWith(
            deps,
            { url: `${walletAddress.id}/did.json` },
            validateResponses ? true : undefined
          )
        }
      )
    })
  })
})
