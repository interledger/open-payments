import { HttpMethod, ResponseValidator } from '@interledger/openapi'
import { GrantOrTokenRequestArgs, RouteDeps } from '.'
import { getASPath, AccessToken } from '../types'
import { deleteRequest, post } from './requests'

export interface TokenRoutes {
  rotate(args: GrantOrTokenRequestArgs): Promise<AccessToken>
  revoke(args: GrantOrTokenRequestArgs): Promise<void>
}

export const rotateToken = async (
  deps: RouteDeps,
  args: GrantOrTokenRequestArgs,
  validateOpenApiResponse: ResponseValidator<AccessToken>
) => {
  const { axiosInstance, logger } = deps
  const { url, accessToken } = args

  return post(
    {
      axiosInstance,
      logger
    },
    {
      url,
      accessToken
    },
    validateOpenApiResponse
  )
}

export const revokeToken = async (
  deps: RouteDeps,
  args: GrantOrTokenRequestArgs,
  validateOpenApiResponse: ResponseValidator<void>
) => {
  const { axiosInstance, logger } = deps
  const { url, accessToken } = args

  return deleteRequest(
    {
      axiosInstance,
      logger
    },
    {
      url,
      accessToken
    },
    validateOpenApiResponse
  )
}

export const createTokenRoutes = (deps: RouteDeps): TokenRoutes => {
  const rotateTokenValidator =
    deps.openApi.createResponseValidator<AccessToken>({
      path: getASPath('/token/{id}'),
      method: HttpMethod.POST
    })

  const revokeTokenValidator = deps.openApi.createResponseValidator<void>({
    path: getASPath('/token/{id}'),
    method: HttpMethod.DELETE
  })

  return {
    rotate: (args: GrantOrTokenRequestArgs) =>
      rotateToken(deps, args, rotateTokenValidator),
    revoke: (args: GrantOrTokenRequestArgs) =>
      revokeToken(deps, args, revokeTokenValidator)
  }
}
