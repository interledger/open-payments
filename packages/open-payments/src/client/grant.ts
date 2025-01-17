import { HttpMethod, ResponseValidator } from '@interledger/openapi'
import {
  GrantOrTokenRequestArgs,
  RouteDeps,
  UnauthenticatedResourceRequestArgs
} from '.'
import {
  getASPath,
  PendingGrant,
  Grant,
  GrantContinuation,
  GrantRequest as IGrantRequest,
  GrantContinuationRequest,
  JsonWebKey
} from '../types'
import { post, deleteRequest } from './requests'

interface GrantRequest extends Omit<IGrantRequest, 'client'> {
  client?: JsonWebKey
}

export interface GrantRouteDeps extends RouteDeps {
  client: string
}

export interface GrantRoutes {
  request(
    postArgs: UnauthenticatedResourceRequestArgs,
    args: GrantRequest
  ): Promise<PendingGrant | Grant>
  continue(
    postArgs: GrantOrTokenRequestArgs,
    args?: GrantContinuationRequest
  ): Promise<Grant | GrantContinuation>
  cancel(postArgs: GrantOrTokenRequestArgs): Promise<void>
}

export const createGrantRoutes = (deps: GrantRouteDeps): GrantRoutes => {
  const { openApi, ...baseDeps } = deps

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
    request: (
      requestArgs: UnauthenticatedResourceRequestArgs,
      grantRequest: GrantRequest
    ) => requestGrant(deps, requestArgs, grantRequest, requestGrantValidator),
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

export async function requestGrant(
  deps: GrantRouteDeps,
  requestArgs: UnauthenticatedResourceRequestArgs,
  grantRequst: GrantRequest,
  openApiValidator: ResponseValidator<Grant | PendingGrant>
) {
  const { url } = requestArgs

  // TODO: Runtime checks for grant access.
  // Directed identity should not be used for:
  //  - outgoing payments (all access)
  //  - incoming payments (if access is *-all)
  //  - quote (if access is *-all)

  const grant = await post(
    deps,
    {
      url,
      body: {
        ...grantRequst
      }
    },
    openApiValidator
  )

  return grant
}
