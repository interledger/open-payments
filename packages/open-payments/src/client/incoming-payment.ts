import { HttpMethod, ResponseValidator } from '@interledger/openapi'
import {
  BaseDeps,
  ResourceOrCollectionRequestArgs,
  RouteDeps,
  UnauthenticatedRequestArgs
} from '.'
import {
  IncomingPayment,
  getRSPath,
  CreateIncomingPaymentArgs,
  PaginationArgs,
  IncomingPaymentPaginationResult,
  PublicIncomingPayment,
  IncomingPaymentWithPaymentMethods
} from '../types'
import { get, post } from './requests'

type AnyIncomingPayment = IncomingPayment | IncomingPaymentWithPaymentMethods

export interface IncomingPaymentRoutes {
  get(
    args: ResourceOrCollectionRequestArgs
  ): Promise<IncomingPaymentWithPaymentMethods>
  getPublic(
    args: ResourceOrCollectionRequestArgs
  ): Promise<PublicIncomingPayment>
  create(
    args: ResourceOrCollectionRequestArgs,
    createArgs: CreateIncomingPaymentArgs
  ): Promise<IncomingPaymentWithPaymentMethods>
  complete(args: ResourceOrCollectionRequestArgs): Promise<IncomingPayment>
  list(
    args: ResourceOrCollectionRequestArgs,
    pagination?: PaginationArgs
  ): Promise<IncomingPaymentPaginationResult>
}

export const createIncomingPaymentRoutes = (
  deps: RouteDeps
): IncomingPaymentRoutes => {
  const { axiosInstance, openApi, logger } = deps

  const getIncomingPaymentOpenApiValidator =
    openApi.createResponseValidator<IncomingPaymentWithPaymentMethods>({
      path: getRSPath('/incoming-payments/{id}'),
      method: HttpMethod.GET
    })

  const getPublicIncomingPaymentOpenApiValidator =
    openApi.createResponseValidator<PublicIncomingPayment>({
      path: getRSPath('/incoming-payments/{id}'),
      method: HttpMethod.GET
    })

  const createIncomingPaymentOpenApiValidator =
    openApi.createResponseValidator<IncomingPaymentWithPaymentMethods>({
      path: getRSPath('/incoming-payments'),
      method: HttpMethod.POST
    })

  const completeIncomingPaymentOpenApiValidator =
    openApi.createResponseValidator<IncomingPayment>({
      path: getRSPath('/incoming-payments/{id}/complete'),
      method: HttpMethod.POST
    })

  const listIncomingPaymentOpenApiValidator =
    openApi.createResponseValidator<IncomingPaymentPaginationResult>({
      path: getRSPath('/incoming-payments'),
      method: HttpMethod.GET
    })

  return {
    get: (args: ResourceOrCollectionRequestArgs) =>
      getIncomingPayment(
        { axiosInstance, logger },
        args,
        getIncomingPaymentOpenApiValidator
      ),
    getPublic: (args: ResourceOrCollectionRequestArgs) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { accessToken, ...argsWithoutAccessToken } = args
      return getPublicIncomingPayment(
        { axiosInstance, logger },
        argsWithoutAccessToken,
        getPublicIncomingPaymentOpenApiValidator
      )
    },
    create: (
      requestArgs: ResourceOrCollectionRequestArgs,
      createArgs: CreateIncomingPaymentArgs
    ) =>
      createIncomingPayment(
        { axiosInstance, logger },
        requestArgs,
        createIncomingPaymentOpenApiValidator,
        createArgs
      ),
    complete: (args: ResourceOrCollectionRequestArgs) =>
      completeIncomingPayment(
        { axiosInstance, logger },
        args,
        completeIncomingPaymentOpenApiValidator
      ),
    list: (
      args: ResourceOrCollectionRequestArgs,
      pagination?: PaginationArgs
    ) =>
      listIncomingPayment(
        { axiosInstance, logger },
        args,
        listIncomingPaymentOpenApiValidator,
        pagination
      )
  }
}

export interface UnauthenticatedIncomingPaymentRoutes {
  get(args: UnauthenticatedRequestArgs): Promise<PublicIncomingPayment>
}

export const createUnauthenticatedIncomingPaymentRoutes = (
  deps: RouteDeps
): UnauthenticatedIncomingPaymentRoutes => {
  const { axiosInstance, openApi, logger } = deps

  const getPublicIncomingPaymentOpenApiValidator =
    openApi.createResponseValidator<PublicIncomingPayment>({
      path: getRSPath('/incoming-payments/{id}'),
      method: HttpMethod.GET
    })

  return {
    get: (args: UnauthenticatedRequestArgs) =>
      getPublicIncomingPayment(
        { axiosInstance, logger },
        args,
        getPublicIncomingPaymentOpenApiValidator
      )
  }
}

export const getIncomingPayment = async (
  deps: BaseDeps,
  args: ResourceOrCollectionRequestArgs,
  validateOpenApiResponse: ResponseValidator<IncomingPaymentWithPaymentMethods>
) => {
  const { axiosInstance, logger } = deps
  const { url, walletAddress } = args

  const incomingPayment = await get(
    { axiosInstance, logger },
    {
      ...args,
      queryParams: {
        'wallet-address': walletAddress
      }
    },
    validateOpenApiResponse
  )

  try {
    return validateIncomingPayment(incomingPayment)
  } catch (error) {
    const errorMessage = 'Could not validate incoming payment'
    logger.error(
      { url, validateError: error && error['message'] },
      errorMessage
    )

    throw new Error(errorMessage)
  }
}

export const getPublicIncomingPayment = async (
  deps: BaseDeps,
  args: UnauthenticatedRequestArgs,
  validateOpenApiResponse: ResponseValidator<PublicIncomingPayment>
) => {
  const { axiosInstance, logger } = deps
  return await get({ axiosInstance, logger }, args, validateOpenApiResponse)
}

export const createIncomingPayment = async (
  deps: BaseDeps,
  requestArgs: ResourceOrCollectionRequestArgs,
  validateOpenApiResponse: ResponseValidator<IncomingPaymentWithPaymentMethods>,
  createArgs: CreateIncomingPaymentArgs
) => {
  const { axiosInstance, logger } = deps
  const { url: baseUrl, accessToken } = requestArgs
  const url = `${baseUrl}${getRSPath('/incoming-payments')}`

  const incomingPayment = await post(
    { axiosInstance, logger },
    { url, accessToken, body: createArgs },
    validateOpenApiResponse
  )

  try {
    return validateCreatedIncomingPayment(incomingPayment)
  } catch (error) {
    const errorMessage = 'Could not validate incoming Payment'
    logger.error(
      { url, validateError: error && error['message'] },
      errorMessage
    )

    throw new Error(errorMessage)
  }
}

export const completeIncomingPayment = async (
  deps: BaseDeps,
  args: ResourceOrCollectionRequestArgs,
  validateOpenApiResponse: ResponseValidator<IncomingPayment>
) => {
  const { axiosInstance, logger } = deps
  const { url: incomingPaymentUrl, accessToken, walletAddress } = args
  const url = `${incomingPaymentUrl}/complete`

  const incomingPayment = await post(
    { axiosInstance, logger },
    { url, accessToken, body: { walletAddress } },
    validateOpenApiResponse
  )

  try {
    return validateCompletedIncomingPayment(incomingPayment)
  } catch (error) {
    const errorMessage = 'Could not validate incoming payment'
    logger.error(
      { url, validateError: error && error['message'] },
      errorMessage
    )

    throw new Error(errorMessage)
  }
}

export const listIncomingPayment = async (
  deps: BaseDeps,
  args: ResourceOrCollectionRequestArgs,
  validateOpenApiResponse: ResponseValidator<IncomingPaymentPaginationResult>,
  pagination?: PaginationArgs
) => {
  const { axiosInstance, logger } = deps
  const { url: baseUrl, accessToken, walletAddress } = args

  const url = `${baseUrl}${getRSPath('/incoming-payments')}`

  const incomingPayments = await get(
    { axiosInstance, logger },
    {
      url,
      accessToken,
      ...(pagination
        ? { queryParams: { ...pagination, 'wallet-address': walletAddress } }
        : { queryParams: { 'wallet-address': walletAddress } })
    },
    validateOpenApiResponse
  )

  for (const incomingPayment of incomingPayments.result) {
    try {
      validateIncomingPayment(incomingPayment)
    } catch (error) {
      const errorMessage = 'Could not validate incoming payment'
      logger.error(
        {
          url,
          validateError: error && error['message'],
          incomingPaymentId: incomingPayment.id
        },
        errorMessage
      )

      throw new Error(errorMessage)
    }
  }

  return incomingPayments
}

export const validateIncomingPayment = <T extends AnyIncomingPayment>(
  payment: T
): T => {
  if (payment.incomingAmount) {
    const { incomingAmount, receivedAmount } = payment
    if (
      incomingAmount.assetCode !== receivedAmount.assetCode ||
      incomingAmount.assetScale !== receivedAmount.assetScale
    ) {
      throw new Error(
        'Incoming amount asset code or asset scale does not match up received amount'
      )
    }
    if (BigInt(incomingAmount.value) < BigInt(receivedAmount.value)) {
      throw new Error('Received amount is larger than incoming amount')
    }
    if (incomingAmount.value === receivedAmount.value && !payment.completed) {
      throw new Error(
        'Incoming amount matches received amount but payment is not completed'
      )
    }
  }

  return payment
}

export const validateCreatedIncomingPayment = (
  payment: IncomingPaymentWithPaymentMethods
): IncomingPaymentWithPaymentMethods => {
  const { receivedAmount, completed } = payment

  if (BigInt(receivedAmount.value) !== BigInt(0)) {
    throw new Error('Received amount is a non-zero value.')
  }

  if (completed) {
    throw new Error('Can not create a completed incoming payment.')
  }

  return validateIncomingPayment(payment)
}

export const validateCompletedIncomingPayment = (
  payment: IncomingPayment
): IncomingPayment => {
  const { completed } = payment

  if (!completed) {
    throw new Error('Incoming payment could not be completed.')
  }

  return validateIncomingPayment(payment)
}
