import { HttpMethod } from '@interledger/openapi'
import { RouteDeps, UnauthenticatedRequestArgs } from '.'
import { JWKS, WalletAddress, getRSPath } from '../types'
import { get } from './requests'

export interface WalletAddressRoutes {
  get(args: UnauthenticatedRequestArgs): Promise<WalletAddress>
  getKeys(args: UnauthenticatedRequestArgs): Promise<JWKS>
}

export const createWalletAddressRoutes = (
  deps: RouteDeps
): WalletAddressRoutes => {
  const { axiosInstance, openApi, logger } = deps

  const getPaymentPaymentValidator =
    openApi.createResponseValidator<WalletAddress>({
      path: getRSPath('/'),
      method: HttpMethod.GET
    })

  const getPaymentPaymentKeysValidator = openApi.createResponseValidator<JWKS>({
    path: getRSPath('/jwks.json'),
    method: HttpMethod.GET
  })

  return {
    get: (args: UnauthenticatedRequestArgs) =>
      get({ axiosInstance, logger }, args, getPaymentPaymentValidator),
    getKeys: (args: UnauthenticatedRequestArgs) =>
      get(
        { axiosInstance, logger },
        {
          url: `${args.url}/jwks.json`
        },
        getPaymentPaymentKeysValidator
      )
  }
}
