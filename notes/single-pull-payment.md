# Single Pull Payment (E-Commerce)

## Use Case
* **OnlineShop** is an online merchant
* **Alice** is a shopper at OnlineShop and an account holder at Fynbos
* **Fynbos** is Alice’s account provider
* **Uphold** is OnlineShop’s account provider
* Alice visits OnlineShop and wishes to purchase an item, paying with Interledger / OpenPayments
* OnlineShop wishes to connect to Alice's account to pay itself

### Step 1: OnlineShop creates an Incoming Payment to receive Alice's payment

When setting up its account at Uphold, OnlineShop requests a long-lived grant to create, read, delete, and complete Incoming Payments. 

OnlineShop makes a Grant Request to Uphold at `https://uphold.com/auth`:

```json
{
    "access_token": {
        "access": [
            {
                "type": "incoming-payment",
                "actions": [
                    "create",
                    "read",
                    "delete",
                    "complete"
                ],
                "locations": [
                    "https://uphold.com/onlineshop"
                ]
            }
        ]
    },
    "client": {
        "key": {
            "proof": "httpsig",
            "jwk": {
                "kty": "RSA",
                "e": "AQAB",
                "kid": "xyz-1",
                "alg": "RS256",
                "n": "kOB5rR4Jv0GMeL...."
            }
        }
    }
}
```

Since OnlineShop it logged in at Uphold when making that request, the grant is issued right away.

```json
{
    "access_token": {
        "value": "OS9M2PMHKUR64TB8N6BW7OZB8CDFONP219RP1LT0",
        "manage": "https://uphold.com/auth/token/PRY5NM33OM4TB8N6BW7",
        "access": [
            {
                "type": "incoming-payment",
                "actions": [
                    "create", 
                    "read",
                    "delete",
                    "complete"
                ],
                "locations": [
                    "https://uphold.com/onlineshop"
                ]
            }
        ]
    },
    "continue": {
        "access_token": {
            "value": "80UPRY5NM33OMUKMKSKU"
        },
        "uri": "https://uphold.com/auth/continue"
    }
}
```

Using the access token associated with that grant, OnlineShop creates an Incoming Payment to accept Alice's payment for her purchase.

```http
POST /onlineshop HTTP/1.1
Host: uphold.com
Content-Type: application/op-incoming-payment-v1+json
Accept: application/op-incoming-payment-v1+json
Signature-Input: gnap=("@request-target" "host" "authorization");created=1624564850;keyid="xyz-client"
Signature: gnap=:EN/rExQ/knVi61P5AFhyMGN7aVPzk/9C7nsYAWF2RvzsoV1uNxGZklM55qCIQpuhoNty4EhiH7iwuzZBbRCQcQ==:
Authorization: GNAP OS9M2PMHKUR64TB8N6BW7OZB8CDFONP219RP1LT0

{
    "incomingAmount": {
        "amount": "4000",
        "assetCode": "EUR",
        "assetScale": 2
    },
    "externalRef": "INV2022-02-0137"
}
```

Uphold has checked that OnlineShop is authorised to create the payment. It returns a response:

```http
HTTP/1.1 201 Created
Content-Type: application/op-incoming-payment-v1+json

{
    "id": "https://uphold.com/onlineshop/fi7td6dito8yf6t"
    "accountId": "https://uphold.com/onlineshop",
    "state": "pending",
    "incomingAmount": {
        "amount": 4000,
        "assetCode": "EUR",
        "assetScale": 2
    },
    "externalRef": "INV2022-02-0137"
}
```

### Step 2: Alice grants OnlineShop access to her account for the amount of her purchase

Alice provides OnlineShop with her Payment Pointer: `https://fynbos.me/alice`.

OnlineShop queries the Payment Pointer to get the grant request endpoint URL.

```http
GET /alice HTTP/1.1
Host: fynbos.me
Accept: application/op-account-v1+json
```

Fynbos responds:

```http
HTTP/1.1 200 Success
Content-Type: application/op-alice-v1+json

{
    "id": "https://fynbos.me/alice",
    "publicName": "Alice"
    "assetCode": "USD",
    "assetScale": 2
    "authServer": "https://fynbos.dev/auth"
}
```

OnlineShop makes a Grant Request to Fynbos at `https://fynbos.dev/auth`:

```json
{
    "access_token": {
        "access": [
            {
                "type": "outgoing-payment",
                "actions": [
                    "create", 
                    "authorize"
                ],
                "locations": [
                    "https://fynbos.me/alice"
                ],
                "receiver": "https://uphold.com/onlineshop/fi7td6dito8yf6t"
            }
        ]
    },
    "client": {
        "display": {
            "name": "Online Shop",
            "uri": "https://onlineshop.com"
        },
        "key": {
            "proof": "httpsig",
            "jwk": {
                "kty": "RSA",
                "e": "AQAB",
                "kid": "xyz-1",
                "alg": "RS256",
                "n": "kOB5rR4Jv0GMeL...."
            }
        }
    },
    "interact": {
        "start": [
            "redirect"
        ],
        "finish": {
            "method": "redirect",
            "uri": "https://onlineshop.com/return/876FGRD8VC",
            "nonce": "LKLTI25DK82FX4T4QFZC"
        }
    }
}
```

Fynbos sends back an instruction to OnlineShop to redirect Alice to a Fynbos web page to authenticate herself and consent to the grant request.

```json
{
    "interact": {
        "redirect": "https://fynbos.dev/auth/4CF492MLVMSW9MKMXKHQ",
        "finish": "MBDOFXG4Y5CVJCX821LH"
    },
    "continue": {
        "access_token": {
            "value": "80UPRY5NM33OMUKMKSKU"
        },
        "uri": "https://fynbos.dev/auth/continue"
    }
}
```

OnlineShop directs Alice to `https://fynbos.dev/auth/4CF492MLVMSW9MKMXKHQ` which is a web page hosted by Fynbos.

In parallel, Fynbos has fetched the details of the incoming payment at `https://uphold.com/onlineshop/fi7td6dito8yf6t`.

Fynbos authenticates Alice and then prompts Alice to consent to giving OnlineShop access to her account to authorize the payment.

Since Alice's account is in USD and the payment Alice needs to make to complete her purchase is in EUR, Fynbos automatically quotes that payment.

![](https://i.imgur.com/C1y977L.png)

Fynbos redirects Alice to `https://onlineshop.com/return/876FGRD8VC?hash=p28jsq0Y2KK3WS__a42tavNC64ldGTBroywsWxT4md_jZQ1R2HZT8BOWYHcLmObM7XHPAdJzTZMtKBsaraJ64A&interact_ref=4IFWWIKYBC2PQ6U56NL1`

- The URL was provided by OnlineShop in the grant request
- The `interact_ref` is a random value generated by Fynbos
- The `hash` was calculated by Fynbos based on:
  - the `nonce` OnlineShop provided in the original request (`LKLTI25DK82FX4T4QFZC`), 
  - the `nonce` Fynbos provided in the response (`MBDOFXG4Y5CVJCX821LH`)
  - the `interact_ref`, and
  - the URL of the grant request endpoint `https://fynbos.dev/auth`.

OnlineShop validates the hash and then makes a continue request to Fynbos at `https://fynbos.dev/auth/continue` using the access token `80UPRY5NM33OMUKMKSKU`.

Fynbos responds to OnlineShop with the following:

```json
{
    "access_token": {
        "value": "T0OS9M2PMHKUR64TB8N6BW7OZB8CDFONP219RP1L",
        "manage": "https://fynbos.dev/auth/token/W7PRY5NM33OM4TB8N6B",
        "expires_in": 762534,
        "access": [
        {
            "type": "outgoing-payment",
            "actions": [
                "create", 
                "authorize",
            ],
            "locations": [
                "https://fynbos.me/alice"
            ],
            "grant": "W7PRY5NM33OM4TB8N6B",
            "limits": {
                "sendAmount": {
                    "amount": 4596,
                    "assetCode": "USD",
                    "assetScale": 2
                }
            }
            "receiver": "https://uphold.com/onlineshop/fi7td6dito8yf6t"
        }]
    },
    "continue": {
        "access_token": {
            "value": "5UYT98RY5NM33OMUKMK6"
        },
        "uri": "https://fynbos.dev/auth/continue"
    }
}
```
OnlineShop now has a grant to create and authorize an outgoing payment from Alice's account to its own account, specifically to the incoming payment it created in [Step 1](#Step-1-OnlineShop-creates-an-Incoming-Payment-to-receive-Alice%E2%80%99s-payment).

### Step 3: OnlineShop sends the payment from Alice's account into its account

OnlineShop creates the outgoing payment at Alice's Payment Pointer:

```http
POST /alice HTTP/1.1
Host: fynbos.me
Content-Type: application/op-outgoing-payment-v1+json
Accept: application/op-outgoing-payment-v1+json
Signature-Input: gnap=("@request-target" "host" "authorization");created=1624564850;keyid="xyz-client"
Signature: gnap=:EN/rExQ/knVi61P5AFhyMGN7aVPzk/9C7nsYAWF2RvzsoV1uNxGZklM55qCIQpuhoNty4EhiH7iwuzZBbRCQcQ==:
Authorization: GNAP T0OS9M2PMHKUR64TB8N6BW7OZB8CDFONP219RP1L

{
    "state": "authorized",
    "receiver": "https://uphold.com/onlineshop/fi7td6dito8yf6t"
}
```

Within Fynbos the resource server (Rafiki) checks the grant associated with the provided token and gets the following response.

```json
{
    "active": true,
    "access": [
        {
            "type": "outgoing-payment",
            "actions": [
                "create"
                "authorize"
            ],
            "locations": [
                "https://fynbos.me/alice/"
            ],
            "grant": "PRY5NM33OM4TB8N6BW7",
            "receiver": "https://uphold.com/onlineshop/fi7td6dito8yf6t"
        }        
    ],
    "key": {
        "proof": "httpsig",
        "jwk": {
            "kty": "RSA",
            "e": "AQAB",
            "kid": "xyz-1",
            "alg": "RS256",
            "n": "kOB5rR4Jv0GMeL...."
        }
    },
}
```

Fynbos has checked that OnlineShop is authorised to create the payment. It returns a response:

```http
HTTP/1.1 201 Created
Content-Type: application/op-outgoing-payment-v1+json

{
    "id": "https://fynbos.me/alice/6tfi7td6dito8yf"
    "accountId": "https://fynbos.me/alice/",
    "state": "authorized",
    "receiver": "https://uphold.com/onlineshop/fi7td6dito8yf6t"
}
```

Since the payment is authorised, Fynbos will automatically start sending the money to `https://uphold.com/onlineshop/fi7td6dito8yf6t`. Therefore, it will query the receiver endpoint

```http
GET /onlineshop/fi7td6dito8yf6t HTTP/1.1
Host: uphold.com
Accept: application/ilp-stream-v1+json
```

and receive the STREAM credentials

```http
HTTP/1.1 200 OK
Content-Type: application/ilp-stream-v1+json

{
    "id": "https://uphold.com/onlineshop/fi7td6dito8yf6t",
    "ilpAddress": "g.uphold.Cty6C+YB5X9FhSOUPCL",
    "sharedSecret": "6jR5iNIVRvqeasJeCty6C+YB5X9FhSOUPCL/5nha5Vs=",
    "receiptsEnabled": false
}
```

Fynbos opens a STREAM connection and starts sending until it has sent 40 EUR (Uphold does not accept any more packets) or 45.96 USD.

### Edge Case: The quoted amount does not cover the incoming payment receive amount

Fynbos has sent 45.96 USD out of Alice's account to OnlineShop's account at `https://uphold.com/onlineshop/fi7td6dito8yf6t`. Unfortunately, the quoted and authorized amount of 45.96 USD does not result in a received amount of 40 EUR by OnlineShop. It only received 39.98 EUR. 

#### Case 1: OnlineShop completes the underpaid incoming payment

Underpayment should rarely ever happen because account providers add an extensive slippage to their quote when asking for user consent. 

For user experience it is beneficial if OnlineShop accepts the incoming payment as completed, even though it has not been paid in full. 

After a certain amount of time has passed, it will mark the payment as complete, using an access token it has obtained after rotating the old token.

```http
PUT /onlineshop/fi7td6dito8yf6t HTTP/1.1
Host: uphold.com
Content-Type: application/op-incoming-payment-v1+json
Accept: application/op-incoming-payment-v1+json
Signature-Input: gnap=("@request-target" "host" "authorization");created=1624564850;keyid="xyz-client"
Signature: gnap=:EN/rExQ/knVi61P5AFhyMGN7aVPzk/9C7nsYAWF2RvzsoV1uNxGZklM55qCIQpuhoNty4EhiH7iwuzZBbRCQcQ==:
Authorization: GNAP 1LT0OS9M2PMHKUR64TB8N6BW7OZB8CDFONP219RP1LT0

{
    "status": "complete"
}
```

Uphold responds:

```http
HTTP/1.1 200 Success
Content-Type: application/op-incoming-payment-v1+json

{
    "id": "https://uphold.com/onlineshop/fi7td6dito8yf6t",
    "accountId": "https://uphold.com/onlineshop",
    "state": "completed",
    "receiver": "https://uphold.com/onlineshop/fi7td6dito8yf6t",
    "receivedAmount": {
        "amount": 3998,
        "assetCode": "EUR",
        "assetScale": 2
    },
    "externalRef": "INV2022-02-0137"
}
```

#### Case 2: Alice is required to pay the difference

OnlineShop notifies Alice (either while she is still on its page or via email) that the invoice amount has not been fully paid. It asks her to pay the difference in order to complete the incoming payment. 

Hence, OnlineShop wants to create a new outgoing payment from Alice's account for 0.02 EUR. The process is the same as described in [Step 2](#Step-2-Alice-grants-OnlineShop-access-to-her-account-for-the-amount-of-her-purchase) and [Step 3](#Step-3-OnlineShop-sends-the-payment-from-Alice%E2%80%99s-account-into-its-account).

Once the full amount has reached OnlineShop's account, it marks the payment as complete.

```http
PUT /onlineshop/fi7td6dito8yf6t HTTP/1.1
Host: uphold.com
Content-Type: application/op-incoming-payment-v1+json
Accept: application/op-incoming-payment-v1+json
Signature-Input: gnap=("@request-target" "host" "authorization");created=1624564850;keyid="xyz-client"
Signature: gnap=:EN/rExQ/knVi61P5AFhyMGN7aVPzk/9C7nsYAWF2RvzsoV1uNxGZklM55qCIQpuhoNty4EhiH7iwuzZBbRCQcQ==:
Authorization: GNAP 1LT0OS9M2PMHKUR64TB8N6BW7OZB8CDFONP219RP1LT0

{
    "status": "complete"
}
```

Uphold responds:

```http
HTTP/1.1 200 Success
Content-Type: application/op-incoming-payment-v1+json

{
    "id": "https://uphold.com/onlineshop/fi7td6dito8yf6t",
    "accountId": "https://uphold.com/onlineshop",
    "state": "completed",
    "receiver": "https://uphold.com/onlineshop/fi7td6dito8yf6t",
    "receivedAmount": {
        "amount": 4000,
        "assetCode": "EUR",
        "assetScale": 2
    },
    "externalRef": "INV2022-02-0137"
}
```