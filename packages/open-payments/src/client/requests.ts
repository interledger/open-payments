import { KeyObject } from 'crypto'
import { ResponseValidator, isValidationError } from '@interledger/openapi'
import { BaseDeps } from '.'
import { createHeaders } from '@interledger/http-signature-utils'
import { OpenPaymentsClientError } from './error'
import { Logger } from 'pino'

import type { KyInstance, NormalizedOptions } from 'ky'

interface GetArgs {
  url: string
  queryParams?: Record<string, string | number | undefined>
  accessToken?: string
}

interface PostArgs<T = undefined> {
  url: string
  body?: T
  accessToken?: string
}

interface DeleteArgs {
  url: string
  accessToken?: string
}

export const get = async <T>(
  deps: BaseDeps,
  args: GetArgs,
  openApiResponseValidator?: ResponseValidator<T>
): Promise<T> => {
  const { httpClient } = deps
  const { accessToken } = args

  const urlWithUpdatedProtocol = checkUrlProtocol(deps, args.url)
  const url = getUrlWithQueryParams(urlWithUpdatedProtocol, args.queryParams)

  try {
    const response = await httpClient.get(url, {
      headers: accessToken
        ? {
            Authorization: `GNAP ${accessToken}`
          }
        : {}
    })

    const responseBody = await response.json<T>()

    if (openApiResponseValidator) {
      openApiResponseValidator({
        status: response.status,
        body: responseBody
      })
    }

    return responseBody
  } catch (error) {
    return handleError(deps, { url, error, requestType: 'GET' })
  }
}

const getUrlWithQueryParams = (
  url: string,
  queryParams?: Record<string, string | number | undefined>
): string => {
  if (!queryParams) {
    return url
  }

  const urlObject = new URL(url)

  for (const [key, value] of Object.entries(queryParams)) {
    if (value) {
      urlObject.searchParams.set(key, value.toString())
    }
  }

  return urlObject.href
}

export const post = async <TRequest, TResponse>(
  deps: BaseDeps,
  args: PostArgs<TRequest>,
  openApiResponseValidator?: ResponseValidator<TResponse>
): Promise<TResponse> => {
  const { httpClient } = deps
  const { body, accessToken } = args

  const url = checkUrlProtocol(deps, args.url)

  try {
    const response = await httpClient.post(url, {
      json: body,
      headers: accessToken
        ? {
            Authorization: `GNAP ${accessToken}`
          }
        : {}
    })

    const responseBody = await response.json<TResponse>()

    if (openApiResponseValidator) {
      openApiResponseValidator({
        status: response.status,
        body: responseBody
      })
    }

    return responseBody
  } catch (error) {
    return handleError(deps, { url, error, requestType: 'POST' })
  }
}

export const deleteRequest = async <TResponse>(
  deps: BaseDeps,
  args: DeleteArgs,
  openApiResponseValidator?: ResponseValidator<TResponse>
): Promise<void> => {
  const { httpClient } = deps
  const { accessToken } = args

  const url = checkUrlProtocol(deps, args.url)

  try {
    const response = await httpClient.delete(url, {
      headers: accessToken
        ? {
            Authorization: `GNAP ${accessToken}`
          }
        : {}
    })

    if (openApiResponseValidator) {
      openApiResponseValidator({
        status: response.status,
        body: undefined
      })
    }
  } catch (error) {
    return handleError(deps, { url, error, requestType: 'DELETE' })
  }
}

interface HandleErrorArgs {
  error: unknown
  url: string
  requestType: 'POST' | 'DELETE' | 'GET'
}

export const handleError = async (
  deps: BaseDeps,
  args: HandleErrorArgs
): Promise<never> => {
  const { error, url, requestType } = args

  let errorDescription
  let errorStatus
  let validationErrors
  let errorCode
  let errorDetails

  const { HTTPError } = await import('ky')

  if (error instanceof HTTPError) {
    let responseBody:
      | {
          error: {
            description: string
            code: string
            details: Record<string, unknown>
          }
        }
      | string
      | undefined

    try {
      responseBody = await error.response.text()
      responseBody = JSON.parse(responseBody)
    } catch {
      // Ignore if we can't parse the response body (or no body exists)
    }

    errorStatus = error.response.status
    errorDescription =
      typeof responseBody === 'object'
        ? responseBody.error?.description || JSON.stringify(responseBody)
        : responseBody || error.message
    errorCode =
      typeof responseBody === 'object' ? responseBody.error?.code : undefined
    errorDetails =
      typeof responseBody === 'object' ? responseBody.error?.details : undefined
  } else if (isValidationError(error)) {
    errorDescription = 'Could not validate OpenAPI response'
    validationErrors = error.errors.map((e) => e.message)
    errorStatus = error.status
  } else if (error instanceof Error) {
    errorDescription = error.message
  } else {
    errorDescription = 'Received unexpected error'
    deps.logger.error({ err: error })
  }

  const errorMessage = `Error making Open Payments ${requestType} request`
  deps.logger.error(
    {
      method: requestType,
      url,
      status: errorStatus,
      description: errorDescription,
      code: errorCode
    },
    errorMessage
  )

  throw new OpenPaymentsClientError(errorMessage, {
    description: errorDescription,
    validationErrors,
    status: errorStatus,
    code: errorCode,
    details: errorDetails
  })
}

const checkUrlProtocol = (deps: BaseDeps, url: string): string => {
  const requestUrl = new URL(url)
  if (deps.useHttp) {
    requestUrl.protocol = 'http'
  }

  return requestUrl.href
}

interface CreateHttpClientArgs {
  logger: Logger
  requestTimeoutMs: number
  requestSigningArgs?: AuthenticatedHttpClientArgs
}

type AuthenticatedHttpClientArgs =
  | { privateKey: KeyObject; keyId: string }
  | { authenticatedRequestInterceptor: InterceptorFn }

export type HttpClient = KyInstance

export type InterceptorFn = (
  request: Request
) => Request | Promise<Request> | void | Promise<void>

export const createHttpClient = async (
  args: CreateHttpClientArgs
): Promise<HttpClient> => {
  const { default: ky } = await import('ky')

  const { requestTimeoutMs, requestSigningArgs, logger } = args

  const kyInstance = ky.create({
    timeout: requestTimeoutMs,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })

  const beforeRequestHooks = []
  const afterResponseHooks = []

  const requestLogger: InterceptorFn = async (request) => {
    const requestBody = request.body ? await request.clone().json() : undefined

    logger.debug(
      {
        method: request.method,
        url: request.url,
        body: requestBody
      },
      'Sending request'
    )
  }

  const responseLogger = async (
    request: Request,
    _: NormalizedOptions,
    response: Response
  ) => {
    let responseBody
    try {
      responseBody = await response.clone().text()
      responseBody = JSON.parse(responseBody)
    } catch {
      // Ignore if we can't parse the response body (or no body exists)
    }

    logger.debug(
      {
        method: request.method,
        url: response.url,
        body: responseBody,
        status: response.status
      },
      'Received response'
    )
  }

  beforeRequestHooks.push(requestLogger)
  afterResponseHooks.push(responseLogger)

  if (requestSigningArgs) {
    let requestInterceptor: InterceptorFn | undefined
    if ('authenticatedRequestInterceptor' in requestSigningArgs) {
      requestInterceptor = (request) => {
        if (requestShouldBeAuthorized(request)) {
          return requestSigningArgs.authenticatedRequestInterceptor(request)
        }

        return request
      }
    } else {
      requestInterceptor = (request) => {
        const { privateKey, keyId } = requestSigningArgs

        if (requestShouldBeAuthorized(request)) {
          return signRequest(request, { privateKey, keyId })
        }

        return request
      }
    }

    beforeRequestHooks.push(requestInterceptor)
  }

  return kyInstance.extend({
    hooks: {
      beforeRequest: beforeRequestHooks,
      afterResponse: afterResponseHooks
    }
  })
}

export const requestShouldBeAuthorized = (request: Request) =>
  request.method?.toLowerCase() === 'post' ||
  request.headers.has('Authorization')

export const signRequest = async (
  request: Request,
  args: {
    privateKey?: KeyObject
    keyId?: string
  }
): Promise<Request> => {
  const { privateKey, keyId } = args

  if (!privateKey || !keyId) {
    return request
  }

  const requestBody = request.body ? await request.clone().json() : undefined // Request body can only ever be read once, so we clone the original request

  const contentAndSigHeaders = await createHeaders({
    request: {
      method: request.method.toUpperCase(),
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      body: requestBody ? JSON.stringify(requestBody) : undefined
    },
    privateKey,
    keyId
  })

  if (requestBody) {
    request.headers.set(
      'Content-Digest',
      contentAndSigHeaders['Content-Digest'] as string
    )
    request.headers.set(
      'Content-Length',
      contentAndSigHeaders['Content-Length'] as string
    )
    request.headers.set(
      'Content-Type',
      contentAndSigHeaders['Content-Type'] as string
    )
  }

  request.headers.set('Signature', contentAndSigHeaders['Signature'])
  request.headers.set(
    'Signature-Input',
    contentAndSigHeaders['Signature-Input']
  )

  return request
}
