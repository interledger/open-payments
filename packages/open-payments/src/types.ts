import {
  components as RSComponents,
  paths as RSPaths,
  operations as RSOperations
} from './openapi/generated/resource-server-types'
import {
  components as ASComponents,
  paths as ASPaths,
  operations as ASOperations,
  external as ASExternal
} from './openapi/generated/auth-server-types'

export const getRSPath = <P extends keyof RSPaths>(path: P): string =>
  path as string

export type IncomingPayment = RSComponents['schemas']['incoming-payment']
export type IncomingPaymentWithConnection =
  RSComponents['schemas']['incoming-payment-with-connection']
export type IncomingPaymentWithConnectionUrl =
  RSComponents['schemas']['incoming-payment-with-connection-url']
export type CreateIncomingPaymentArgs =
  RSOperations['create-incoming-payment']['requestBody']['content']['application/json']
export type IncomingPaymentPaginationResult =
  PaginationResult<IncomingPaymentWithConnectionUrl>
export type ILPStreamConnection =
  RSComponents['schemas']['ilp-stream-connection']
export type OutgoingPayment = RSComponents['schemas']['outgoing-payment']
export type CreateOutgoingPaymentArgs =
  RSOperations['create-outgoing-payment']['requestBody']['content']['application/json']
type PaginationResult<T> = {
  pagination: RSComponents['schemas']['page-info']
  result: T[]
}
export type OutgoingPaymentPaginationResult = PaginationResult<OutgoingPayment>
export type ForwardPagination = Omit<
  RSOperations['list-incoming-payments']['parameters']['query'],
  'last'
> & {
  last?: never
}
export type BackwardPagination = Omit<
  RSOperations['list-incoming-payments']['parameters']['query'],
  'first'
> & {
  first?: never
}
export type PaginationArgs = ForwardPagination | BackwardPagination
export type PaymentPointer = RSComponents['schemas']['payment-pointer']
export type JWK = RSComponents['schemas']['json-web-key']
export type JWKS = RSComponents['schemas']['json-web-key-set']
export type Quote = RSComponents['schemas']['quote']
type QuoteArgsBase = {
  receiver: RSOperations['create-quote']['requestBody']['content']['application/json']['receiver']
}
type QuoteArgsWithSendAmount = QuoteArgsBase & {
  sendAmount?: RSComponents['schemas']['quote']['sendAmount']
  receiveAmount?: never
}
type QuoteArgsWithReceiveAmount = QuoteArgsBase & {
  sendAmount?: never
  receiveAmount?: RSComponents['schemas']['quote']['receiveAmount']
}
export type CreateQuoteArgs =
  | QuoteArgsWithSendAmount
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
export type GrantRequest = {
  access_token: ASOperations['post-request']['requestBody']['content']['application/json']['access_token']
  client: ASOperations['post-request']['requestBody']['content']['application/json']['client']
  interact: ASOperations['post-request']['requestBody']['content']['application/json']['interact']
}
export type GrantContinuationRequest = {
  interact_ref: ASOperations['post-continue']['requestBody']['content']['application/json']['interact_ref']
}
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

type ASExternalComponents = ASExternal['schemas.yaml']['components']['schemas']
export type AccessIncomingActions =
  ASExternalComponents['access-incoming']['actions']
export type AccessOutgoingActions =
  ASExternalComponents['access-outgoing']['actions']
export type AccessQuoteActions = ASExternalComponents['access-quote']['actions']

export type AccessItem =
  | ASExternalComponents['access-incoming']
  | ASExternalComponents['access-outgoing']
  | ASExternalComponents['access-quote']

export type AccessType =
  | ASExternalComponents['access-incoming']['type']
  | ASExternalComponents['access-outgoing']['type']
  | ASExternalComponents['access-quote']['type']

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
