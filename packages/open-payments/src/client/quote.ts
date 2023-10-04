import { HttpMethod, ResponseValidator } from '@interledger/openapi'
import { ResourceOrCollectionRequestArgs, BaseDeps, RouteDeps } from '.'
import { CreateQuoteArgs, getRSPath, Quote } from '../types'
import { get, post } from './requests'

export interface QuoteRoutes {
  get(args: ResourceOrCollectionRequestArgs): Promise<Quote>
  create(
    createArgs: ResourceOrCollectionRequestArgs,
    createQuoteArgs: CreateQuoteArgs
  ): Promise<Quote>
}

export const createQuoteRoutes = (deps: RouteDeps): QuoteRoutes => {
  const { axiosInstance, openApi, logger } = deps

  const getQuoteOpenApiValidator = openApi.createResponseValidator<Quote>({
    path: getRSPath('/quotes/{id}'),
    method: HttpMethod.GET
  })

  const createQuoteOpenApiValidator = openApi.createResponseValidator<Quote>({
    path: getRSPath('/quotes'),
    method: HttpMethod.POST
  })

  return {
    get: (args: ResourceOrCollectionRequestArgs) =>
      getQuote({ axiosInstance, logger }, args, getQuoteOpenApiValidator),
    create: (
      createArgs: ResourceOrCollectionRequestArgs,
      createQuoteArgs: CreateQuoteArgs
    ) =>
      createQuote(
        { axiosInstance, logger },
        createArgs,
        createQuoteOpenApiValidator,
        createQuoteArgs
      )
  }
}

export const getQuote = async (
  deps: BaseDeps,
  args: ResourceOrCollectionRequestArgs,
  validateOpenApiResponse: ResponseValidator<Quote>
) => {
  const { axiosInstance, logger } = deps

  const quote = await get(
    { axiosInstance, logger },
    args,
    validateOpenApiResponse
  )

  return quote
}

export const createQuote = async (
  deps: BaseDeps,
  createArgs: ResourceOrCollectionRequestArgs,
  validateOpenApiResponse: ResponseValidator<Quote>,
  createQuoteArgs: CreateQuoteArgs
) => {
  const { axiosInstance, logger } = deps
  const { accessToken, walletAddress } = createArgs
  const url = `${walletAddress}${getRSPath('/quotes')}`

  const quote = await post(
    { axiosInstance, logger },
    { url, accessToken, body: createQuoteArgs },
    validateOpenApiResponse
  )

  return quote
}
