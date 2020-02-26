---
id: discovery
title: Discovery
---

When an entity wishes to interact with a User in Open Payments, the first require the Payment Pointer for that User.
A Payment Pointer they will resolve to a Payment Pointer URL. This allows the entity to fetch the metadata for the server described
by that URL as defined in [RFC8414](https://tools.ietf.org/html/rfc8414).

## Issuer and Subject

Given a URL that has been resolved from a Payment Pointer a client can derive
both the issuer identifier and subject identifier. 

Payment Pointers resolve to HTTPS URLs which are the unique subject identifiers
for the subject of the Payment Pointer.

The Issuer identifier is the same URL with the `path`, `query string` and
`fragment` trimmed away.

E.g. Given the Payment Pointer `$wallet.example/alice` the subject identifier is
`https://wallet.example/alice` and the issuer identifier is
`https://wallet.example`.

Once the client has determined the issuer identifier it can retrieve the server
metadata for the issuer.

## Metadata

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

Open Payments defines the well-known URL `/.well-known/open-payments`. The meta-data document MUST be queried using an HTTP "GET" request at the
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

- `issuer`  
  URL of the server's sessions endpoint where the client is able to create new
  sessions with the `subject`.
  
- `authorization_issuer`  
    URL of the server's sessions endpoint where the client is able to create new
    sessions with the `subject`.

- `authorization_endpoint`  
    URL of the server's sessions endpoint where the client is able to create new
    sessions with the `subject`.

- `token_endpoint`  
    URL of the server's sessions endpoint where the client is able to create new
    sessions with the `subject`.

- `invoices_endpoint`  
  URL of the server's invoices endpoint where the client is able to create new
  invoices with the `subject`.

- `mandates_endpoint`  
  URL of the server's mandates endpoint where the client is able to create new
  mandates with the `subject`.

- `assets_supported`
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
  "authorization_issuer": "https://auth.wallet.example",
  "authorization_endpoint": "https://auth.wallet.example/authorize",
  "payment_invoices_endpoint": "https://wallet.example/invoices",
  "payment_mandates_endpoint": "https://wallet.example/mandates",
  "payment_assets_supported": [
    {"code": "USD", "scale": 2},
    {"code": "EUR", "scale": 2}
  ]
}
```
