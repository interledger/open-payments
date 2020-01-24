---
id: recurring
title: Recurring Payments
---

The following use case demonstrates a merchant being able to charge customers at a regular interval. A merchant creates
and authorizes a mandate for its customer at the customers respective Issuer. The mandate is a form of delegated access
authorized by the customer which contains details about the interval, 
frequency, amount and start and end dates. The merchant can then submit invoices against the mandate to instruct
the Issuer to perform payments.

```mermaid
sequenceDiagram
    participant Sender
    participant Issuer as Issuer<br/>(sending wallet)
    participant Acquirer as Acquirer<br/>(receiving wallet)
    participant Receiver

    Sender->>Receiver: Produce $PaymentPointer

    Receiver->>Issuer: Get Open Payments Metadata

    Receiver->>Issuer: POST /mandates
    activate Receiver
    activate Issuer
    Issuer->>Issuer: Create Mandate
    Issuer-->>Receiver: 201 Response
    deactivate Issuer
    deactivate Receiver

    Receiver->>Issuer: Authorise Mandate
    activate Receiver
    activate Issuer
    
        Issuer->>Sender: Mandate Consent
        activate Sender
        Sender-->>Issuer: Accept Mandate
        deactivate Sender

    Issuer-->>Receiver: Respond Auth Tokens
    deactivate Receiver
    deactivate Issuer



    loop Interval of Payment
    
    Receiver->>Acquirer: POST /invoices
    activate Receiver
    activate Acquirer
    Acquirer->>Acquirer: createInvoice(invoice)
    Acquirer-->>Receiver: 201 paid=false
    deactivate Acquirer
    deactivate Receiver

    Receiver->>Issuer: POST /mandates/{id}/spend (invoice, auth_token)
    activate Receiver
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

    Issuer-->>Receiver: Response
    deactivate Receiver
    deactivate Issuer

   
    Receiver->>Acquirer: GET /invoices/{id}
    activate Receiver
    activate Acquirer
    Acquirer->>Receiver: 200 invoice
    deactivate Receiver
    deactivate Acquirer
    end
```

# Flow

Based on the diagram above the flow is as follows:
1. Customer would provide their Payment Pointer to the Merchant
2. Merchant uses the Payment Pointer to discover the Open Payments metadata
3. Merchant creates a mandate on the Issuer wallet
4. Merchant requests authorization for the mandate from the Issuer. Issuer goes through a consent flow 
5. Merchant can now submit invoices against the mandate for payments it wants to execute.

## 1. Providing Payment Pointer to Merchant

Wallets following the Open Payments spec will issue Payment Pointers to their customers. When a Merchant wishes to initiate
an Open Payments interaction

## 2. Discover Open Payments metadata

Using the Payment Pointer provided, the Merchant will perform a GET against the correct url.

```http
GET /.well-known/open-payments-server HTTP/1.1
Host: issuer.wallet
```

A successful `200` response will return the Open Payments metadata

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "issuer": "https://issuer.wallet",
  "authorization_endpoint": "https://issuer.wallet/authorize",
  "token_endpoint": "https://issuer.wallet/token",
  "token_endpoint_auth_methods_supported": ["client_secret_basic","private_key_jwt"],
  "token_endpoint_auth_signing_alg_values_supported": ["RS256", "ES256"],
  "userinfo_endpoint": "https://issuer.wallet/userinfo",
  "jwks_uri": "https://issuer.wallet/jwks.json",
  "registration_endpoint": "https://issuer.wallet/register",
  "scopes_supported": ["openid","profile","email","address","phone","offline_access"],
  "response_types_supported": ["code", "token"],
  "service_documentation": "https://issuer.wallet/service_documentation.html",
  "ui_locales_supported": ["en-US", "en-GB", "en-CA", "fr-FR", "fr-CA"],
  "payment_invoices_endpoint": "https://issuer.wallet/invoices",
  "payment_mandates_endpoint": "https://issuer.wallet/mandates",
  "payment_sessions_endpoint": "https://issuer.wallet/sessions",
  "payment_assets_supported": [
    {"code": "USD", "scale": 2},
    {"code": "EUR", "scale": 2}
  ]
}
```

The Merchant can now find `payment_mandates_endpoint` with which to create the necessary mandate

## 3. Create mandate on the Issuer wallet

The Merchant creates a mandate on the customers Issuers wallet using the endpoint above

```http
POST /mandates HTTP/1.1
Host: issuer.wallet
Accept: application/json
Content-Type: application/json

{
  "amount": 200,
  "asset" : {
    "code": "USD",
    "scale": 2
  },
  "interval": "P1M",
  "scope": "issuer.wallet/alice"
}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "name": "//issuer.wallet/mandates/2fad69d0-7997-4543-8346-69b418c479a6",
  "amount": 200,
  "asset" : {
    "code": "USD",
    "scale": 2
  },
  "interval": "P1M",
  "start_at": "2020-01-22T00:00:00Z",
  "scope": "issuer.wallet/alice",
  "balance": 200 
}
```

## 4. Merchant requests authorization for mandate

The merchant submits the mandate to the AS of the Issuer in order get authorization from the user.

**TODO** Flesh out the authorization flow and then show an example


This results in the Merchant getting an access_token with which to use against the mandate.

## 5. Merchant spends against mandate

The merchant can now submit spends against the mandate for goods/services rendered. The merchant can do this as often
as necessary, as long as the overall spends don't exceed the limit of the current mandate interval. 
 
### Create invoice

When the Merchant wants to PUSH money to itself from the mandate, it will first create an invoice on its Acquirer.

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
  },
  "amount": 100
}
```


```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: https://acquirer.wallet/sessions/2d24bd87-1afc-465e-a4ec-07cb4f70f7b0

{
  "name": "//acquirer.wallet/invoices/2d24bd87-1afc-465e-a4ec-07cb4f70f7b0",
  "subject": "$acquirer.wallet/merchant",
  "amount": 200,
  "asset": {
    "code": "USD",
    "scale": 2
  },
  "received": 0
}
```

### Submit invoice to mandate

Using the created invoice it will submit a SPEND against the mandate using the invoice name

```http
POST /mandates/2fad69d0-7997-4543-8346-69b418c479a6/spend HTTP/1.1
Host: issuer.wallet
Authorization: Bearer random_auth_token
Accept: application/json
Content-Type: application/json

{
  "invoice": "//acquirer.wallet/invoices/2d24bd87-1afc-465e-a4ec-07cb4f70f7b0"
}

```

```http
HTTP/1.1 201 Created
```

This will instruct the Issuer to perform a payment of the invoice within the scope of the given mandate.

### Payment

In order for the Issuer to complete the payment it would need to get payment details from the invoice. By doing a GET against
the invoice it can get the required `destination_address` and `shared_secret`

```http
GET /invoices/2d24bd87-1afc-465e-a4ec-07cb4f70f7b0 HTTP/1.1
Host: acquirer.wallet
Accept: application/json
Content-Type: application/json

{
  "subject": "$acquirer.wallet/merchant",
  "asset": {
    "code": "USD",
    "scale": 2
  },
  "amount": 100,
  "received": 0,
  "destination_address": "g.aquirer.42e0f0c9284ad401b7c941bc6173f4e",
  "shared_secret": "AvLaEGc+ojGHVezQF9DC4/7F5YIvrNPx/VM+4hJkCbs=",
}
```

The Issuer uses the payment details to perform the payment over Interledger using STREAM. 

As payments are fulfilled, the `received` amount on the invoice would increase to reflect the payments.

## 6. Check payment

The merchant would validate the payment of the invoice with the Acquirer. This could be achieved through polling against the invoice
or the Acquirer could provide convenience webhooks for the merchant to get notified of successful payments. This is left up to Wallets to
decide to implement.
