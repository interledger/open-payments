import { loadKey } from '@interledger/http-signature-utils'
import fs from 'fs'
import { OpenAPI } from '@interledger/openapi'
import path from 'path'
import createLogger, { LevelWithSilent, Logger } from 'pino'
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
import { createHttpClient, HttpClient, InterceptorFn } from './requests'

import { createGrantRoutes, GrantRoutes } from './grant'
import {
  createOutgoingPaymentRoutes,
  OutgoingPaymentRoutes
} from './outgoing-payment'
import { createTokenRoutes, TokenRoutes } from './token'
import { createQuoteRoutes, QuoteRoutes } from './quote'
import { KeyLike, KeyObject, createPrivateKey } from 'crypto'
import { OpenPaymentsClientError } from './error'
import {
  getResourceServerOpenAPI,
  getWalletAddressServerOpenAPI,
  getAuthServerOpenAPI
} from '../openapi'
export * from './error'

export interface BaseDeps {
  httpClient: HttpClient
  logger: Logger
  useHttp: boolean
}

interface UnauthenticatedClientDeps extends BaseDeps {
  walletAddressServerOpenApi?: OpenAPI
  resourceServerOpenApi?: OpenAPI
}

interface AuthenticatedClientDeps extends UnauthenticatedClientDeps {
  authServerOpenApi?: OpenAPI
}

export interface RouteDeps extends BaseDeps {
  httpClient: HttpClient
  openApi?: OpenAPI
  logger: Logger
}

export interface UnauthenticatedResourceRequestArgs {
  /**
   * The full URL of the requested resource.
   *
   * For example, if the requested resource is an incoming payment:
   * ```
   * https://openpayments.dev/incoming-payments/08394f02-7b7b-45e2-b645-51d04e7c330c`
   * ```
   */
  url: string
}

interface AuthenticatedRequestArgs {
  /**
   * The access token required to access the resource.
   * This token is provided when a grant is created.
   *
   * @see [Open Payments - Grant Request](https://openpayments.dev/apis/auth-server/operations/post-request/)
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
   * https://openpayments.dev/alice`
   * ```
   */
  walletAddress: string
}

const parseKey = (deps: { logger: Logger }, privateKey: KeyLike): KeyObject => {
  if (privateKey instanceof KeyObject) {
    deps.logger.debug('Loading key from KeyObject')
    return privateKey
  }

  if (privateKey instanceof Buffer) {
    try {
      deps.logger.debug('Loading key from Buffer')
      return createPrivateKey(privateKey)
    } catch {
      throw new Error('Key is not a valid file')
    }
  }

  const keyFilePath = path.resolve(process.cwd(), privateKey)

  if (fs.existsSync(keyFilePath)) {
    deps.logger.debug(`Loading key from file path: ${keyFilePath}`)
    return loadKey(keyFilePath)
  }

  try {
    deps.logger.debug('Loading key from string')
    return createPrivateKey(privateKey)
  } catch {
    throw new Error('Key is not a valid path or file')
  }
}

const createUnauthenticatedDeps = async ({
  useHttp = false,
  validateResponses = true,
  ...args
}: Partial<CreateUnauthenticatedClientArgs> = {}): Promise<UnauthenticatedClientDeps> => {
  const logger =
    args.logger ??
    createLogger({ name: 'Open Payments Client', level: 'silent' })
  if (args.logLevel) {
    logger.level = args.logLevel
  }

  const httpClient = await createHttpClient({
    logger,
    requestTimeoutMs: args.requestTimeoutMs ?? config.DEFAULT_REQUEST_TIMEOUT_MS
  })

  let walletAddressServerOpenApi: OpenAPI | undefined
  let resourceServerOpenApi: OpenAPI | undefined

  if (validateResponses) {
    walletAddressServerOpenApi = await getWalletAddressServerOpenAPI()
    resourceServerOpenApi = await getResourceServerOpenAPI()
  }

  return {
    httpClient,
    walletAddressServerOpenApi,
    resourceServerOpenApi,
    logger,
    useHttp
  }
}

const createAuthenticatedClientDeps = async ({
  useHttp = false,
  validateResponses = true,
  ...args
}:
  | CreateAuthenticatedClientArgs
  | CreateAuthenticatedClientWithReqInterceptorArgs): Promise<AuthenticatedClientDeps> => {
  const logger =
    args.logger ??
    createLogger({ name: 'Open Payments Client', level: 'silent' })
  if (args.logLevel) {
    logger.level = args.logLevel
  }

  let httpClient: HttpClient

  if ('authenticatedRequestInterceptor' in args) {
    httpClient = await createHttpClient({
      logger,
      requestTimeoutMs:
        args.requestTimeoutMs ?? config.DEFAULT_REQUEST_TIMEOUT_MS,
      requestSigningArgs: {
        authenticatedRequestInterceptor: args.authenticatedRequestInterceptor
      }
    })
  } else {
    let privateKey: KeyObject
    try {
      privateKey = parseKey({ logger }, args.privateKey)
    } catch (error) {
      const errorMessage =
        'Could not load private key when creating authenticated client'
      const description =
        error instanceof Error ? error.message : 'Unknown error'

      logger.error({ description }, errorMessage)

      throw new OpenPaymentsClientError(errorMessage, {
        description
      })
    }

    httpClient = await createHttpClient({
      logger,
      requestTimeoutMs:
        args.requestTimeoutMs ?? config.DEFAULT_REQUEST_TIMEOUT_MS,
      requestSigningArgs: {
        privateKey,
        keyId: args.keyId
      }
    })
  }

  let walletAddressServerOpenApi: OpenAPI | undefined
  let resourceServerOpenApi: OpenAPI | undefined
  let authServerOpenApi: OpenAPI | undefined

  if (validateResponses) {
    walletAddressServerOpenApi = await getWalletAddressServerOpenAPI()
    resourceServerOpenApi = await getResourceServerOpenAPI()
    authServerOpenApi = await getAuthServerOpenAPI()
  }

  return {
    httpClient,
    walletAddressServerOpenApi,
    resourceServerOpenApi,
    authServerOpenApi,
    logger,
    useHttp
  }
}

export interface CreateUnauthenticatedClientArgs {
  /** Milliseconds to wait before timing out an HTTP request */
  requestTimeoutMs?: number
  /** The custom logger instance to use. This defaults to the pino logger. */
  logger?: Logger
  /** The desired logging level  */
  logLevel?: LevelWithSilent
  /** If enabled, all requests will use http as protocol. Use in development mode only. */
  useHttp?: boolean
  /** Enables or disables response validation against the Open Payments OpenAPI specs. Defaults to true. */
  validateResponses?: boolean
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
  const { resourceServerOpenApi, walletAddressServerOpenApi, ...baseDeps } =
    await createUnauthenticatedDeps(args)

  baseDeps.logger.debug(
    {
      validateResponses: !!args.validateResponses,
      useHttp: baseDeps.useHttp,
      requestTimeoutMs:
        args.requestTimeoutMs ?? config.DEFAULT_REQUEST_TIMEOUT_MS
    },
    'Created unauthenticated client'
  )

  return {
    walletAddress: createWalletAddressRoutes({
      ...baseDeps,
      openApi: walletAddressServerOpenApi
    }),
    incomingPayment: createUnauthenticatedIncomingPaymentRoutes({
      ...baseDeps,
      openApi: resourceServerOpenApi
    })
  }
}

interface BaseAuthenticatedClientArgs extends CreateUnauthenticatedClientArgs {
  /** The wallet address which the client will identify itself by */
  walletAddressUrl: string
}

interface PrivateKeyConfig {
  /** The private EdDSA-Ed25519 key (or the relative or absolute path to the key) with which requests will be signed */
  privateKey: string | KeyLike
  /** The key identifier referring to the private key */
  keyId: string
}

interface InterceptorConfig {
  /** The custom authenticated request interceptor to use. */
  authenticatedRequestInterceptor: InterceptorFn
}

export type CreateAuthenticatedClientArgs = BaseAuthenticatedClientArgs &
  PrivateKeyConfig

export type CreateAuthenticatedClientWithReqInterceptorArgs =
  BaseAuthenticatedClientArgs & InterceptorConfig

export interface AuthenticatedClient
  extends Omit<UnauthenticatedClient, 'incomingPayment'> {
  incomingPayment: IncomingPaymentRoutes
  outgoingPayment: OutgoingPaymentRoutes
  grant: GrantRoutes
  token: TokenRoutes
  quote: QuoteRoutes
}

/**
 * Creates an Open Payments client that exposes methods to call all of the Open Payments APIs.
 * Each request requiring authentication will be signed with the given private key.
 */
export async function createAuthenticatedClient(
  args: CreateAuthenticatedClientArgs
): Promise<AuthenticatedClient>
/**
 * @experimental The `authenticatedRequestInterceptor` feature is currently experimental and might be removed
 * in upcoming versions. Use at your own risk! It offers the capability to add a custom method for
 * generating HTTP signatures. It is recommended to create the authenticated client with the `privateKey`
 * and `keyId` arguments. If both `authenticatedRequestInterceptor` and `privateKey`/`keyId` are provided, an error will be thrown.
 * @throws OpenPaymentsClientError
 */
export async function createAuthenticatedClient(
  args: CreateAuthenticatedClientWithReqInterceptorArgs
): Promise<AuthenticatedClient>
export async function createAuthenticatedClient(
  args:
    | CreateAuthenticatedClientArgs
    | CreateAuthenticatedClientWithReqInterceptorArgs
): Promise<AuthenticatedClient> {
  if (
    'authenticatedRequestInterceptor' in args &&
    ('privateKey' in args || 'keyId' in args)
  ) {
    throw new OpenPaymentsClientError(
      'Invalid arguments when creating authenticated client.',
      {
        description:
          'Both `authenticatedRequestInterceptor` and `privateKey`/`keyId` were provided. Please use only one of these options.'
      }
    )
  }
  const {
    resourceServerOpenApi,
    authServerOpenApi,
    walletAddressServerOpenApi,
    ...baseDeps
  } = await createAuthenticatedClientDeps(args)

  baseDeps.logger.debug(
    {
      walletAddressUrl: args.walletAddressUrl,
      ...('keyId' in args ? { keyId: args.keyId } : {}),
      validateResponses: !!args.validateResponses,
      useHttp: baseDeps.useHttp,
      requestTimeoutMs:
        args.requestTimeoutMs ?? config.DEFAULT_REQUEST_TIMEOUT_MS
    },
    'Created authenticated client'
  )

  return {
    incomingPayment: createIncomingPaymentRoutes({
      ...baseDeps,
      openApi: resourceServerOpenApi
    }),
    outgoingPayment: createOutgoingPaymentRoutes({
      ...baseDeps,
      openApi: resourceServerOpenApi
    }),
    walletAddress: createWalletAddressRoutes({
      ...baseDeps,
      openApi: walletAddressServerOpenApi
    }),
    grant: createGrantRoutes({
      ...baseDeps,
      openApi: authServerOpenApi,
      client: args.walletAddressUrl
    }),
    token: createTokenRoutes({
      ...baseDeps,
      openApi: authServerOpenApi
    }),
    quote: createQuoteRoutes({
      ...baseDeps,
      openApi: resourceServerOpenApi
    })
  }
}
