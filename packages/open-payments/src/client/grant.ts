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

export interface ExternalGrantRequest extends Omit<IGrantRequest, 'client'> {
  client?: {
    jwk: JsonWebKey
  }
}

export interface GrantRouteDeps extends RouteDeps {
  client: string
}

export interface GrantRoutes {
  request(
    postArgs: UnauthenticatedResourceRequestArgs,
    args: ExternalGrantRequest
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
    request: (
      requestArgs: UnauthenticatedResourceRequestArgs,
      grantRequest: ExternalGrantRequest
    ) =>
      requestGrant(
        { ...baseDeps, client },
        requestArgs,
        grantRequest,
        requestGrantValidator
      ),
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
  grantRequest: ExternalGrantRequest,
  openApiValidator: ResponseValidator<Grant | PendingGrant>
) {
  const { client: sdkClient, ...baseDeps } = deps
  const { url } = requestArgs

  let client: IGrantRequest['client'] = { wallet_address: sdkClient }

  if (grantRequest.client && grantRequest.client.jwk) {
    client = { jwk: grantRequest.client.jwk }
  }

  // TODO(radu): Runtime checks for grant access.
  // Directed identity should not be used for:
  //  - outgoing payments (all access)
  //  - incoming payments (if access is *-all)
  //  - quote (if access is *-all)
  //
  // Other assertions:
  //  - ensure only the JWK is passed when using `client.grant.request`
  //
  // Do we want to have these runtime checks here or only the AS should take
  // care of this validation?

  const grant = await post(
    baseDeps,
    {
      url,
      body: {
        ...grantRequest,
        client
      }
    },
    openApiValidator
  )

  return grant
}
