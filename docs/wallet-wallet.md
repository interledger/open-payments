---
id: wallet-wallet
title: Wallet-Wallet Interoperability
---

Open payments first goal is to provide interoperability between wallets. In order to achieve this Wallets need a 
mechanism to send and receive discrete payments. In Open Payments this primitive is in the form of an Invoice. An invoice 
is a resource that encompasses a discrete payment with which a Receiver could present to a Sender.
Wallets implementing Open Payments must be able to both Send and Receive Invoices to ensure interoperability.

## Sending Money

In order for an Issuer to send money to an Acquirer, it will need an Invoice. This Invoice can either be provided to the 
Issuer or the Issuer can create one at a Payment Pointer for the receiver. Once the Issuer has the Invoice, it will get 
the required STREAM credentials to pay the invoice using an OPTIONS request
against the invoice URI per [Invoice Payment Details](invoices.md#payment-details). The request will return a 
destinationAccount and shared secret.

The Sender would then perform a STREAM payment using the credentials. An example using the 
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

The Issuing Wallet would debit the senders account within the wallet before performing the payment. Should the payment
fail or only a partial amount sent, the wallet must credit the unsent balance back to the senders account.

** Potentially add example full flow **


## Receiving Money

In order to receive money over Open Payments, an Invoice would be created at the Acquiring Wallet and presented to the Sender.
The Acquiring Wallet receiving the funds has two tasks:

1. Ensure the STREAM credentials generated map to the invoice
2. Credit the Invoices balance for incoming payments mapped to an invoice

### 1. Responding to Queries against the Invoice

When the Sender does a query for [Invoice Payment Details](invoices.md#payment-details) by doing an HTTP OPTIONS against
the Invoice URI it is expecting STREAM credentials to be able to pay the Invoice. These credentials can be generated using
a STREAM implementation, such as [Javascript STREAM client](https://github.com/interledgerjs/ilp-protocol-stream)

```javascript
  const { createServer } = require('ilp-protocol-stream')

  const streamServer = await createServer({
    plugin: getPlugin()
  })

  const { destinationAccount, sharedSecret } = streamServer.generateAddressAndSecret()
```

The `destinationAccount` and `sharedSecret` can then be passed back. Though there is no mapping of the `destinationAccount`
to `Invoice`. The Acquiring Wallet could store all generated credentials for a given. Though this is is inefficient and
 a better solution exists
 
STREAM provides a mechanism for encoding data into an ILP Address (`destinationAccount`) using a `Connection Tag`. This 
allows the Acquiring Wallet to encode data into the address that can then be decoded when an incoming connection is received.

The following shows an example of encoding data into the credentials provided.
```javascript
  //Dummy import - replace with own encoding
  const { encodeData } = require('encoder') 
  
  const connectionTag = encodeData(invoiceId)

  const { destinationAccount, sharedSecret } = server.generateAddressAndSecret(connectionTag)
```

The Acquiring Wallet now has the ability to decode the data when it receives an incoming STREAM and be able to determine
which Invoice at allocate the money received

### 2. Accounting for an incoming Payment

As shown above, the Acquiring Wallet could use the invoice data encoded to determine which Invoice to credit for incoming
STREAM payments.

The following shows example code of what the Acquiring Wallet would do
```javascript
  const { createServer } = require('ilp-protocol-stream')
  const { decodeData } = require('encoder') 
  const { creditInvoice } = require('invoice')

  const streamServer = await createServer({
    plugin: getPlugin()
  })

  streamServer.on('connection', (connection) => {

    // Determine who this connection belongs to by correlating with connectionTag
    const connectionTag = connection.connectionTag
    
    // Get the invoiceId from the connectiontaf
    const invoiceId = decodeData(connectionTag)

    connection.on('stream', (stream) => {

      //Set how much you want to allow for this STREAM.
      stream.setReceiveMax(10000000000000)

      stream.on('money', amount => {
        
        // Credit the invoice for the amount received
        creditInvoice(amount)

      })

    })

  })
```




