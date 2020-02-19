---
id: invoices
title: Invoices
---

## Invoices

Invoice represents an amount payable that can be presented to a third party and/or a mandate to pay. 

| Property    | Type                |
|-------------|---------------------| 
| id          | UUID                |
| amount      | int64               |
| assetCode   | string              |
| assetScale  | int32               |
| received    | int64               |
| expiresAt   | DateTime            |
| subject     | Payment Pointer     |
| description | string              |

### STREAM Credentials

### Tracking Money Received

### APIs

#### Create

A Client creates an Invoice by doing an HTTP POST of JSON document to the Invoices URL of the Invoices URI as defined in
the OP Metadata.

The JSON document MUST include the following:
* amount
* assetCode
* assetScale
* subject

and MAY include the following:
* description

The Open Payments Server MUST respond with a Invoice Response or an error (TDB).

The following is a non-normative example where the Client created an invoice at the Acquirer Wallet

```http
POST /invoices HTTP/1.1
Host: acquirer.wallet
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi...
Accept: application/json
Content-Type: application/json

{
  "subject": "$acquirer.wallet/receiver",
  "assetCode": "USD",
  "assetScale": 2,
  "amount": 200,
  "description": "Paying for goods"
}
```

with a non-normative response from the Open Payments Server

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: https://acquirer.wallet/invoices/0f09dc92-84ad-401b-a7c9-441bc6173f4e

{
  "name": "//acquirer.wallet/invoices/0f09dc92-84ad-401b-a7c9-441bc6173f4e",
  "subject": "$acquirer.wallet/merchant",
  "amount": 200,
  "assetCode": "USD",
  "assetScale": 2,
  "description": "Paying for goods"
  "received": 0
}
```

#### Get

The Client reads the invoice by doing a HTTP GET of the corresponding Invoice name as URI. The Open Payments Server
MUST respond with either an Invoice Response or an Error (TBD)

The following is a non-normative example where the Client reads an invoice

```http
GET /invoices/0f09dc92-84ad-401b-a7c9-441bc6173f4e HTTP/1.1
Host: acquirer.wallet
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi...
Accept: application/json
Content-Type: application/json

{
  "name": "//acquirer.wallet/invoices/0f09dc92-84ad-401b-a7c9-441bc6173f4e",
  "subject": "$acquirer.wallet/merchant",
  "amount": 200,
  "assetCode": "USD",
  "assetScale": 2,
  "description": "Paying for goods"
  "received": 158
}
```

#### Payment Details

The Client gets the payment details of an Invoice by doing a HTTP OPTIONS of the corresponding Invoice name as URI. The Open 
Payments Server MUST respond with either an Payment Details Response or an Error (TBD)

The following is a non-normative example of a Client getting the payment details for an invoice

```http
OPTIONS invocies/2d24bd87-1afc-465e-a4ec-07cb4f70f7b0 HTTP/1.1
Host: acquirer.wallet
Accept: application/json
```

with a non-normative response from the Open Payments Server as

```http
HTTP/1.1 200 Ok
Content-Type: application/json
Location: https://acquirer.wallet/invocies/2d24bd87-1afc-465e-a4ec-07cb4f70f7b0

{
  "ilpAddress": "example.ilpdemo.red.bob",
  "sharedSecret": "6jR5iNIVRvqeasJeCty6C+YB5X9FhSOUPCL/5nha5Vs="
}
```

