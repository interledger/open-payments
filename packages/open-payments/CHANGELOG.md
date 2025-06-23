# @interledger/open-payments

## 7.1.1

### Patch Changes

- 4363b50: Updated example usage of client in the README

## 7.1.0

### Minor Changes

- ddaef03: Add details to error object of responses

## 7.0.0

### Major Changes

- 7fb1f25: Updated Authorization Server's Grant Request spec to prevent both "debitAmount" and "receiveAmount" being submitted at the same time during an outgoing payment grant request.
- a163bd6: Removed the `updatedAt` field from the incoming and outgoing payment resources in the resource server OpenAPI specification.

### Patch Changes

- dfe5f1f: Adding correct type for incoming payment creation metadata field

## 6.14.1

### Patch Changes

- ff811ea: Updating typescript to v5
- 13aa6b5: Updating types with latest openapi-typescript version
- Updated dependencies [ff811ea]
  - @interledger/http-signature-utils@2.0.3
  - @interledger/openapi@2.0.3

## 6.14.0

### Minor Changes

- 5cf35b3: Added GNAP error models to auth server responses.

## 6.13.2

### Patch Changes

- Updated dependencies [18ff574]
  - @interledger/openapi@2.0.2

## 6.13.1

### Patch Changes

- c9e1d15: Changes return type of outgoingPayment.create to OutgoingPaymentWithSpentAmounts to reflect correct return type.

## 6.13.0

### Minor Changes

- d7535db: - Adding debug logs during client initialization
  - Adding debug logs for requests and responses in the http client
  - Making log level `silent` by default

## 6.12.0

### Minor Changes

- aa21d26: Adding functionality to parse error objects from Open Payments API responses, and expose new `code` field in `OpenPaymentsClientError`.

## 6.11.1

### Patch Changes

- 73e2c52: Export OutgoingPaymentWithSpentAmounts

## 6.11.0

### Minor Changes

- 5c0e768: Changes POST /outgoing-payment return to new 'outgoing-payment-with-spent-amounts' type with grantSpentDebitAmount and grantSpentReceiveAmount

## 6.10.0

### Minor Changes

- 8950c21: Replace axios with [ky](https://github.com/sindresorhus/ky) (a wrapper around native fetch)
- 1bf703c: Adding `validateResponses` flag to Open Payments client initialization functions.
  This flag enables or disables response validation against the Open Payments OpenAPI specs (via the @interledger/openapi package).

## 6.9.0

### Minor Changes

- 3bbd59a: changes POST /outgoing-payment body and client's outgoingPayment.create args to accept incomingPayment and debitAmount as alternative to quoteId. This supports creating outgoing payments directly from incoming payments instead of from a quote.

## 6.8.2

### Patch Changes

- Updated dependencies [dd7fb76]
  - @interledger/openapi@2.0.1

## 6.8.1

### Patch Changes

- Updated dependencies [6dde8b2]
  - @interledger/openapi@2.0.0

## 6.8.0

### Minor Changes

- 1797345: Add and export functions that allow fetching the OpenAPI objects for the Open Payments specs

## 6.7.2

### Patch Changes

- b3a5d3b: Makes body and interact_ref optional on continuation route

## 6.7.1

### Patch Changes

- c42451c: updating types

## 6.7.0

### Minor Changes

- fe18cd0: Widened receiver regex to accept http and any id format. Removed previously deprecated 'connections' path.

## 6.6.0

### Minor Changes

- 8d4ccc3: (EXPERIMENTAL) Allow a custom request interceptor for the authenticated client instead of providing the private key and key ID. The request interceptor should be responsible for HTTP signature generation and it will replace the built-in interceptor.

### Patch Changes

- Updated dependencies [2658685]
  - @interledger/http-signature-utils@2.0.2

## 6.5.1

### Patch Changes

- 32737bd: Updating README and comments to have updated links to new site
- Updated dependencies [32737bd]
  - @interledger/http-signature-utils@2.0.1

## 6.5.0

### Minor Changes

- fe2c0d0: - Pulls in correct OpenAPI spec when wallet address validators are created in the SDK.
  - Updates the types returned by Grant continue route.

## 6.4.0

### Minor Changes

- 870347b: Exposes the grant continuation type

## 6.3.0

### Minor Changes

- dde4639: Made "access_token" optional for grant continuation responses

## 6.2.0

### Minor Changes

- ec04a61: Mapped wallet address and jwks get to new stand along Open API spec

## 6.1.1

### Patch Changes

- 28adb01: The `useHttp` option, when initializing an authenticated or unauthenticated client, was not being passed to resource route factories and request functions. This release addresses and resolves this issue.

## 6.1.0

### Minor Changes

- 1a59cf2: - Adding `OpenPaymentsClientError`, which gets thrown when making any request, as well as during client initialization. This error class contains additional error properties: `description` `status` (if thrown during an API request) and `validationErrors`. Example usage is in the README.
  - **Behaviour change**: Adding `useHttp` flag to the client, so that the conversion to http is explicitly set instead of using `process.env.NODE_ENV`. To keep the same behaviour, set `useHttp: process.env.NODE_ENV` when callng `createAuthenticatedClient` or `createUnauthenticatedClient`
  - Adding `logLevel` flag to the client initialization
  - Adding additional notes to the README with the new spec changes.

## 6.0.0

### Major Changes

- 737cdaa: - `createAuthenticatedClient` can now also load a key using a path to the private key file as an argument to `privateKey`
  - `walletAddress` is required in the incoming payment creation request

### Patch Changes

- Updated dependencies [737cdaa]
  - @interledger/http-signature-utils@2.0.0

## 5.3.1

### Patch Changes

- e2325ea: exports mockPublicIncomingPayment and PublicIncomingPayment

## 5.3.0

### Minor Changes

- 2de13ee: Adds authSever to the return type of public incoming payments.

### Patch Changes

- Updated dependencies [8c8d58c]
  - @interledger/openapi@1.2.1

## 5.2.2

### Patch Changes

- 2c5b9d5: Corrects PaginationArgs to only include relevant properties from query parameters. Was previously including wallet-address as well.
- 2458bb9: Fix POST incoming payment response types.

## 5.2.1

### Patch Changes

- b80f231: moves additionalProperties: false from incoming-payment type to GET /incoming-payments response

## 5.2.0

### Minor Changes

- 5809202: Added "walletAddress" field to resource POST request bodies, added "wallet-address" query parameter to resource GET requests.

## 5.1.0

### Minor Changes

- f756fed: Adds incomingPayment get method to unauthenticated client

## 5.0.0

### Major Changes

- 8593600: BREAKING: Introducing the concept of payment methods (on incoming payments) which allow returing a list of possible payment methods to pay into. For now, only one payment method is supported: ILP. Quote creation requires specifying a payment method for which to quote on.

## 4.0.0

### Major Changes

- c1e5010: BREAKING: Replace 'payment pointer' with 'wallet address'

  Payment pointers refer specifcally to a concept in the Interledger Protocol. Rafiki is set to support multiple payment methods, so 'wallet address' is being used as an Open Payments-specific term whose role may be filled by an Interledger payment pointer.

  To upgrade convert any references to payment pointer(s) like so:
  `paymentPointer` -> `walletAddress`
  `PaymentPointer` -> `WalletAddress`
  `paymentPointers` -> `walletAddresses`
  `PaymentPointers` -> `WalletAddresses`
  `payment pointer` -> `wallet address`
  `Payment Pointer` -> `Wallet Address`

### Patch Changes

- Updated dependencies [4e98e06]
  - @interledger/openapi@1.2.0

## 3.2.0

### Minor Changes

- 2ea12f0: removed connections route endpoint from the spec and any associated functionality
- 4423f18: Adds public-incoming-payment return type to incoming payment get request which should be returned for unauthenticated requests to this endpoint

### Patch Changes

- Updated dependencies [2ea12f0]
- Updated dependencies [2bdca93]
  - @interledger/openapi@1.1.0
  - @interledger/http-signature-utils@1.1.0

## 3.1.0

### Minor Changes

- 25cf507: Making interact property optional for grant requests

## 3.0.1

### Patch Changes

- Updated dependencies [805d6dd]
  - @interledger/http-signature-utils@1.0.4

## 3.0.0

### Major Changes

- dd193c7: Adding properties for new quoting mechanism

## 2.0.0

### Major Changes

- b8e3b6a: Removed externalRef and description fields from incoming and outgoing payments. metadata field should be used to store these fields instead.

## 1.1.0

### Minor Changes

- d54d465: Added metadata field to payments
- 97ad3e9: Optional startCursor & endCursor for pagination

### Patch Changes

- 0b94331: Fixing dependencies & docs
- Updated dependencies [0b94331]
  - @interledger/openapi@1.0.3

## 1.0.3

### Patch Changes

- Updated dependencies [dfecee7]
  - @interledger/http-signature-utils@1.0.3

## 1.0.2

### Patch Changes

- 6252042: Update publishConfig
- Updated dependencies [6252042]
  - @interledger/http-signature-utils@1.0.2
  - @interledger/openapi@1.0.2

## 1.0.1

### Patch Changes

- 842630e: Update README
- Updated dependencies [842630e]
  - @interledger/http-signature-utils@1.0.1
  - @interledger/openapi@1.0.1
