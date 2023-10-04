import { HttpMethod } from '@interledger/openapi'
import {
  GrantOrTokenRequestArgs,
  RouteDeps,
  UnauthenticatedRequestArgs
} from '.'
import {
  getASPath,
  PendingGrant,
  Grant,
  GrantRequest,
  GrantContinuationRequest
} from '../types'
import { post, deleteRequest } from './requests'

export interface GrantRouteDeps extends RouteDeps {
  client: string
}

export interface GrantRoutes {
  request(
    postArgs: UnauthenticatedRequestArgs,
    args: Omit<GrantRequest, 'client'>
  ): Promise<PendingGrant | Grant>
  continue(
    postArgs: GrantOrTokenRequestArgs,
    args: GrantContinuationRequest
  ): Promise<Grant>
  cancel(postArgs: GrantOrTokenRequestArgs): Promise<void>
}

export const createGrantRoutes = (deps: GrantRouteDeps): GrantRoutes => {
  const requestGrantValidator = deps.openApi.createResponseValidator<
    PendingGrant | Grant
  >({
    path: getASPath('/'),
    method: HttpMethod.POST
  })
  const continueGrantValidator = deps.openApi.createResponseValidator<Grant>({
    path: getASPath('/continue/{id}'),
    method: HttpMethod.POST
  })
  const cancelGrantValidator = deps.openApi.createResponseValidator({
    path: getASPath('/continue/{id}'),
    method: HttpMethod.DELETE
  })

  return {
    request: (
      { url }: UnauthenticatedRequestArgs,
      args: Omit<GrantRequest, 'client'>
    ) =>
      post(
        deps,
        {
          url,
          body: {
            ...args,
            client: deps.client
          }
        },
        requestGrantValidator
      ),
    continue: (
      { url, accessToken }: GrantOrTokenRequestArgs,
      args: GrantContinuationRequest
    ) =>
      post(
        deps,
        {
          url,
          accessToken,
          body: args
        },
        continueGrantValidator
      ),
    cancel: ({ url, accessToken }: GrantOrTokenRequestArgs) =>
      deleteRequest(
        deps,
        {
          url,
          accessToken
        },
        cancelGrantValidator
      )
  }
}
