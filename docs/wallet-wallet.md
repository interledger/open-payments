---
id: wallet-wallet
title: Wallet-Wallet Interoperability
---

Open payments first goal is to provide interoperability between wallets. In order to achieve this we need a basic
primitive for Wallets to send and receive money. This primitive is in the form of an Invoice. An invoice is a resource
that encompasses a discrete payment.

## Sending Money 

In order for an Issuer to send money to an Acquirer, it will need an Invoice. This Invoice can either be provided to the 
Issuer or the Issuer can create one at a Payment Pointer for the receiver. Once the Issuer has the Invoice, it will get 
the required STREAM credentials to pay the invoice using an OPTIONS request
against the invoice URI per [Invoice Payment Details](invoices.md#payment-details)

The Sender would then perform a STREAM payment using the credentials provided. An example using the 
[Javascript STREAM client](https://github.com/interledgerjs/ilp-protocol-stream) is:

```javascript
const connection = await createConnection({
    plugin: getPlugin(),
    destinationAccount,
    sharedSecret
})

const stream = connection.createStream()
await stream.sendTotal(200)
stream.end()
```

## Receiving Money

In order to receive money over Open Payments, you would create an Invoice. This invoice would then be presented to the party
who is required to pay the Invoice, the Sender.

### Responding to Queries against the Invoice


### Accounting for an incoming Payment

```javascript

```




