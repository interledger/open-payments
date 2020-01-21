---
id: checkout_push
title: Checkout (Push)
---

The following use case demonstrates a PUSH based retail payment example between two parties, the merchant and
a customer. The flow is based off the merchant creating an invoice on its own wallet, which is then presented to the customer. 
The customer can then present this invoice to its own wallet to complete the payment.

```mermaid
sequenceDiagram
    participant Sender
    participant Issuer as Issuer<br/>(sending wallet)
    participant Acquirer as Acquirer<br/>(receiving wallet)
    participant Receiver
    Receiver->>Acquirer: POST /invoices
    activate Receiver
    activate Receiver
    activate Receiver
    activate Acquirer
    activate Acquirer
    activate Acquirer
    Acquirer->>Acquirer: createInvoice(invoice)
    Acquirer-->>Receiver: 201 paid=false
    deactivate Acquirer
    Receiver-xSender: [ send invoice_url out of band (PaymentRequest, QR Code) ]
    deactivate Receiver
    activate Sender
    Sender->>Issuer: pay(invoice_url)
    activate Issuer
    Issuer->>Acquirer: GET invoice_url
    activate Acquirer
    Acquirer-->>Issuer: 200 destination_address, shared_secret
    deactivate Acquirer
    rect rgb(0, 255, 0)
        Issuer->>Acquirer: [ push payment ]
        activate Acquirer
    end
    Acquirer->>Acquirer: updateInvoiceBalance(amount)
    deactivate Acquirer
    Issuer-->>Sender: response
    deactivate Sender
    deactivate Issuer
    
    Receiver->>Acquirer: GET /invoices/{id}
    activate Receiver
    activate Acquirer
    Acquirer->>Receiver: 200 invoice
    deactivate Receiver
    deactivate Acquirer
```

# Flow

Based on the diagram above the flow is as follows:
1. Merchant creates an invoice at its Acquirer for the amount that it would like the customer to pay
2. Merchant presents the invoice/url to the customer.
3. The customer submits the invoice to its Issuer (own wallet) to pay the invoice
4. Merchant checks for payment of invoice

## 1. Creating Invoice at Acquirer

Below is a non-normative example of a merchant creating an invoice at its Acquirer.

```http
POST /invoices HTTP/1.1
Host: acquirer.wallet
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi...
Accept: application/json
Content-Type: application/json

{
  "subject": "$acquirer.wallet/merchant",
  "asset": {
    "code": "USD",
    "scale": 2
  }
  "amount": 200
}
```

A successful `201` response will return an invoice object. Below is a non-normative example of a successful response to 
the creation of an invoice for `$wallet.example/merchant`.

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: https://acquirer.wallet/sessions/0f09dc92-84ad-401b-a7c9-441bc6173f4e

{
  "name": "//acquirer.wallet/invoices/0f09dc92-84ad-401b-a7c9-441bc6173f4e",
  "subject": "$acquirer.wallet/merchant",
  "amount": 200
  "asset": {
    "code": "USD",
    "scale": 2
  },
  "received": 0
}
```

## 2. Present invoice to customer

Once the merchant has the invoice, it would present the invoice to the customer. This could be in the form of a URL or
QRCode.

## 3. Customer submits invoice to Issuer

The customer can now submit the invoice to its Issuer. If its a URL it could paste it into some dialog or if its a QRCode,
they could scan with their native app. It is expected that the Issuer would ask confirmation before 

### Payment

In order for the Issuer to complete the payment it would need to get payment details from the invoice. By doing a GET against
the invoice it can get the required `destination_address` and `shared_secret`

```http
GET /invoices/0f09dc92-84ad-401b-a7c9-441bc6173f4e HTTP/1.1
Host: acquirer.wallet
Accept: application/json
Content-Type: application/json

{
  "subject": "$acquirer.wallet/merchant",
  "asset": {
    "code": "USD",
    "scale": 2
  },
  "amount": 200,
  "received": 0,
  "destination_address": "g.aquirer.42e0f0c9284ad401b7c941bc6173f4e",
  "shared_secret": "AvLaEGc+ojGHVezQF9DC4/7F5YIvrNPx/VM+4hJkCbs=",
}
```

The Issuer would now use the payment details to perform the payment over Interledger using STREAM. 

As payments are fulfilled, the `received` amount on the invoice would increase to reflect the payments.

## 4. Check payment

The merchant would validate the payment of the invoice with the Acquirer. This could be achieved through polling against the invoice
or the Acquirer could provide convenience webhooks for the merchant to get notified of successful payments. This is left up to Wallets to
decide to implement.
