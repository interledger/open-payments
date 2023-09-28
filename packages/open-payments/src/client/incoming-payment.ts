import { HttpMethod, ResponseValidator } from '@interledger/openapi'
import {
  BaseDeps,
  CollectionRequestArgs,
  ResourceRequestArgs,
  RouteDeps
} from '.'
import {
  IncomingPayment,
  getRSPath,
  CreateIncomingPaymentArgs,
  PaginationArgs,
  IncomingPaymentPaginationResult
} from '../types'
import { get, post } from './requests'

export interface IncomingPaymentRoutes {
  get(args: ResourceRequestArgs): Promise<IncomingPayment>
  create(
    args: CollectionRequestArgs,
    createArgs: CreateIncomingPaymentArgs
  ): Promise<IncomingPayment>
  complete(args: ResourceRequestArgs): Promise<IncomingPayment>
  list(
    args: CollectionRequestArgs,
    pagination?: PaginationArgs
  ): Promise<IncomingPaymentPaginationResult>
}

export const createIncomingPaymentRoutes = (
  deps: RouteDeps
): IncomingPaymentRoutes => {
  const { axiosInstance, openApi, logger } = deps

  const getIncomingPaymentOpenApiValidator =
    openApi.createResponseValidator<IncomingPayment>({
      path: getRSPath('/incoming-payments/{id}'),
      method: HttpMethod.GET
    })

  const createIncomingPaymentOpenApiValidator =
    openApi.createResponseValidator<IncomingPayment>({
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
    get: (args: ResourceRequestArgs) =>
      getIncomingPayment(
        { axiosInstance, logger },
        args,
        getIncomingPaymentOpenApiValidator
      ),
    create: (
      requestArgs: CollectionRequestArgs,
      createArgs: CreateIncomingPaymentArgs
    ) =>
      createIncomingPayment(
        { axiosInstance, logger },
        requestArgs,
        createIncomingPaymentOpenApiValidator,
        createArgs
      ),
    complete: (args: ResourceRequestArgs) =>
      completeIncomingPayment(
        { axiosInstance, logger },
        args,
        completeIncomingPaymentOpenApiValidator
      ),
    list: (args: CollectionRequestArgs, pagination?: PaginationArgs) =>
      listIncomingPayment(
        { axiosInstance, logger },
        args,
        listIncomingPaymentOpenApiValidator,
        pagination
      )
  }
}

export const getIncomingPayment = async (
  deps: BaseDeps,
  args: ResourceRequestArgs,
  validateOpenApiResponse: ResponseValidator<IncomingPayment>
) => {
  const { axiosInstance, logger } = deps
  const { url } = args

  const incomingPayment = await get(
    { axiosInstance, logger },
    args,
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

export const createIncomingPayment = async (
  deps: BaseDeps,
  requestArgs: CollectionRequestArgs,
  validateOpenApiResponse: ResponseValidator<IncomingPayment>,
  createArgs: CreateIncomingPaymentArgs
) => {
  const { axiosInstance, logger } = deps
  const { walletAddress, accessToken } = requestArgs
  const url = `${walletAddress}${getRSPath('/incoming-payments')}`

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
  args: ResourceRequestArgs,
  validateOpenApiResponse: ResponseValidator<IncomingPayment>
) => {
  const { axiosInstance, logger } = deps
  const { url: incomingPaymentUrl, accessToken } = args
  const url = `${incomingPaymentUrl}/complete`

  const incomingPayment = await post(
    { axiosInstance, logger },
    { url, accessToken },
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
  args: CollectionRequestArgs,
  validateOpenApiResponse: ResponseValidator<IncomingPaymentPaginationResult>,
  pagination?: PaginationArgs
) => {
  const { axiosInstance, logger } = deps
  const { accessToken, walletAddress } = args

  const url = `${walletAddress}${getRSPath('/incoming-payments')}`

  const incomingPayments = await get(
    { axiosInstance, logger },
    {
      url,
      accessToken,
      ...(pagination ? { queryParams: { ...pagination } } : {})
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

export const validateIncomingPayment = (
  payment: IncomingPayment
): IncomingPayment => {
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
  payment: IncomingPayment
): IncomingPayment => {
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
