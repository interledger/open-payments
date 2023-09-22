---
'@interledger/open-payments': major
---

BREAKING: Replace 'payment pointer' with 'wallet address'

Payment pointers refer specifcally to a concept in the Interledger Protocol. Rafiki is set to support multiple payment methods, so 'wallet address' is being used as an Open Payments-specific term whose role may be filled by an Interledger payment pointer.

To upgrade convert any references to payment pointer(s) like so:
`paymentPointer` -> `walletAddress`
`PaymentPointer` -> `WalletAddress`
`paymentPointers` -> `walletAddresses`
`PaymentPointers` -> `WalletAddresses`
`payment pointer` -> `wallet address`
`Payment Pointer` -> `Wallet Address`
