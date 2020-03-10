---
id: web-monetization
title: Web Monetization
---

## Motivation
Currently Web Monetization is served through 
[Simple Payment Setup Protocol (SPSP)](https://interledger.org/rfcs/0009-simple-payment-setup-protocol/), which uses
a Payment Pointer to resolve STREAM credentials. Whilst Open Payments proposes moving to a model where the Payment
Pointer becomes a discovery and identifier mechanism. Having two different specs achieving similar goals adds
confusion to the ecosystem and difficulty for implementors. This is an attempt at unifying Web Monetization and Open
Payments into a singular specification in a backwards compatible manner. Further, it
attempts to formalise/simplify the concept of grouping payments received through Web Monetization for Wallets.

## Overview
The term Monetization is used to encompass use-cases where payments are made piecemeal. These use-cases don't have
defined amounts to be paid and therefore need a mechanism to account for them. The mechanism
proposed is in the form of a Monetization Endpoint. This is an endpoint that when queried for STREAM
credentials will provide the details for a currently "open" Invoice. Where "open" means an Invoice that is still
able to receive incoming Payments. At any time the Invoice can be "closed", at which point it will stop
accepting incoming payments. Once the Invoice is closed, the Wallet can sum the payments recieved for that Invoice of
Invoice and allocate the funds to the Users balance on its own internal ledger system. Any new requests for STREAM
credentials will require a new "open" Invoice to be generated. The mechanism for closing out Invoices can be determined 
by the Wallet but will generally be time based. Wallets supporting Monetization will provider their Users with a
Monetization Endpoint/s. Further it will ensure there is always an "open" Invoice when credentials are requested from
a Client. This can be created lazily.

The term Monetization Endpoint was chosen as this proposal allows for use cases that include but are not limited
to Web Monetization, such as Codius Hosts and yet to be defined future use-cases.

## Client Interaction

Given a Monetization Endpoint, an entity wishing to get STREAM credentials can make an HTTP `GET`/`OPTIONS` request
against the endpoint. A non-normative example is

```http request
GET /monetization/4c885b94-7bf0-4222-8224-6d27c6ac9198 HTTP/1.1
Host: issuer.wallet
```

with the response returning the STREAM credentials for the current "open" Invoice for monetization. An example
response would be. (This could potentially be a 302 to the Invoices OPTIONS endpoint)

```http request
HTTP/1.1 200 OK
Content-Type: application/json

{
  "ilpAddress": "example.ilpdemo.red.bob",
  "sharedSecret": "6jR5iNIVRvqeasJeCty6C+YB5X9FhSOUPCL/5nha5Vs="
}
```

Clients can now make payments to the Endpoint over STREAM using the above credentials.

Further, the endpoint should support parameters for encoding data into STREAM connection details. These are supported
as header values in the request. The following are values that must be supported as per the STREAM spec:
* Receipt-Nonce
* Receipt-Secret
* Session-Id

## Wallets Implementation
Whilst the above shows how a client would interact with the system, Wallets still need to know how to handle it
within their own codebase.

Given a request to the monetization URL

```http request
GET /monetization/4c885b94-7bf0-4222-8224-6d27c6ac9198 HTTP/1.1
Host: issuer.wallet
```

The wallet will first determine if their is an "open" Invoice for this Monetization Endpoint. If there is one, it
will return the STREAM credentials of the Invoice in the response. If there is no "open" Invoice, it will create an
Invoice and then provide the STREAM credentials in the response.

An example of a controller handling this is

```javascript
  const { streamService } = require('stream')
  const { monetizationService } = require('monetization')
  
  // controller for route /monetization/:id
  export async function show(ctx) {
    const monetizationId = ctx.params.id
    
    // Get current Open Invoice
    const monetization = monetizationService.getByid(monetizationId)
    let openInvoice = monetization.getOpenInvoice()
    
    // If no open invoice create one
    if(openInvoice === null) {
      openInvoice = monetization.createInvoice()
    }
    
    const { ilpAddress, sharedSecret } = streamService.generateCredenetials(openInvoice.id)

    ctx.body = {
      ilpAddress,
      sharedSecret
    }
  }
```

Then when a Wallet receives an incoming STREAM payment, it will determine which Invoice that payment is allocated to and
if that Invoice can still receive Payments. Where an example is

```javascript
  const { createServer } = require('ilp-protocol-stream')
  const { decodeData } = require('encoder') 
  const { creditInvoice, getById } = require('invoice')

  const streamServer = await createServer({
    plugin: getPlugin()
  })

  streamServer.on('connection', (connection) => {

    // Determine who this connection belongs to by correlating with connectionTag
    const connectionTag = connection.connectionTag
    
    // Get the invoiceId from the connection
    const invoiceId = decodeData(connectionTag)
    const invoice = getById(invoiceId)

    connection.on('stream', (stream) => {

      //Determine if Invoice can still recieve payments.
      if(invoice.isOpen) {
        stream.setReceiveMax(10000000000000)

        stream.on('money', amount => {
        
          // Credit the invoice for the amount received
          creditInvoice(amount)

        })
      }
    })
  })
```

Once the Wallet closes an Invoice it can allocate all the funds received to that Invoice to the Users
balance.

## Backwards compatibility with SPSP and Web Monetization

In order to provide for backwards compatibility between SPSP and Open Payments Monetization, it is expected that Wallets
support SPSP queries.

```http request
GET /.well-known/pay HTTP/1.1
Host: example.com
Accept: application/spsp4+json, application/spsp+json
```

returning the response

```http request
HTTP/1.1 200 OK
Content-Type: application/spsp4+json

{
  "destination_account": "example.ilpdemo.red.bob",
  "shared_secret": "6jR5iNIVRvqeasJeCty6C+YB5X9FhSOUPCL/5nha5Vs="
}
```

The `destination_account` and `shared_secret` should be STREAM credentials that map to the current "open" Invoice for
the associated Monetization Endpoint for a User. 

In order for Wallets to support this, it may be easier for wallets in the background to map the default payment
pointer given to the user to a Monetization Endpoint they generate.

<!--
## Proxying Monetization Requests

For certain use-cases, the User may want the ability for a third-party to verify payments etc. An example is Cinnamon
where a user would provide Cinnamon with a Monetization Endpoint.
-->

## Notes
Talk about the relation between Open Payments and Web Monetization
* Link rel is a place where doing a GET gets the current Invoice Open for session
* Resolving a Payment Pointer to the actual WM_URL that will be provided in the REL
* Work out how this works with Codius/Paid API requests

Ideas:
* Just call it a Monetization Endpoint instead of WM. As people can build interesting use-cases with this and
Receipts that are not just Web Monetization

Issues:
* Given a payment pointer, can I resolve a users monetization URL? Should this even be possible?
* How to resolve expiry of credentials/when an Invoice has been deemed closed? STREAM layer fails and then you would
 propagate it to the Application layer potentially.
* Should there be a deprecation plan for SPSP & Payment Pointers being used in the canonical form ($payment.poinert
.com) for use cases other than for discovery.
