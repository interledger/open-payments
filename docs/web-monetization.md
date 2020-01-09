---
id: web-monetization
title: Web Monetization
---

Below is a non-normative example of the creation of a session to send money to
`$wallet.example/alice`. We assume that the client has previously performed a
`GET` request to `https://wallet.example/.well-known/open-payments` and the
response included the following snippet:

```json
"payment_sessions_endpoint": "https://wallet.example/sessions"
```

When creating a session the client MAY specify the session id, however this MUST
be a UUID and is provided as a query string parameter in the URL using the key
`session_id`. If the client doesn't provide an id then the issuer should
generate one.

The client MUST specify the subject of the session using the Payment Pointer
that identifies the subject.

The client MAY also specify the asset of the session. This SHOULD be an asset
from the supported list in the server's meta-data.

The asset of the session is necessarily the same as the asset of the receiver's
account. If the receiver's account is denominated in a different asset then the
wallet MUST apply a conversion to any payments received at the time they are
received and account for the payment in the asset of the session.

The client MAY provide a JWT bearer token in the `Authorization` header which
identifies the client. This uses the `Bearer` authorization scheme.

If provided, this JWT only has one required claim, `iss` which is the issuer
identifier of the sending system (Web Monetization Provider). i.e. The sender
(subject) is not identifying themselves to the receiving system but they are
asserting that they hold their account with the issuer.

To bind the JWT to the current session the `jti` claim MUST be equal to the
session id.

```http
POST /sessions?session_id=4309dc23-12ad-401c-3ec9-551bc61765ab7 HTTP/1.1
Host: wallet.example
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi...
Accept: application/json
Content-Type: application/json

{
  "subject": "$wallet.example/alice",
  "asset": {
    "code": "USD",
    "scale": 6
  }
}
```

A successful `201` response will return a unique set of STREAM credentials to
use to connect to the wallet and begin sending payments. It will also return the
unique URL identifier of the session in a `Location` header.

The STREAM credentials generated MUST never be returned again. The server SHOULD
use a random nonce and the session identifier or reference to generate the
STREAM credentials in such a way that it is possible for it to correlate any
incoming connections to the session.

Below is a non-normative example of a successful response to the creation of a
session to send money to `$wallet.example/alice`.

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: https://wallet.example/sessions/0f09dc92-84ad-401b-a7c9-441bc6173f4e

{
  "name": "//wallet.example/sessions/0f09dc92-84ad-401b-a7c9-441bc6173f4e",
  "subject": "$wallet.example/alice",
  "destination": "g.example.42e0f0c9284ad401b7c941bc6173f4e",
  "shared_secret": "AvLaEGc+ojGHVezQF9DC4/7F5YIvrNPx/VM+4hJkCbs=",
  "asset": {
    "code": "USD",
    "scale": 6
  },
  "received": 0,
  "spent": 0,
  "expire_time": "2019-12-12T00:56:00.123Z"
}
```

#### Errors

If the server is unable to create the session it MUST return an HTTP error
indicating the cause.

In the case of a duplicate `session_id` being provided the error MUST be
`409 Conflict`.

In the case of an invalid asset being specified the error MUST be
`422 Unprocessable Entity`.

If the subject of the request is unknown the response must be `404 Not Found`.

If the client sends a JWT to identify the sending system and this is invalid or
rejected by the receiver then the response MUST be `401 Unauthorized`

#### Payments

The sender can now begin sending packets to the address and secret provided by
the wallet for the session.

As payments are fulfilled, the balance on the session account increases.

GET requests to the unique resource URL of the session will return the current
state (including the current cleared balance).

Wallets MAY require authorization to access the session resource that has been
created.

The `expire-time` field indicates the time that the issuer will persist the
session if no payment is made toward it. Issuers MAY expire and delete sessions
that have had no payments. The amount of time to allow is an issuer choice.

The issuer MAY also track payments received against the sender, identified by
their issuer identifier (the value of the `iss` claim in the JWT used to
initiate the session).

Wallets that track this SHOULD provide an API for the subject or an authorized
third-party to query this balance.

> NOTE: This API is not yet defined.

#### Tracking Spending

As a convenience for third-parties that are delivering services on behalf of the
subject the wallet SHOULD allow the subject and/or authorized third-parties to
track spending of the funds collected during the session.

This is done by the subject/third-party posting a spend against the session
which will increase the `spent` balance for the session.

**Note:** No money moves out of the subject's account. This API is simply a
means of tracking a second balance against the session which allows for more
granular control by the subject/third-party over real-time delivery of services
or content in exchange for payment

A spend is submitted as a `POST` to the `/spend` sub-resource of the session.

If the sending system/web monetization provider was identified during session
creation (provided a JWT to authorize the request) the wallet MAY track spending
against the sending system/web monetization provider too.

This is done at the discretion of the wallet and would allow the
subject/third-party to query for the total received AND spent by users of a
specific provider.

```http
POST /sessions/0f09dc92-84ad-401b-a7c9-441bc6173f4e/spend HTTP/1.1
Host: wallet.example
Accept: application/json
Content-Type: application/json

{
  "amount": "200"
}
```

The response is the latest state of the session:

```http
HTTP/1.1 200 Success
Content-Type: application/json
Location: https://wallet.example/sessions/0f09dc92-84ad-401b-a7c9-441bc6173f4e

{
  "name": "//wallet.example/sessions/0f09dc92-84ad-401b-a7c9-441bc6173f4e",
  "subject": "$wallet.example/alice",
  "asset": {
    "code": "USD",
    "scale": 6
  },
  "received": "2312",
  "spent": "312",
  "expire_time": "2019-12-12T00:59:00.145Z"
}
```

Wallet's SHOULD extend the `expire_time` on a session whenever a payment is
received or a spend is created.

If the amount spent exceeds the amount received the spend will still be created.
It is at the discretion of the subject/third-party whether they will continue to
deliver a service or content in this case.

For example, if the spent balance exceeds the received balance for the current
session but the subject/third-party determines that the total received for all
sessions created by the same Web Monetization provider in the last 24 hours is
higher than the total spends then the subject/third-party MAY choose to continue
delivering the service or content.

#### Authentication of the Sending System

If the sending system/web monetization provider attempts to authenticate itself
during session creation, by providing a JWT as a Bearer token on the request,
then the signature of the JWT MUST be validated AND the `jti` claim in the token
MUST be equal to the session id for a successful authentication.

If the `jti` claim doesn't match the session id the token should be considered
invalid as it's likely this token is being replayed from another session or has
been generated for another user.

If the wallet is not performing any alternative processing based on the identity
of the sending system then there is no need to authenticate the sending system.

To validate the JWT the wallet MUST fetch the issuer's public keys using the
published meta-data as described in [meta data](#meta-data) and validate the JWT
signature [RFC8414](https://tools.ietf.org/html/rfc8414).

For example, given the following JWT headers:

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "NjVBRjY5MDlCMUIwNzU4RTA2QzZFMDQ4QzQ2MDAyQjVDNjk1RTM2Qg"
}
```

and payload:

```json
{
  "iss": "http://sender.example",
  "jti": "0f09dc92-84ad-401b-a7c9-441bc6173f4e"
}
```

The wallet identifies the sending system as `http://sender.example`. The meta
data for this system is at `http://sender.example/.well-known/open-payments`.

The wallet should expect to find a key set URI in the meta data, with the claim
name `jwks_uri`. If this claim is not present then the wallet should respond to
the session creation request with a `401 Unauthorized` response.

The wallet MUST get the signing keys used by the sending system from this URL
and use these to validate the signature on the JWT provided in the request.

#### Compatibility with SPSP

As a transition from SPSP to Open Payments, Open Payments servers MAY treat an
SPSP request to the Payment Pointer URL as a shortcut to session creation.

The request MUST use the header `Accept: application/spsp4+json` to identify
them as a legacy SPSP request. In this case the response will also use the
`Content-Type: application/spsp4+json` header to ensure compatibility with
legacy clients.

**Example:** If a user presents the Payment Pointer `$wallet.example/alice` then
a GET request to `https://wallet.example/alice` MAY be handled like a POST to
the issuer's session endpoint.

The presence of a `web-monetization-id` header maps to the presentment of a
`session_id` query parameter.

The following example is equivalent to the POST request example above:

```http
GET /alice HTTP/1.1
Host: wallet.example
Accept: application/spsp4+json
Web-Monetization-Id: 0f09dc92-84ad-401b-a7c9-441bc6173f4e
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi...
```

This MUST return either an error response or a response such as:

```http
HTTP/1.1 200 Success
Content-Type: application/spsp4+json
Location: https://wallet.example/sessions/0f09dc92-84ad-401b-a7c9-441bc6173f4e

{
  "name": "//wallet.example/sessions/0f09dc92-84ad-401b-a7c9-441bc6173f4e",
  "subject": "$wallet.example/alice",
  "destination": "g.example.42e0f0c9284ad401b7c941bc6173f4e",
  "shared_secret": "AvLaEGc+ojGHVezQF9DC4/7F5YIvrNPx/VM+4hJkCbs=",
  "asset": {
    "code": "USD",
    "scale": 6
  },
  "balance": 0,
  "expire_time": "2019-12-12T00:56:00.123Z"
}
```
