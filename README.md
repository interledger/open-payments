# Open Payments (OPay)

Open Payments (OPay) builds on the OAuth and Open ID Connect frameworks to
define standard authorization flows for payments using the Interledger protocol
for a variety of payment use cases.

## Background

OPay is an evolution of the Simple Payment Setup Protocol (SPSP), providing
support for new use cases and integrating into OAuth 2.0 so that existing
identity infrastructure can be leveraged to handle payments authorization.

In the sections that follow, functions and features of OPay are compared with
analogous functions and features of SPSP to help implementors that are upgrading
to OPay from SPSP understand the differences (and similarities).

OPay is backwards-compatible with SPSP but certain features of SPSP are proposed
to be deprecated in order to clean up the protocol and remove ambiguity.

## OAuth 2.0 and Open ID Connect

OPay embraces the tight relationship between identity, security, and payments
and the need for payments systems to offer a way for access to be secure and
authenticated with complex authorization logic being the critical feature that
unlocks different use cases.

For that reason the OPay builds directly on OAuth 2.0 and Open ID Connect to
handle use cases where authorization and identity are required.

OAuth 2.0 and OpenID Connect have become the defacto standard for
authentication, authorization and user information exchange on the Internet.
OPay is designed to integrate easily into existing online systems.

### Payment Pointers

One of the features of Open ID Connect that has been less widely supported than
others is the discovery of the user's provider through their email address or
URL.

We believe there are various reasons for this. One of these is a desire by
dominant providers (Google, Facebook, Twitter) to establish their user profiles
as defacto standard identities on the Web which has significant commercial value
to these companies. (e.g. Google encourages websites using Open ID Connect to
offer a "Login with Google" option rather than "Login with Open ID Connect")

Another reason is that Open ID Connect attempts to overload email addresses as a
user identifier. As such, not all email addresses work as Open ID Connect
identifiers resulting in a frustrating UX for users that attempt to login with
their email address if their host is not an Open ID Connect provider.

In contrast to this, we consider Payment Pointers an excellent tool for user
account discovery. Payment Pointers have a single purpose, to point a client at
the payment services of the subject of the Payment Pointer.

OPay defines a complete account discovery protocol based on Payment Pointers and
leveraging the existing server meta-data standards defined for OAuth 2.

Using this protocol, the end user can provide their Payment Pointer to a
counter-party or app which is then able to discover the necessary endpoints to
interact with the user's account using Interledger.

See [Discovery](#discovery) for more details.

### Financial-grade API

The Open ID Foundation's [Financial-grade API WG](https://openid.net/wg/fapi/)
is currently developing OAuth 2.0 profiles which further enhance the security of
using OAuth 2.0 for the use of financial APIs.

These are being widely adopted by the financial services industry, especially by
groups developing Open Banking APIs suggesting this is a safe technology bet.

## Sessions, Invoices and Mandates (Agreements)

Building on the excellent work by Sabine Bertram on Pull Payments using SPSP we
have split the concept of **Agreements** into **Invoices** and **Mandates** and
made them an integral part of all OPay interactions.

To support the streaming nature of Interledger payments and especially the Web
Monetization use case, we define **Sessions** which are ephemeral sub-accounts
that are created to track incoming payments that are not linked to an issued
**Invoice**.

Payments are a highly regulated ecosystem. While ILP provides for incredible new
levels of interoperability and scalability participants in the ecosystem are
still subject to regulations that vary depending on what they do.

**Invoices** and **Sessions** codify a proposed payment from a sender to a
receiver. **Mandates** codify the agreement by a sender to allow one or more
future payments to a receiver (initiated by the receiver). With OPay, payments
are only made following the creation of an **Agreement**.

**Invoices** and **Sessions** are distinct from authorizations because in some
cases they don't require explicit authorization, such as when a sender is
sending micro-payments to a receiver for Web Monetization. (In this case the
creation of the **Session** is somewhat analogous to using SPSP to setup a
payment).

In all cases, the initiator of a payment will create either a **Session**,
**Invoice** or **Mandate** at the wallet of the other party and then, if
necessary, request authorization to execute the payment described by the
**Agreement**.

**Agreements** are resources on the Web under the same origin as the user's
account provider (wallet). They are serialized as JSON and can be managed
through standard HTTP.

The endpoints at which **Agreements** are managed are discovered through the
_Payment Pointer_ of the counter-party. See [Discovery](#discovery).

An **Invoice** or **Sessions** is created for all **push payments** (crediting
the counter-party) and a **Mandate** is created for all **pull payments**
(debiting the counter-party). **Mandates** may permit multiple payments over an
extended period of time (e.g. for subscriptions).

Authorization to execute a payment is granted through the provision of an
_access token_ where the _scope_ of the access token is the **Agreement**
(identified by its unique URL).

**Invoices** and **Sessions** can have one or more unique ILP addresses.
Payments sent to any of these addresses are considered to be linked to that
**Invoice** or **Session**.

At the application layer **Agreements** can correspond to a user session,
invoice, discreet payment or any other commercial construct that it is useful to
correlate a group of payments to.

## Assumptions

The protocols defined here are all used for direct interaction between the
sender and receiver over the Internet using standard Web technologies (HTTP over
TLS) so we also assume both parties are connected to the Internet and capable of
performing secure HTTP requests.

Where a party is not permanently online they will delegate some authority over
their account to an agent such as a wallet provider.

For many use cases it is necessary for a wallet to send to another wallet and be
capable of interacting with that wallet as a "Client" as defined in the OAuth 2
protocol.

Participants MAY support dynamic client registration however this will be at
their discretion on the basis of their regulatory obligations.

Participants may also choose to not allow the anonymous creation of agreements.
For example, a user may choose to disallow unsolicited payments into its
account. In this case, a client may require authorization to create an invoice
or session.

Or, in another case different data may be returned when getting the state of an
invoice or session. For example, an authorized party may be able to create
invoices and another party will be able to get the STREAM connection credentials
required to send money to that invoice but only the authorized party can get the
status (amount paid etc) of the invoice.

# How it works

OPay uses standard web technologies, combined with Interledger, to allow a
**client** (initiating the transaction) to push money to, or pull money from, a
**counter-party** (accepting the transaction).

The key technologies in use are:

- [Payment Pointers](https://paymentpointers.org)
- [Interledger v4 - ILP](https://interledger.org/rfcs/0027-interledger-protocol-4/)
- [STREAM](https://interledger.org/rfcs/0029-stream/)
- [OAuth 2.0 and Open ID Connect](https://openid.net/connect/)

At a very high level, the client makes payments by:

1. using the counter-party's Payment Pointer to resolve endpoints for the
   counter-party's Interledger-enabled financial account.
2. creating an appropriate agreement using an agreements endpoint.
3. if necessary, using OAuth 2 to get an access token that authorizes the client
   to execute payments covered by the agreement.
4. sending/receiving ILP packets to/from the counter-party's account to complete
   payments allowed by the agreement.

## Payment Pointers

With OPay, payments are sent to invoices or received from mandates, which are
created against accounts, which are identified by
[Payment Pointers](https://paymentpointers.org).

In theory an agreement can be treated like a sub-account (if supported by the
wallet) and new agreements can be created that are associated with the parent
agreement rather than the account.

Sessions ARE ephemeral sub-accounts.

More experimentation is required to determine if this is a feature worth
supporting for wallets.

### Terminology

All Payment Pointers have a `subject`, the entity that owns or controls the
resource that is accessed via the URL resolved from the pointer. This concept is
borrowed from standard identity ontologies and in the OPay ecosystem it is
assumed that the `subject` of a Payment Pointer is also the entity that owns any
funds pushed to that pointer or pulled from it.

Payment Pointers also have an `issuer` who controls the domain/origin at which
the pointer is hosted on the Internet.

A common scenario will be a person/company that is sending/receiving money (the
`subject`) and a service that hosts the Interledger-enabled account/wallet
holding the person/company's funds (the `issuer`).

## Discovery

When an entity wishes to push/pull money to/from a Payment Pointer they will
resolve the Payment Pointer URL and fetch the metadata for the server described
by that URL as defined in [RFC8414](https://tools.ietf.org/html/rfc8414).

### Issuer and Subject

Given a URL that has been resolved from a Payment Pointer a client can derive
both the issuer identifier and subject identifier.

Payment Pointers resolve to HTTPS URLs which are the unique subject identifiers
for the subject of the Payment Pointer.

The issuer identifier is the same URL with the `path`, `query string` and
`fragment` trimmed away.

E.g. Given the Payment Pointer `$wallet.example/alice` the subject identifier is
`https://wallet.example/alice` and the issuer identifier is
`https://wallet.example`.

Once the client has determined the issuer identifier it can retrieve the server
metadata for the issuer.

### Meta-Data

The metadata is a JSON document resource that describes the various service
endpoints that are available to:

- connect to the `subject`'s account via Interledger
- get authorization to perform actions on the `subject`'s account (using OAuth
  2.0)
- get more information about the `subject` (using OpenID Connect)
- create agreements with the `subject`

The document is hosted at a `.well-known` URL relative to the issuer identifier.

[RFC8414](https://tools.ietf.org/html/rfc8414) defines the default well-known
URI string to be `/.well-known/oauth-authorization-server`.

It also states the following:

> Different applications utilizing OAuth authorization servers in
> application-specific ways may define and register different well- known URI
> suffixes used to publish authorization server metadata as used by those
> applications.

OPay defines the well-known URL `/.well-known/opay` but, as specified in
[RFC8414](https://tools.ietf.org/html/rfc8414), allows for the same document to
be served at multiple URLs such as `/.well-known/oauth-authorization-server` or
`./well-known/openid-configuration` which are already in wide use.

The meta-data document MUST be queried using an HTTP "GET" request at the
previously specified path.

The client would make the following request when the issuer identifier is
`https://wallet.example` and the well-known URI suffix is `opay` to obtain the
metadata, since the issuer identifier contains no path component:

```http
GET /.well-known/opay HTTP/1.1
Host: wallet.example
```

From [RFC8414](https://tools.ietf.org/html/rfc8414):

> The document is a set of claims about the `subject`'s configuration, including
> all necessary endpoints and public key location information. A successful
> response MUST use the 200 OK HTTP status code and return a JSON object using
> the `application/json` content type that contains a set of claims as its
> members that are a subset of the metadata values defined in
> [RFC8414 Section 2](https://tools.ietf.org/html/rfc8414#section-2)

OPay defines the following additional claims:

- `payment_invoices_endpoint`  
  URL of the server's invoices endpoint where the client is able to create new
  invoices with the `subject`.

- `payment_mandates_endpoint`  
  URL of the server's mandates endpoint where the client is able to create new
  mandates with the `subject`.

- `payment_sessions_endpoint`  
  URL of the server's sessions endpoint where the client is able to create new
  sessions with the `subject`.

- `payment_assets_supported`  
  A list of asset definitions for assets that can be used to create agreements
  on this server. The schema of an asset definition is defined in
  [Assets](#assets).

Other claims MAY also be returned.

Claims that return multiple values are represented as JSON arrays. Claims with
zero elements MUST be omitted from the response.

An error response uses the applicable HTTP status code value.

The following is a non-normative example response:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "issuer": "https://wallet.example",
  "authorization_endpoint": "https://wallet.example/authorize",
  "token_endpoint": "https://wallet.example/token",
  "token_endpoint_auth_methods_supported": ["client_secret_basic","private_key_jwt"],
  "token_endpoint_auth_signing_alg_values_supported": ["RS256", "ES256"],
  "userinfo_endpoint": "https://wallet.example/userinfo",
  "jwks_uri": "https://wallet.example/jwks.json",
  "registration_endpoint": "https://wallet.example/register",
  "scopes_supported": ["openid","profile","email","address","phone","offline_access"],
  "response_types_supported": ["code", "code token"],
  "service_documentation": "http://wallet.example/service_documentation.html",
  "ui_locales_supported": ["en-US", "en-GB", "en-CA", "fr-FR", "fr-CA"],
  "payment_invoices_endpoint": "https://wallet.example/invoices",
  "payment_mandates_endpoint": "https://wallet.example/mandates",
  "payment_sessions_endpoint": "https://wallet.example/sessions",
  "payment_assets_supported": [
    {"code": "USD", "scale": 6},
    {"code": "EUR", "scale": 8}
  ]
}
```

## Creating Agreements

The client then creates an agreement by making a POST to either the appropriate
endpoint. The `subject` of the agreement is the Payment Pointer.

Upon creation of the agreement the server responds with a `201 Created` response
and a `Location` header containing the URL of the newly created agreement.

The URL is also returned in the `name` field of the response.

This URL (resource name) is the unique identifier for the agreement and is used
by the client in any subsequent authorization requests.

The type of agreement and the data that must be provided will depend on the use
cases as described below.

## Sending Money

Sending money is the simplest case as it would not require interaction from the
receiver unless the receiver or receiver's account provider requires explicit
permission to send to it.

### Use Case: Web Monetization

Below is a non-normative example of the creation of a session to send money to
`$wallet.example/alice`. We assume that the client has previously performed a
`GET` request to `https://wallet.example/.well-known/opay-server` and the
response included the following snippet:

```json
"payment_sessions_endpoint": "https://wallet.example/sessions"
```

The client MAY specify the session id, however this MUST be a UUID and is
provided as a query string parameter in the URL using the key `session_id`. If
the client doesn't provide an id then the issuer should generate one.

The clienT MUST specify the subject of the session using the Payment Pointer
that identifies the subject.

The client MAY also specify the asset of the session. This SHOULD be an asset
from the supported list in the server's meta-data.

The asset of the session is necessarily the same as the asset of the receiver's
account. If the receiver's account is denominated in a different asset then the
wallet MUST apply a conversion to any payments received at the time they are
received and account for the payment in the asset of the session.

```http
POST https://wallet.example/sessions?session_id=4309dc23-12ad-401c-3ec9-551bc61765ab7 HTTP/1.1
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

#### Tracking Spending

As a convenience for third-parties that are delivering services on behalf of the
subject the wallet SHOULD allow authorized third-parties to track spending of
the funds collected during the session.

This is done by the third-party posting a spend against the session which will
reduce the balance in the session account.

**Note:** The money is moved out of the session account but is still held by the
subject (i.e. it moves into the parent account or another sub-account).

A spend is submitted as a `POST` to the `/spend` sub-resource of the session.

```http
POST https://wallet.example/sessions/0f09dc92-84ad-401b-a7c9-441bc6173f4e/spend HTTP/1.1
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

If a `spend` fails because the amount spent exceeds the amount received the
server MUST return a `402 Payment Required` response code and MUST NOT add to
the spent amount.

#### Compatibility with SPSP

As a transition from SPSP to OPay, OPay servers MAY treat an SPSP request to the
Payment Pointer URL as a shortcut to session creation.

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
GET https://wallet.example/alice HTTP/1.1
Accept: application/spsp4+json
Web-Monetization-Id: 0f09dc92-84ad-401b-a7c9-441bc6173f4e
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

# TODO

Describe other use cases:

- [ ] Invoice Payment
- [ ] Online Checkout (Push and Pull)
- [ ] Subscriptions

Provide schema definitions for:

- [ ] Invoice
- [ ] Session
- [ ] Mandate
- [ ] Asset

Describe currency selection options for clients
