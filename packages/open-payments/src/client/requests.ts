import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { KeyLike } from 'crypto'
import { ResponseValidator } from '@interledger/openapi'
import { BaseDeps } from '.'
import { createHeaders } from '@interledger/http-signature-utils'

interface GetArgs {
  url: string
  queryParams?: Record<string, unknown>
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

const removeEmptyValues = (obj: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null))

export const get = async <T>(
  deps: BaseDeps,
  args: GetArgs,
  openApiResponseValidator: ResponseValidator<T>
): Promise<T> => {
  const { axiosInstance, logger } = deps
  const { accessToken } = args

  const requestUrl = new URL(args.url)
  if (process.env.NODE_ENV === 'development') {
    requestUrl.protocol = 'http'
  }

  const url = requestUrl.href

  try {
    const { data, status } = await axiosInstance.get(url, {
      headers: accessToken
        ? {
            Authorization: `GNAP ${accessToken}`
          }
        : {},
      params: args.queryParams ? removeEmptyValues(args.queryParams) : undefined
    })

    try {
      openApiResponseValidator({
        status,
        body: data
      })
    } catch (error) {
      const errorMessage = 'Failed to validate OpenApi response'
      logger.error(
        {
          data: JSON.stringify(data),
          url,
          validationError: error && error['message']
        },
        errorMessage
      )

      throw new Error(errorMessage)
    }

    return data
  } catch (error) {
    const errorMessage = `Error when making Open Payments GET request: ${
      error && error['message'] ? error['message'] : 'Unknown error'
    }`
    logger.error({ url }, errorMessage)

    throw new Error(errorMessage)
  }
}

export const post = async <TRequest, TResponse>(
  deps: BaseDeps,
  args: PostArgs<TRequest>,
  openApiResponseValidator: ResponseValidator<TResponse>
): Promise<TResponse> => {
  const { axiosInstance, logger } = deps
  const { body, accessToken } = args

  const requestUrl = new URL(args.url)
  if (process.env.NODE_ENV === 'development') {
    requestUrl.protocol = 'http'
  }

  const url = requestUrl.href

  try {
    const { data, status } = await axiosInstance.post<TResponse>(url, body, {
      headers: accessToken
        ? {
            Authorization: `GNAP ${accessToken}`
          }
        : {}
    })

    try {
      openApiResponseValidator({
        status,
        body: data
      })
    } catch (error) {
      const errorMessage = 'Failed to validate OpenApi response'
      logger.error(
        {
          data: JSON.stringify(data),
          url,
          validationError: error && error['message']
        },
        errorMessage
      )

      throw new Error(errorMessage)
    }

    return data
  } catch (error) {
    const errorMessage = `Error when making Open Payments POST request: ${
      error && error['message'] ? error['message'] : 'Unknown error'
    }`
    logger.error({ url }, errorMessage)

    throw new Error(errorMessage)
  }
}

export const deleteRequest = async <TResponse>(
  deps: BaseDeps,
  args: DeleteArgs,
  openApiResponseValidator: ResponseValidator<TResponse>
): Promise<void> => {
  const { axiosInstance, logger } = deps
  const { accessToken } = args

  const requestUrl = new URL(args.url)
  if (process.env.NODE_ENV === 'development') {
    requestUrl.protocol = 'http'
  }

  const url = requestUrl.href

  try {
    const { data, status } = await axiosInstance.delete<TResponse>(url, {
      headers: accessToken
        ? {
            Authorization: `GNAP ${accessToken}`
          }
        : {}
    })

    try {
      openApiResponseValidator({
        status,
        body: data || undefined
      })
    } catch (error) {
      const errorMessage = 'Failed to validate OpenApi response'
      logger.error(
        {
          status,
          url,
          validationError: error && error['message']
        },
        errorMessage
      )

      throw new Error(errorMessage)
    }
  } catch (error) {
    const errorMessage = `Error when making Open Payments DELETE request: ${
      error && error['message'] ? error['message'] : 'Unknown error'
    }`
    logger.error({ url }, errorMessage)

    throw new Error(errorMessage)
  }
}

export const createAxiosInstance = (args: {
  requestTimeoutMs: number
  privateKey?: KeyLike
  keyId?: string
}): AxiosInstance => {
  const axiosInstance = axios.create({
    headers: {
      common: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    },
    timeout: args.requestTimeoutMs
  })

  if (args.privateKey !== undefined && args.keyId !== undefined) {
    const privateKey = args.privateKey
    const keyId = args.keyId
    axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (!config.method || !config.url) {
          throw new Error('Cannot intercept request: url or method missing')
        }
        const contentAndSigHeaders = await createHeaders({
          request: {
            method: config.method.toUpperCase(),
            url: config.url,
            headers: JSON.parse(JSON.stringify(config.headers)),
            body: config.data ? JSON.stringify(config.data) : undefined
          },
          privateKey,
          keyId
        })
        if (config.data) {
          config.headers['Content-Digest'] =
            contentAndSigHeaders['Content-Digest']
          config.headers['Content-Length'] =
            contentAndSigHeaders['Content-Length']
          config.headers['Content-Type'] = contentAndSigHeaders['Content-Type']
        }
        config.headers['Signature'] = contentAndSigHeaders['Signature']
        config.headers['Signature-Input'] =
          contentAndSigHeaders['Signature-Input']
        return config
      },
      undefined,
      {
        runWhen: (config: InternalAxiosRequestConfig) =>
          config.method?.toLowerCase() === 'post' ||
          !!(config.headers && config.headers['Authorization'])
      }
    )
  }

  return axiosInstance
}
