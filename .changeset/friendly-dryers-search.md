---
'@interledger/open-payments': minor
---

changes POST /outgoing-payment body and client's outgoingPayment.create args to accept incomingPaymentId and debitAmount as alternative to quoteId. This supports creating outgoing payments directly from incoming payments instead of from a quote.
