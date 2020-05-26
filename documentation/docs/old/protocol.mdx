---
id: protocol
title: Protocol
---

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

Open Payments uses standard web technologies, combined with Interledger, to
allow a **client** (initiating the transaction) to push money to, or pull money
from, a **counter-party** (accepting the transaction).

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

With Open Payments, payments are sent to invoices or received from mandates,
which are created against accounts, which are identified by
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
borrowed from standard identity ontologies and in the Open Payments ecosystem it
is assumed that the `subject` of a Payment Pointer is also the entity that owns
any funds pushed to that pointer or pulled from it.

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

Open Payments defines the well-known URL `/.well-known/open-payments` but, as
specified in [RFC8414](https://tools.ietf.org/html/rfc8414), allows for the same
document to be served at multiple URLs such as
`/.well-known/oauth-authorization-server` or `./well-known/openid-configuration`
which are already in wide use.

The meta-data document MUST be queried using an HTTP "GET" request at the
previously specified path.

The client would make the following request when the issuer identifier is
`https://wallet.example` and the well-known URI suffix is `open-payments` to
obtain the metadata, since the issuer identifier contains no path component:

```http
GET /.well-known/open-payments HTTP/1.1
Host: wallet.example
```

From [RFC8414](https://tools.ietf.org/html/rfc8414):

> The document is a set of claims about the `subject`'s configuration, including
> all necessary endpoints and public key location information. A successful
> response MUST use the 200 OK HTTP status code and return a JSON object using
> the `application/json` content type that contains a set of claims as its
> members that are a subset of the metadata values defined in
> [RFC8414 Section 2](https://tools.ietf.org/html/rfc8414#section-2)

Open Payments defines the following additional claims:

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