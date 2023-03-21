import { KeyLike } from 'crypto'
import { createOpenAPI, OpenAPI } from '@interledger/openapi'
import path from 'path'
import createLogger, { Logger } from 'pino'
import config from '../config'
import {
  createIncomingPaymentRoutes,
  IncomingPaymentRoutes
} from './incoming-payment'
import {
  createILPStreamConnectionRoutes,
  ILPStreamConnectionRoutes
} from './ilp-stream-connection'
import {
  createPaymentPointerRoutes,
  PaymentPointerRoutes
} from './payment-pointer'
import { createAxiosInstance } from './requests'
import { AxiosInstance } from 'axios'
import { createGrantRoutes, GrantRoutes } from './grant'
import {
  createOutgoingPaymentRoutes,
  OutgoingPaymentRoutes
} from './outgoing-payment'
import { createTokenRoutes, TokenRoutes } from './token'
import { createQuoteRoutes, QuoteRoutes } from './quote'

export interface BaseDeps {
  axiosInstance: AxiosInstance
  logger: Logger
}

interface ClientDeps extends BaseDeps {
  resourceServerOpenApi: OpenAPI
  authServerOpenApi: OpenAPI
}

export interface RouteDeps extends BaseDeps {
  axiosInstance: AxiosInstance
  openApi: OpenAPI
  logger: Logger
}

export interface UnauthenticatedResourceRequestArgs {
  url: string
}

interface AuthenticatedRequestArgs {
  accessToken: string
}
export interface ResourceRequestArgs
  extends UnauthenticatedResourceRequestArgs,
    AuthenticatedRequestArgs {}

export interface CollectionRequestArgs extends AuthenticatedRequestArgs {
  paymentPointer: string
}

const createDeps = async (
  args: Partial<CreateAuthenticatedClientArgs>
): Promise<ClientDeps> => {
  const axiosInstance = createAxiosInstance({
    privateKey: args.privateKey,
    keyId: args.keyId,
    requestTimeoutMs:
      args?.requestTimeoutMs ?? config.DEFAULT_REQUEST_TIMEOUT_MS
  })
  const resourceServerOpenApi = await createOpenAPI(
    path.resolve(__dirname, '../openapi/resource-server.yaml')
  )
  const authServerOpenApi = await createOpenAPI(
    path.resolve(__dirname, '../openapi/auth-server.yaml')
  )
  const logger = args?.logger ?? createLogger()
  return {
    axiosInstance,
    resourceServerOpenApi,
    authServerOpenApi,
    logger
  }
}

export interface CreateUnauthenticatedClientArgs {
  requestTimeoutMs?: number
  logger?: Logger
}

export interface UnauthenticatedClient {
  ilpStreamConnection: ILPStreamConnectionRoutes
  paymentPointer: PaymentPointerRoutes
}

export const createUnauthenticatedClient = async (
  args: CreateUnauthenticatedClientArgs
): Promise<UnauthenticatedClient> => {
  const { axiosInstance, resourceServerOpenApi, logger } = await createDeps(
    args
  )

  return {
    ilpStreamConnection: createILPStreamConnectionRoutes({
      axiosInstance,
      openApi: resourceServerOpenApi,
      logger
    }),
    paymentPointer: createPaymentPointerRoutes({
      axiosInstance,
      openApi: resourceServerOpenApi,
      logger
    })
  }
}

export interface CreateAuthenticatedClientArgs
  extends CreateUnauthenticatedClientArgs {
  privateKey: KeyLike
  keyId: string
  paymentPointerUrl: string
}

export interface AuthenticatedClient extends UnauthenticatedClient {
  incomingPayment: IncomingPaymentRoutes
  outgoingPayment: OutgoingPaymentRoutes
  grant: GrantRoutes
  token: TokenRoutes
  quote: QuoteRoutes
}

export const createAuthenticatedClient = async (
  args: CreateAuthenticatedClientArgs
): Promise<AuthenticatedClient> => {
  const { axiosInstance, resourceServerOpenApi, authServerOpenApi, logger } =
    await createDeps(args)

  return {
    incomingPayment: createIncomingPaymentRoutes({
      axiosInstance,
      openApi: resourceServerOpenApi,
      logger
    }),
    outgoingPayment: createOutgoingPaymentRoutes({
      axiosInstance,
      openApi: resourceServerOpenApi,
      logger
    }),
    ilpStreamConnection: createILPStreamConnectionRoutes({
      axiosInstance,
      openApi: resourceServerOpenApi,
      logger
    }),
    paymentPointer: createPaymentPointerRoutes({
      axiosInstance,
      openApi: resourceServerOpenApi,
      logger
    }),
    grant: createGrantRoutes({
      axiosInstance,
      openApi: authServerOpenApi,
      logger,
      client: args.paymentPointerUrl
    }),
    token: createTokenRoutes({
      axiosInstance,
      openApi: authServerOpenApi,
      logger
    }),
    quote: createQuoteRoutes({
      axiosInstance,
      openApi: resourceServerOpenApi,
      logger
    })
  }
}
