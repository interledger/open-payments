import { HttpMethod, ResponseValidator } from '@interledger/openapi'
import {
  BaseDeps,
  ResourceRequestArgs,
  CollectionRequestArgs,
  RouteDeps,
  OpenPaymentsClientError
} from '.'
import {
  CreateOutgoingPaymentArgs,
  getRSPath,
  OutgoingPayment,
  OutgoingPaymentPaginationResult,
  PaginationArgs
} from '../types'
import { get, post } from './requests'

export interface OutgoingPaymentRoutes {
  get(args: ResourceRequestArgs): Promise<OutgoingPayment>
  list(
    args: CollectionRequestArgs,
    pagination?: PaginationArgs
  ): Promise<OutgoingPaymentPaginationResult>
  create(
    requestArgs: ResourceRequestArgs,
    createArgs: CreateOutgoingPaymentArgs
  ): Promise<OutgoingPayment>
}

export const createOutgoingPaymentRoutes = (
  deps: RouteDeps
): OutgoingPaymentRoutes => {
  const { axiosInstance, openApi, logger } = deps

  const getOutgoingPaymentOpenApiValidator =
    openApi.createResponseValidator<OutgoingPayment>({
      path: getRSPath('/outgoing-payments/{id}'),
      method: HttpMethod.GET
    })

  const listOutgoingPaymentOpenApiValidator =
    openApi.createResponseValidator<OutgoingPaymentPaginationResult>({
      path: getRSPath('/outgoing-payments'),
      method: HttpMethod.GET
    })

  const createOutgoingPaymentOpenApiValidator =
    openApi.createResponseValidator<OutgoingPayment>({
      path: getRSPath('/outgoing-payments'),
      method: HttpMethod.POST
    })

  return {
    get: (requestArgs: ResourceRequestArgs) =>
      getOutgoingPayment(
        { axiosInstance, logger },
        requestArgs,
        getOutgoingPaymentOpenApiValidator
      ),
    list: (requestArgs: CollectionRequestArgs, pagination?: PaginationArgs) =>
      listOutgoingPayments(
        { axiosInstance, logger },
        requestArgs,
        listOutgoingPaymentOpenApiValidator,
        pagination
      ),
    create: (
      requestArgs: ResourceRequestArgs,
      createArgs: CreateOutgoingPaymentArgs
    ) =>
      createOutgoingPayment(
        { axiosInstance, logger },
        requestArgs,
        createOutgoingPaymentOpenApiValidator,
        createArgs
      )
  }
}

export const getOutgoingPayment = async (
  deps: BaseDeps,
  requestArgs: ResourceRequestArgs,
  validateOpenApiResponse: ResponseValidator<OutgoingPayment>
) => {
  const { axiosInstance, logger } = deps
  const { url, accessToken } = requestArgs

  const outgoingPayment = await get(
    { axiosInstance, logger },
    {
      url,
      accessToken
    },
    validateOpenApiResponse
  )

  try {
    return validateOutgoingPayment(outgoingPayment)
  } catch (error) {
    return handleValidationError(
      deps,
      error,
      url,
      'Could not validate outgoing payment'
    )
  }
}

export const createOutgoingPayment = async (
  deps: BaseDeps,
  requestArgs: ResourceRequestArgs,
  validateOpenApiResponse: ResponseValidator<OutgoingPayment>,
  createArgs: CreateOutgoingPaymentArgs
) => {
  const { axiosInstance, logger } = deps
  const { url: baseUrl, accessToken } = requestArgs
  const url = `${baseUrl}${getRSPath('/outgoing-payments')}`

  const outgoingPayment = await post(
    { axiosInstance, logger },
    { url, body: createArgs, accessToken },
    validateOpenApiResponse
  )

  try {
    return validateOutgoingPayment(outgoingPayment)
  } catch (error) {
    return handleValidationError(
      deps,
      error,
      url,
      'Could not create outgoing payment'
    )
  }
}

export const listOutgoingPayments = async (
  deps: BaseDeps,
  requestArgs: CollectionRequestArgs,
  validateOpenApiResponse: ResponseValidator<OutgoingPaymentPaginationResult>,
  pagination?: PaginationArgs
) => {
  const { axiosInstance, logger } = deps
  const { url: baseUrl, accessToken, walletAddress } = requestArgs
  const url = `${baseUrl}${getRSPath('/outgoing-payments')}`

  const outgoingPayments = await get(
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

  for (const outgoingPayment of outgoingPayments.result) {
    try {
      validateOutgoingPayment(outgoingPayment)
    } catch (error) {
      return handleValidationError(
        deps,
        error,
        url,
        'Could not validate an outgoing payment'
      )
    }
  }

  return outgoingPayments
}

const handleValidationError = (
  deps: BaseDeps,
  error: unknown,
  url: string,
  errorMessage: string
): never => {
  const validationError =
    error instanceof Error ? error.message : 'Unknown error'
  deps.logger.error({ url, validationError }, errorMessage)

  throw new OpenPaymentsClientError(errorMessage, {
    description: validationError,
    validationErrors: [validationError]
  })
}

export const validateOutgoingPayment = (
  payment: OutgoingPayment
): OutgoingPayment => {
  const { debitAmount, sentAmount } = payment
  if (
    debitAmount.assetCode !== sentAmount.assetCode ||
    debitAmount.assetScale !== sentAmount.assetScale
  ) {
    throw new Error(
      'Asset code or asset scale of sending amount does not match sent amount'
    )
  }
  if (BigInt(debitAmount.value) < BigInt(sentAmount.value)) {
    throw new Error('Amount sent is larger than maximum amount to send')
  }
  if (debitAmount.value === sentAmount.value && payment.failed) {
    throw new Error('Amount to send matches sent amount but payment failed')
  }

  return payment
}
