import { HttpMethod, ResponseValidator } from '@interledger/openapi'
import { ResourceRequestArgs, RouteDeps } from '.'
import { getASPath, AccessToken } from '../types'
import { deleteRequest, post } from './requests'

export interface TokenRoutes {
  rotate(args: ResourceRequestArgs): Promise<AccessToken>
  revoke(args: ResourceRequestArgs): Promise<void>
}

export const rotateToken = async (
  deps: RouteDeps,
  args: ResourceRequestArgs,
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
  args: ResourceRequestArgs,
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
    rotate: (args: ResourceRequestArgs) =>
      rotateToken(deps, args, rotateTokenValidator),
    revoke: (args: ResourceRequestArgs) =>
      revokeToken(deps, args, revokeTokenValidator)
  }
}
