---
id: mandates
title: Mandates
---

Mandates represents delegated access to a users account.

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
