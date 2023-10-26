import { parseKey } from '@interledger/http-signature-utils'
import { createOpenAPI, OpenAPI } from '@interledger/openapi'
import path from 'path'
import createLogger, { Logger } from 'pino'
import config from '../config'
import {
  createIncomingPaymentRoutes,
  createUnauthenticatedIncomingPaymentRoutes,
  IncomingPaymentRoutes,
  UnauthenticatedIncomingPaymentRoutes
} from './incoming-payment'
import {
  createWalletAddressRoutes,
  WalletAddressRoutes
} from './wallet-address'
import { createAxiosInstance } from './requests'
import { AxiosInstance } from 'axios'
import { createGrantRoutes, GrantRoutes } from './grant'
import {
  createOutgoingPaymentRoutes,
  OutgoingPaymentRoutes
} from './outgoing-payment'
import { createTokenRoutes, TokenRoutes } from './token'
import { createQuoteRoutes, QuoteRoutes } from './quote'
import { KeyLike } from 'crypto'

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
  /**
   * The full URL of the requested resource.
   *
   * For example, if the requested resource is an incoming payment:
   * ```
   * https://openpayments.guide/incoming-payments/08394f02-7b7b-45e2-b645-51d04e7c330c`
   * ```
   */
  url: string
}

interface AuthenticatedRequestArgs {
  /**
   * The access token required to access the resource.
   * This token is provided when a grant is created.
   *
   * @see [Open Payments - Grant Request](https://docs.openpayments.guide/reference/post-request)
   */
  accessToken: string
}

export interface GrantOrTokenRequestArgs
  extends UnauthenticatedResourceRequestArgs,
    AuthenticatedRequestArgs {}

export interface ResourceRequestArgs
  extends UnauthenticatedResourceRequestArgs,
    AuthenticatedRequestArgs {}

export interface CollectionRequestArgs
  extends UnauthenticatedResourceRequestArgs,
    AuthenticatedRequestArgs {
  /**
   * The wallet address URL of the requested collection.
   *
   * Example:
   * ```
   * https://openpayments.guide/alice`
   * ```
   */
  walletAddress: string
}

const createDeps = async (
  args: Partial<CreateAuthenticatedClientArgs>
): Promise<ClientDeps> => {
  const logger = args?.logger ?? createLogger({ name: 'Open Payments Client' })

  let privateKey: KeyLike | undefined

  try {
    if (args.privateKeyFilePath) {
      privateKey = parseKey(
        path.resolve(process.cwd(), args.privateKeyFilePath)
      )
    }
  } catch (error) {
    const errorMessage = `Could not load private key. ${
      error instanceof Error ? error.message : 'Unknown error'
    }`

    logger.error(errorMessage)

    throw new Error(errorMessage)
  }

  const axiosInstance = createAxiosInstance({
    privateKey,
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

  return {
    axiosInstance,
    resourceServerOpenApi,
    authServerOpenApi,
    logger
  }
}

export interface CreateUnauthenticatedClientArgs {
  /** Milliseconds to wait before timing out an HTTP request */
  requestTimeoutMs?: number
  /** The custom logger instance to use. This defaults to the pino logger. */
  logger?: Logger
}

export interface UnauthenticatedClient {
  walletAddress: WalletAddressRoutes
  incomingPayment: UnauthenticatedIncomingPaymentRoutes
}

/**
 * Creates an OpenPayments client that is only able to make requests for public fields.
 */
export const createUnauthenticatedClient = async (
  args: CreateUnauthenticatedClientArgs
): Promise<UnauthenticatedClient> => {
  const { axiosInstance, resourceServerOpenApi, logger } = await createDeps(
    args
  )

  return {
    walletAddress: createWalletAddressRoutes({
      axiosInstance,
      openApi: resourceServerOpenApi,
      logger
    }),
    incomingPayment: createUnauthenticatedIncomingPaymentRoutes({
      axiosInstance,
      openApi: resourceServerOpenApi,
      logger
    })
  }
}

export interface CreateAuthenticatedClientArgs
  extends CreateUnauthenticatedClientArgs {
  /** The path to the file containing the EdDSA-Ed25519 key with which requests will be signed */
  privateKeyFilePath: string
  /** The key identifier referring to the private key */
  keyId: string
  /** The wallet address which the client will identify itself by */
  walletAddressUrl: string
}

export interface AuthenticatedClient
  extends Omit<UnauthenticatedClient, 'incomingPayment'> {
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
    walletAddress: createWalletAddressRoutes({
      axiosInstance,
      openApi: resourceServerOpenApi,
      logger
    }),
    grant: createGrantRoutes({
      axiosInstance,
      openApi: authServerOpenApi,
      logger,
      client: args.walletAddressUrl
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
