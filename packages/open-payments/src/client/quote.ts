import { HttpMethod, ResponseValidator } from '@interledger/openapi'
import { ResourceRequestArgs, BaseDeps, RouteDeps } from '.'
import { CreateQuoteArgs, getRSPath, Quote } from '../types'
import { get, post } from './requests'

export interface QuoteRoutes {
  get(args: ResourceRequestArgs): Promise<Quote>
  create(
    createArgs: ResourceRequestArgs,
    createQuoteArgs: CreateQuoteArgs
  ): Promise<Quote>
}

export const createQuoteRoutes = (deps: RouteDeps): QuoteRoutes => {
  const { axiosInstance, openApi, logger, useHttp } = deps

  const getQuoteOpenApiValidator = openApi.createResponseValidator<Quote>({
    path: getRSPath('/quotes/{id}'),
    method: HttpMethod.GET
  })

  const createQuoteOpenApiValidator = openApi.createResponseValidator<Quote>({
    path: getRSPath('/quotes'),
    method: HttpMethod.POST
  })

  return {
    get: (args: ResourceRequestArgs) =>
      getQuote(
        { axiosInstance, logger, useHttp },
        args,
        getQuoteOpenApiValidator
      ),
    create: (
      createArgs: ResourceRequestArgs,
      createQuoteArgs: CreateQuoteArgs
    ) =>
      createQuote(
        { axiosInstance, logger, useHttp },
        createArgs,
        createQuoteOpenApiValidator,
        createQuoteArgs
      )
  }
}

export const getQuote = async (
  deps: BaseDeps,
  args: ResourceRequestArgs,
  validateOpenApiResponse: ResponseValidator<Quote>
) => {
  const { axiosInstance, logger, useHttp } = deps

  const quote = await get(
    { axiosInstance, logger, useHttp },
    args,
    validateOpenApiResponse
  )

  return quote
}

export const createQuote = async (
  deps: BaseDeps,
  createArgs: ResourceRequestArgs,
  validateOpenApiResponse: ResponseValidator<Quote>,
  createQuoteArgs: CreateQuoteArgs
) => {
  const { axiosInstance, logger, useHttp } = deps
  const { accessToken, url: baseUrl } = createArgs
  const url = `${baseUrl}${getRSPath('/quotes')}`

  const quote = await post(
    { axiosInstance, logger, useHttp },
    { url, accessToken, body: createQuoteArgs },
    validateOpenApiResponse
  )

  return quote
}
