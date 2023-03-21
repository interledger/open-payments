import { HttpMethod } from '@interledger/openapi'
import { RouteDeps, UnauthenticatedResourceRequestArgs } from '.'
import { JWKS, PaymentPointer, getRSPath } from '../types'
import { get } from './requests'

export interface PaymentPointerRoutes {
  get(args: UnauthenticatedResourceRequestArgs): Promise<PaymentPointer>
  getKeys(args: UnauthenticatedResourceRequestArgs): Promise<JWKS>
}

export const createPaymentPointerRoutes = (
  deps: RouteDeps
): PaymentPointerRoutes => {
  const { axiosInstance, openApi, logger } = deps

  const getPaymentPaymentValidator =
    openApi.createResponseValidator<PaymentPointer>({
      path: getRSPath('/'),
      method: HttpMethod.GET
    })

  const getPaymentPaymentKeysValidator = openApi.createResponseValidator<JWKS>({
    path: getRSPath('/jwks.json'),
    method: HttpMethod.GET
  })

  return {
    get: (args: UnauthenticatedResourceRequestArgs) =>
      get({ axiosInstance, logger }, args, getPaymentPaymentValidator),
    getKeys: (args: UnauthenticatedResourceRequestArgs) =>
      get(
        { axiosInstance, logger },
        {
          url: `${args.url}/jwks.json`
        },
        getPaymentPaymentKeysValidator
      )
  }
}
