# @interledger/open-payments

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
