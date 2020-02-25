---
id: mandates
title: Mandates
---

Note to self: check this out https://stripe.com/docs/api/mandates/object
* Nice properties to have: 
    * Acceptance
    * status
    * Multiuse? Not sure if this is needed but could be nice

Mandates represents delegated access resource to a users account.

| Property    | Type           | Required |
|-------------|----------------|----------|
| id          | UUID           | Yes      |
| amount      | int64          | Yes      |
| assetCode   | string         | Yes      |
| assetScale  | int32          | Yes      |
| scope       | PaymentPointer | Yes      |
| startAt     | DateTime       | No       |
| expiresAt   | DateTime       | No       |
| interval    | ISO Duration   | No       |
| callbackUrl | URL            | No       |

## Tracking Usage

## APIs

### Create

```http
POST /mandates HTTP/1.1
Host: issuer.wallet
Accept: application/json
Content-Type: application/json

{
  "amount": 200,
  "assetCode" : "USD",
  "assetScale": 2,
  "interval": "P1M",
  "scope": "issuer.wallet/user"
}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "name": "//issuer.wallet/mandates/2fad69d0-7997-4543-8346-69b418c479a6",
  "amount": 200,
  "assetCode" : "USD",
  "assetScale": 2,
  "interval": "P1M",
  "startAt": "2020-01-22T00:00:00Z",
  "startAt": "2020-01-22T00:00:00Z",
  "scope": "issuer.wallet/user",
  "balance": 200
}
```

### Get

### Spend
