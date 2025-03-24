import {
  components as RSComponents,
  paths as RSPaths,
  operations as RSOperations
} from './openapi/generated/resource-server-types'
import {
  components as ASComponents,
  paths as ASPaths,
  operations as ASOperations
} from './openapi/generated/auth-server-types'
import {
  components as WAComponents,
  paths as WAPaths
} from './openapi/generated/wallet-address-server-types'

export const getWAPath = <P extends keyof WAPaths>(path: P): string =>
  path as string

export type WalletAddress = WAComponents['schemas']['wallet-address']
export type JWK = WAComponents['schemas']['json-web-key']
export type JWKS = WAComponents['schemas']['json-web-key-set']
export type DIDDocument = WAComponents['schemas']['did-document']

export const getRSPath = <P extends keyof RSPaths>(path: P): string =>
  path as string

export type IncomingPayment = RSComponents['schemas']['incoming-payment']
export type PublicIncomingPayment =
  RSComponents['schemas']['public-incoming-payment']

export type IlpPaymentMethod = RSComponents['schemas']['ilp-payment-method']
type PaymentMethods = IlpPaymentMethod

export type IncomingPaymentWithPaymentMethods = IncomingPayment & {
  methods: PaymentMethods[]
}
export type CreateIncomingPaymentArgs =
  RSOperations['create-incoming-payment']['requestBody']['content']['application/json']
export type IncomingPaymentPaginationResult = PaginationResult<IncomingPayment>
export type OutgoingPayment = RSComponents['schemas']['outgoing-payment']
export type OutgoingPaymentWithSpentAmounts =
  RSComponents['schemas']['outgoing-payment-with-spent-amounts']
export type CreateOutgoingPaymentArgs =
  RSOperations['create-outgoing-payment']['requestBody']['content']['application/json']
type PaginationResult<T> = {
  pagination: RSComponents['schemas']['page-info']
  result: T[]
}
export type OutgoingPaymentPaginationResult = PaginationResult<OutgoingPayment>

type BasePaginationArgs = Pick<
  RSOperations['list-incoming-payments']['parameters']['query'],
  'first' | 'last' | 'cursor' | 'wallet-address'
>

export type ForwardPagination = Omit<BasePaginationArgs, 'last'> & {
  last?: never
}
export type BackwardPagination = Omit<BasePaginationArgs, 'first'> & {
  first?: never
}
export type PaginationArgs = ForwardPagination | BackwardPagination

export type Quote = RSComponents['schemas']['quote']
type QuoteArgsBase = {
  walletAddress: RSOperations['create-quote']['requestBody']['content']['application/json']['walletAddress']
  receiver: RSOperations['create-quote']['requestBody']['content']['application/json']['receiver']
  method: RSComponents['schemas']['payment-method']
}
type QuoteArgsWithDebitAmount = QuoteArgsBase & {
  debitAmount?: RSComponents['schemas']['quote']['debitAmount']
  receiveAmount?: never
}
type QuoteArgsWithReceiveAmount = QuoteArgsBase & {
  debitAmount?: never
  receiveAmount?: RSComponents['schemas']['quote']['receiveAmount']
}
export type CreateQuoteArgs =
  | QuoteArgsWithDebitAmount
  | QuoteArgsWithReceiveAmount

export const getASPath = <P extends keyof ASPaths>(path: P): string =>
  path as string
export type NonInteractiveGrantRequest = {
  access_token: ASOperations['post-request']['requestBody']['content']['application/json']['access_token']
  client: ASOperations['post-request']['requestBody']['content']['application/json']['client']
}
export type Grant = {
  access_token: ASComponents['schemas']['access_token']
  continue: ASComponents['schemas']['continue']
}
export type GrantContinuation = {
  continue: ASComponents['schemas']['continue']
}
export type GrantRequest = {
  access_token: { access: GrantRequestAccessItem[] }
  client: ASOperations['post-request']['requestBody']['content']['application/json']['client']
  interact?: ASOperations['post-request']['requestBody']['content']['application/json']['interact']
}

export type GrantContinuationRequest =
  | Required<
      NonNullable<
        ASOperations['post-continue']['requestBody']
      >['content']['application/json']
    >
  | undefined

export type PendingGrant = {
  interact: ASComponents['schemas']['interact-response']
  continue: ASComponents['schemas']['continue']
}
export type AccessToken = {
  access_token: ASComponents['schemas']['access_token']
}
export const isPendingGrant = (
  grant: PendingGrant | Grant
): grant is PendingGrant => !!(grant as PendingGrant).interact

export const isFinalizedGrant = (
  grant: GrantContinuation | Grant
): grant is Grant => !!(grant as Grant).access_token

export type AccessIncomingActions =
  ASComponents['schemas']['access-incoming']['actions']
export type AccessOutgoingActions =
  ASComponents['schemas']['access-outgoing']['actions']
export type AccessQuoteActions =
  ASComponents['schemas']['access-quote']['actions']

export type AccessItem = ASComponents['schemas']['access-item']

export type AccessType =
  | ASComponents['schemas']['access-incoming']['type']
  | ASComponents['schemas']['access-outgoing']['type']
  | ASComponents['schemas']['access-quote']['type']

export type AccessAction = (
  | AccessIncomingActions
  | AccessOutgoingActions
  | AccessQuoteActions
)[number]

export const AccessType: {
  [key in 'IncomingPayment' | 'OutgoingPayment' | 'Quote']: AccessType
} = {
  IncomingPayment: 'incoming-payment',
  OutgoingPayment: 'outgoing-payment',
  Quote: 'quote'
}

export const AccessAction: Record<
  'Create' | 'Read' | 'ReadAll' | 'Complete' | 'List' | 'ListAll',
  AccessAction
> = Object.freeze({
  Create: 'create',
  Read: 'read',
  ReadAll: 'read-all',
  Complete: 'complete',
  List: 'list',
  ListAll: 'list-all'
})

// From: https://github.com/microsoft/TypeScript/issues/14094#issuecomment-373782604
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }
type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U
type XOR3<T, U, V> = XOR<T, XOR<U, V>>
export type AccessOutgoingBase = {
  receiver?: ASComponents['schemas']['receiver']
  interval?: ASComponents['schemas']['interval']
}
export type AccessOutgoingWithDebitAmount = AccessOutgoingBase & {
  debitAmount: ASComponents['schemas']['amount']
}
export type AccessOutgoingWithReceiveAmount = AccessOutgoingBase & {
  receiveAmount: ASComponents['schemas']['amount']
}
export type AccessOutgoingLimits = XOR3<
  AccessOutgoingBase,
  AccessOutgoingWithDebitAmount,
  AccessOutgoingWithReceiveAmount
>
export type AccessOutgoing = {
  type: 'outgoing-payment'
  actions: ('create' | 'read' | 'read-all' | 'list' | 'list-all')[]
  identifier: string
  limits?: AccessOutgoingLimits
}
export type GrantRequestAccessItem =
  | ASComponents['schemas']['access-incoming']
  | AccessOutgoing
  | ASComponents['schemas']['access-quote']
