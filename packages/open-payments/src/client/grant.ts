import { HttpMethod, ResponseValidator } from '@interledger/openapi'
import {
  GrantOrTokenRequestArgs,
  OpenPaymentsClientError,
  RouteDeps,
  UnauthenticatedResourceRequestArgs
} from '.'
import {
  getASPath,
  PendingGrant,
  Grant,
  GrantContinuation,
  GrantRequest,
  GrantContinuationRequest,
  AccessOutgoingWithDebitAmount,
  AccessOutgoingWithReceiveAmount
} from '../types'
import { post, deleteRequest } from './requests'

export interface GrantRouteDeps extends RouteDeps {
  client: string
}

export interface GrantRoutes {
  request(
    postArgs: UnauthenticatedResourceRequestArgs,
    args: Omit<GrantRequest, 'client'>
  ): Promise<PendingGrant | Grant>
  continue(
    postArgs: GrantOrTokenRequestArgs,
    args?: GrantContinuationRequest
  ): Promise<Grant | GrantContinuation>
  cancel(postArgs: GrantOrTokenRequestArgs): Promise<void>
}

export const createGrantRoutes = (deps: GrantRouteDeps): GrantRoutes => {
  const { openApi, client, ...baseDeps } = deps

  let requestGrantValidator: ResponseValidator<PendingGrant | Grant>
  let continueGrantValidator: ResponseValidator<GrantContinuation | Grant>
  let cancelGrantValidator: ResponseValidator<void>

  if (openApi) {
    requestGrantValidator = openApi.createResponseValidator({
      path: getASPath('/'),
      method: HttpMethod.POST
    })
    continueGrantValidator = openApi.createResponseValidator({
      path: getASPath('/continue/{id}'),
      method: HttpMethod.POST
    })
    cancelGrantValidator = openApi.createResponseValidator({
      path: getASPath('/continue/{id}'),
      method: HttpMethod.DELETE
    })
  }

  return {
    request: async (
      { url }: UnauthenticatedResourceRequestArgs,
      args: Omit<GrantRequest, 'client'>
    ) => {
      const outgoingPaymentAccess = args.access_token.access.find(
        (el) => el.type === 'outgoing-payment'
      )
      if (
        (outgoingPaymentAccess?.limits as AccessOutgoingWithDebitAmount)
          ?.debitAmount &&
        (outgoingPaymentAccess?.limits as AccessOutgoingWithReceiveAmount)
          ?.receiveAmount
      ) {
        throw new OpenPaymentsClientError('Invalid Grant Request', {
          description:
            'Only one of "debitAmount" or "receiveAmount" may be specified.'
        })
      }
      return post(
        baseDeps,
        {
          url,
          body: {
            ...args,
            client
          }
        },
        requestGrantValidator
      )
    },
    continue: (
      { url, accessToken }: GrantOrTokenRequestArgs,
      args: GrantContinuationRequest
    ) =>
      post(
        baseDeps,
        {
          url,
          accessToken,
          body: args
        },
        continueGrantValidator
      ),
    cancel: ({ url, accessToken }: GrantOrTokenRequestArgs) =>
      deleteRequest(
        baseDeps,
        {
          url,
          accessToken
        },
        cancelGrantValidator
      )
  }
}
