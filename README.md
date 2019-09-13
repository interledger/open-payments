# Interledger-Web

A simple [Interledger](https://interledger.org) stack that makes it easy to send
and receive payments using Interledger and standard Web technologies.

## Rationale

Interledger is awesome. It defines an incredibly simple protocol for connecting
entities that want to exchange payments. However, over time the Internet analogy
has been taken a little too far. As a result the protocol stack design is overly
complicated for end users and using Interledger is harder than it should be.

Sending money and sending data have different use cases so it follows that they
would have protocol stacks with different features. While the concept of a
"money socket" and "transport layers" for money are _cool_ they have not proven
to be _useful_ when it comes to actually addressing **most** payment use cases.

This is evidenced by the fact that anyone that is confronted with the current
stack immediately attempts to write a new abstraction layer over it that suits
their use case.

Sending payments by adjusting `maxSend` or `maxReceive` properties on a socket
is simply unintuitive.

Sockets facilitate bidirectional streams, necessary for data exchange but **very
uncommon** for money. A more likely use case for a packet switched money stream,
as made possible with Interledger, is a single stream in one direction that has
a relatively short lifespan. (Note: this is not about the persistent,
bi-directional connections between ILP connectors but rather the connections
between senders and receivers.)

Interledger-Web proposes to strip away almost everything on top of ILP and make
it really simple to establish a connection to a remote entity and send (push)
money to, or receive (pull) money from them.

Taking the idea of removing unneeded complexity further we propose to drop OER
encoding entirely for communication between low volume nodes on the edge of the
network.

While a canonical encoding has value the majority of transports (such as HTTP)
already have a concept of headers and a payload.

By leveraging these protocols (and passing ILP packet headers as native
transport headers rather than encoded in the payload using OER) we remove
significant processing overhead but most importantly we dramatically reduce the
learning curve for anyone new to ILP.

A canonical binary encoding is still valuable for high volume nodes and related
gateway protocols such as CCP but for interaction at the edges of the network
OER is an unnecessary additional new technology required to use ILP.

## HTTP

As we have discovered over time, using HTTP as a transport for ILP is a natural
and easy fit. Not only that but it makes implementing an ILP sender or receiver
trivial in any language or stack.

Using Interledger-Web the following code could send an ILP packet from inside
the browser:

```javascript
const reply = await fetch('https://uplink.example/', {
  path: '/'
  method: 'POST',
  headers: {
    'ILP-Destination': 'g.alice',
    'ILP-Amount': '10',
    'ILP-Condition': '47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='
    'ILP-Expiry': '20190902235959999'
  }
})
```

As HTTP itself evolves (HTTP2 is already used widely and HTTP3 is in
development) the Interledger-Web stack will continue to benefit.

## WebSockets

Our assumption with this design is that an entity that intends on fulfilling ILP
packets is **always** online and SHOULD be capable of hosting an HTTP endpoint.
This negates the need to standardise a bidirectional transport like WebSockets.
A system that id always online and needs to receive ILP packets can simply host
an HTTP server.

Since we are not using STREAM there are no cases when an edge node needs to
accept incoming ILP packets.

While there may be use cases that emerge where this assumption no longer holds
we believe that there is no need, at this time, to have any transports beyond
HTTP.

## OAuth 2.0 and Open ID Connect

The Interledger-Web stack also embraces the tight relationship between identity,
security, and payments and the need for payments systems to offer a way for
access to be secure and authenticated with complex authorization logic being the
critical feature that unlocks different use cases.

For that reason the stack works hand-in-hand with OAuth 2.0 and Open ID Connect
to handle use cases where authorization and identity are required.

OAuth 2.0 and OpenID Connect have become the defacto standard for
authentication, authorization and user information exchange on the Internet. The
Interledger-Web stack is loosely coupled to these technologies meaning the same
stack can be used without them if an alternative authentication and
authorization system is preferred however the stack is well setup to integrate
easily into existing online systems.

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

Interledger-Web defines a complete account discovery protocol based on Payment
Pointers and leveraging the existing server meta-data standards defined for
OAuth 2.

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

## Agreements (Intents and Mandates)

Building on the excellent work by Sabine Bertram on Pull Payments using SPSP we
have split the concept of **Agreements** into **Intents** and **Mandates** and
made them an integral part of all Interledger-Web interactions.

Payments are a highly regulated ecosystem. While ILP provides for incredible new
levels of interoperability and scalability participants in the ecosystem are
still subject to regulations that vary depending on what they do.

**Intents** codify a proposed payment from a sender to a receiver. **Mandates**
codify the agreement by a sender to allow one or more future payments to a
receiver (initiated by the receiver). With Interledger-Web, payments are only
made following the creation of an **Agreement**.

**Intents** are distinct from authorizations because in some cases an **Intent**
doesn't require explicit authorization, such as when a sender is sending
micro-payments to a receiver for Web Monetization. (In this case the creation of
the **Intent** is somewhat analogous to using SPSP to setup a payment).

In all cases, the initiator of a payment will create either an **Intent** or
**Mandate** at the wallet of the other party and then, if necessary, request
authorization to execute the payment described by the **Agreement**.

**Agreements** are resources on the Web under the same origin as the user's
account provider (wallet). They are serialized as JSON and can be managed
through standard HTTP.

The endpoints at which **Agreements** are managed are discovered through the
_Payment Pointer_ of the counter-party. See [Discovery](#discovery).

An **Intent** is created for all **push payments** (crediting the counter-party)
and a **Mandate** is created for all **pull payments** (debiting the
counter-party). **Mandates** may permit multiple payments over an extended
period of time (e.g. for subscriptions).

Authorization to execute a payment is granted through the provision of an
_access token_ where the _scope_ of the access token is the **Agreement**
(identified by its unique URL).

**Intents** have a unique ILP address. Payments sent to that address are
considered to be linked to that **Intent**.

At the application layer **Agreements** can correspond to a user session,
invoice, discreet payment or any other commercial construct that it is useful to
correlate a group of payments to.

## Assumptions

To use the Interledger-Web stack it is assumed that an entity has a connection
into the Interledger network, likely through an account provider where it holds
its own funds. In this document we refer to this connection as the client's
**uplink**.

A client might send or receive packets via their uplink depending on the use
case.

The protocols defined here are all used for direct interaction between the
sender and receiver over the Internet using standard Web technologies (HTTP) so
we also assume both parties are connected to the Internet and capable of
performing basic HTTP requests.

Where a party is not permanently online they will delegate some authority over
their account to an agent such as a wallet provider.

We also assume that the backbone of the Interledger network will consist of
known actors that have either direct or indirect relationships with other
entities on the network.

For many use cases it is necessary for a wallet to send to another wallet and be
capable of interacting with that wallet as a "Client" as defined in the OAuth 2
protocol.

Participants MAY support dynamic client registration however this will be at
their discretion on the basis of their regulatory obligations.

Participants may also choose to not allow the anonymous creation of either
intents or mandates or both. For example, a user may choose to disallow
unsolicited payments into its account. In this case, when an intent is created
to send to the user the wallet will only allow authorized access to that Intent.

# How it works

Interledger-Web uses standard web technologies, combined with Interledger, to
allow a **client** (initiating the transaction) to push money to, or pull money
from, a **counter-party** (accepting the transaction).

The key technologies in use are:

- [Payment Pointers](https://paymentpointers.org)
- [Interledger v4 - ILP](https://interledger.org/rfcs/0027-interledger-protocol-4/)
- [OAuth 2.0 and Open ID Connect](https://openid.net/connect/) (Optional -
  required for identity verification and pull payments)

At a very high level, the client makes payments by:

1. using the counter-party's Payment Pointer to resolve endpoints for the
   counter-party's Interledger-enabled financial account.
2. creating an appropriate agreement using an agreements endpoint.
3. if necessary, using OAuth 2 to get an access token that authorizes the client
   to execute payments covered by the agreement.
4. sending/receiving ILP packets to/from the counter-party's account to complete
   payments allowed by the agreement.

The client has two methods available when _pushing_ money to the counter-party.

It can either create an intent that instructs the counter-party to fulfill all
incoming packets or it instructs the counter-party to forward all packets for
the agreement to a callback URL that it provides.

In the first case, the client provides a shared secret to the counter-party
which it uses to generate a valid fulfillment for each incoming packet. This is
an optimization that is suitable for some use cases such as Web Monetization but
it means the client has no control over how much is received by the
counter-party and whether or not packets should be fulfilled.

In the latter case the client sends payments to the ILP address created for the
agreement and these are forwarded to the callback URL by the counter-party. The
client then fulfills the packets it receives if it is satisfied with the amount
that arrives in the account.

When _pulling_ money from the server the client will first create an agreement,
describing the amount it wants to pull, how often, etc. It then uses OAuth 2.0
to request that the server grant it permission to execute that agreement. The
token that it receives is used to authenticate it when connecting to the payment
endpoint at the counter-party's wallet.

By using this token the client is authorized to send ILP packets out of the
counter-party's account which it does, routing them to its own account. As with
the push payment scenario the client can reject packets it receives if the
amount is too low (i.e. too many fees applied along the route).

The client MAY use Open ID Connect to verify the identity of the counter-party
before pushing or pulling money to/from it.

The counter-party MAY also require that the client complete an OAuth flow to get
an access token to push funds to it. In this case the client will not be able to
enable the agreement without an access token.

## Payment Pointers

In Interledger-Web, payments are sent to intents or received from mandates which
are created against accounts which are identified by
[Payment Pointers](https://paymentpointers.org).

Payment Pointers MAY also be used to represent agreements which are identified
by a URL and can therefor be converted to a Payment Pointer.

In theory an agreement can be treated like a sub-account (if supported by the
wallet) and new agreements can be created that are associated with the parent
agreement rather than the account.

More experimentation is required to determine if this is a feature worth
supporting for wallets.

### Terminology

All Payment Pointers have a `subject`, the entity that owns or controls the
resource that is accessed via the URL resolved from the pointer. This concept is
borrowed from standard identity ontologies and in the Interledger-Web ecosystem
it is assumed that the `subject` of a Payment Pointer is also the entity that
owns any funds pushed to that pointer or pulled from it.

Payment Pointers also have an `issuer` who controls the domain/origin at which
the pointer is hosted on the Internet.

A common scenario will be a person/company that is sending/receiving money (the
`subject`) and a service that hosts the Interledger-enabled account/wallet
holding the person/company's funds (the `issuer`).

## Discovery

When an entity wishes to push/pull money to/from a Payment Pointer they will
resolve the Payment Pointer URL and fetch the OAuth Metadata for the server
described by that URL as defined in
[RFC8414](https://tools.ietf.org/html/rfc8414).

The metadata is a JSON document resource that describes the various service
endpoints that are available to:

- connect to the `subject`'s account via Interledger
- get authorization to perform actions on the `subject`'s account (using OAuth
  2.0)
- get more information about the `subject` (using OpenID Connect)
- create agreements with the `subject`

The document is a set of claims about the `subject`'s configuration, including
all necessary endpoints and public key location information. A successful
response MUST use the 200 OK HTTP status code and return a JSON object using the
`application/json` content type that contains a set of claims as its members
that are a subset of the metadata values defined in
[RFC8414 Section 2](https://tools.ietf.org/html/rfc8414#section-2) and the
following Interledger-specific claims.

- `payment_intents_endpoint`  
  URL of the server's intents endpoint where the client is able to create new
  intents with the `subject`.

- `payment_mandates_endpoint`  
  URL of the server's mandates endpoint where the client is able to create new
  mandates with the `subject`.

- `payment_assets_supported`  
  A list of asset definitions for assets that can be used to create agreements
  on this server. The schema of an asset definition is defined in
  [Assets](#assets).

Other claims MAY also be returned.

Claims that return multiple values are represented as JSON arrays. Claims with
zero elements MUST be omitted from the response.

An error response uses the applicable HTTP status code value.

The following is a non-normative example response:

     HTTP/1.1 200 OK
     Content-Type: application/json

     {
      "issuer":
        "https://server.example.com",
      "authorization_endpoint":
        "https://server.example.com/authorize",
      "token_endpoint":
        "https://server.example.com/token",
      "token_endpoint_auth_methods_supported":
        ["client_secret_basic", "private_key_jwt"],
      "token_endpoint_auth_signing_alg_values_supported":
        ["RS256", "ES256"],
      "userinfo_endpoint":
        "https://server.example.com/userinfo",
      "jwks_uri":
        "https://server.example.com/jwks.json",
      "registration_endpoint":
        "https://server.example.com/register",
      "scopes_supported":
        ["openid", "profile", "email", "address",
         "phone", "offline_access"],
      "response_types_supported":
        ["code", "code token"],
      "service_documentation":
        "http://server.example.com/service_documentation.html",
      "ui_locales_supported":
        ["en-US", "en-GB", "en-CA", "fr-FR", "fr-CA"],
      "payment_intents_endpoint":
        "https://server.example.com/intents"
      "payment_mandates_endpoint":
        "https://server.example.com/mandates"
      "payment_assets_supported":
        [
          {"code": "USD", "scale": 2},
          {"code": "EUR", "scale", 2}
        ],
     }

## Creating Agreements

The client then creates an agreement by making a POST to either the intents or
mandates endpoint. The `subject` of the agreement is the Payment Pointer.

Upon creation of the agreement the server responds with a `201 Created` response
and a `Location` header containing the URL of the newly created agreement.

This URL is the `scope` that is used by the client in any subsequent
authorization requests.

The type of agreement and the data that must be provided will depend on the use
cases as described below.

## Fulfilling Payments

Interledger requires that all payments are sent with a condition that must be
fulfilled by the receiver. This demonstrates that the payment has been accepted
by the intended receiver (as identified by the ILP address).

When using Interledger-Web the client chooses to either fulfill all payments
that it sends or provide the receiver with a shared secret to do this
automatically.

When the client is the sender it will be routing packets to the receiver using
the ILP address associated with the intent.

### Callback URL

Under most circumstances the client will want to check the amount received at
the receiver before fulfilling the packet. To do this it provides a callback URL
when creating the intent. Payments sent to the intent are routed by the receiver
to this callback URL where the client is able to decide if it should fulfill the
packet or not.

### Shared Secret

In some circumstances the client favours efficiency over control of the payment
flow. Instead of fulfilling the packets it sends to the receiver it provides the
receiver with a shared secret that it can use to generate the fulfillments
itself.

The shared secret is set when the intent is created. For each payment the
fulfillment is the SHA-256 HMAC of the payload using the shared secret as the
HMAC key.

## Sending Money

Sending money is the simplest case as it would not require interaction from the
receiver unless the receiver or receiver's account provider requires explicit
permission to send to it.

For both push use cases the wallet MAY create the intent as unauthorized in
which case the client must follow the OAuth flow to get the receiver's consent
to receive the payment.

### Use Case: Unmanaged Push

For unmanaged push payments, such as for Web Monetization, where the client does
not manage the receipt of the payments, the client will create an intent using a
shared secret instead of a callback URL.

The secret is a 32-byte value that is base64 encoded.

Below is a non-normative example of the creation of an intent to send money to
`$wallet.example/alice`.

```http
POST https://wallet.example/intents
Accept: application/json
Content-Type: application/json


{
  "scope": "$wallet.example/alice",
  "secret": "2bGbRK5jcdi5UN7E0AhlbWLB+e442N18j1MnX/FtmGQ=",
  "asset": {
    "code": "USD",
    "scale": 2
  }
}
```

A successful `201` response will indicate the Interledger address to send to and
will return the unique URL identifier of the intent in a `Location` header.

The secret provided in the create operation is never returned again. The
response and any subsequent `GET` operations against the intent resource return
a SHA-256 HMAC of the secret using a random 32-byte salt value as the MAC key.

The response will also contain the salt value itself so that client's can
confirm they have the correct secret.

Below is a non-normative example of a successful response to the creation of an
intent to send money to `$wallet.example/alice`.

```http
200 Success
Content-Type: application/json
Location: https://wallet.example/intent/0f09dc92-84ad-401b-a7c9-441bc6173f4e


{
  "id": "0f09dc92-84ad-401b-a7c9-441bc6173f4e",
  "scope": "$wallet.example/alice",
  "authorized" : true,
  "destination": "g.example.0f09dc92-84ad-401b-a7c9-441bc6173f4e",
  "secret_hash": "AvLaEGc+ojGHVezQF9DC4/7F5YIvrNPx/VM+4hJkCbs=",
  "secret_salt": "AssXsbYreLD2oE82kTpOyVmVga8ntLnaj5j7D3whKGs=",
  "asset": {
    "code": "USD",
    "scale": 2
  },
  "balance": 0
}
```

The sender can now begin sending packets to the address provided by the wallet
for the intent. The receiver will fulfill any packets it receives using the
shared secret to generate the fulfillment.

### Use Case: Managed Push

For managed push payments, such as a P2P remittance, the client manages the full
payment life-cycle and fulfills all of the packets it sends. This way it has
full control over which packets are fulfilled. It can choose to fulfill or
reject a payment based upon the amount it receives in the packet when it is sent
to the callback URL.

Below is a non-normative example of the creation of an intent to send money to
`$wallet.example/alice`.

```http
POST https://wallet.example/intents
Accept: application/json
Content-Type: application/json


{
  "scope": "$wallet.example/alice",
  "callback": "https://client.example/ilpcallback",
  "asset": {
    "code": "USD",
    "scale": 2
  }
}
```

A successful `201` response will indicate the Interledger address to send to and
will return the unique URL identifier of the intent in a `Location` header.

Below is a non-normative example of a successful response to the creation of an
intent to send money to `$wallet.example/alice`.

```http
200 Success
Content-Type: application/json
Location: https://wallet.example/intent/0f09dc92-84ad-401b-a7c9-441bc6173f4e


{
  "id": "0f09dc92-84ad-401b-a7c9-441bc6173f4e",
  "scope": "$wallet.example/alice",
  "authorized" : true,
  "destination": "g.example.0f09dc92-84ad-401b-a7c9-441bc6173f4e",
  "callback": "https://client.example/ilpcallback",
  "asset": {
    "code": "USD",
    "scale": 2
  },
  "balance": 0
}
```

The sender can now begin sending packets to the address provided by the wallet
for the intent. The receiver will forward any packets using that address to the
callback URL provided.

The sender may then choose to fulfill or reject the packet.

Note that although the packets are being fulfilled by the sender the value is
credited by the wallet to the intent and the user account linked to it (in the
asset of the intent), i.e. the counter-party.

## Receiving Money

Receiving money (pull payments) will almost always require that the client get
an access token after it has created an appropriate mandate defining the terms
of the pull payment(s) it wishes to complete.

### Use Case: Pull

For pull payments, such as payment for an online purchase, the client manages
the full payment life-cycle and fulfills all of the packets it sends, however
the packets it sends are being sent FROM the counter-party's account at their
wallet. This way the client has full control over which packets are fulfilled
based upon the amount it receives in the packet when it arrives at the client.

Below is a non-normative example of the creation of a mandate to pull money from
`$wallet.example/alice`.

This mandate will permit the client to pull up to 20 USD each month from the
account.

```http
POST https://wallet.example/mandates
Accept: application/json
Content-Type: application/json


{
  "scope": "$wallet.example/alice",
  "amount": "2000",
  "start": "2019-01-01T08:00Z",
  "expiry": "2021-01-02T00:00Z",
  "interval": "P0Y1M0DT0H0M0S",
  "cycles": 12,
  "cap": false,
  "asset": {
    "code": "USD",
    "scale": 2
  }
}
```

A successful response will return the unique URL identifier of the intent in a
`Location` header.

Below is a non-normative example of a successful response to the creation of a
mandate to pull money from `$wallet.example/alice`.

```http
200 Success
Content-Type: application/json
Location: https://wallet.example/intent/0f09dc92-84ad-401b-a7c9-441bc6173f4e


{
  "id": "0f09dc92-84ad-401b-a7c9-441bc6173f4e",
  "scope": "$wallet.example/alice",
  "payment_endpoint": "https://wallet.example/ilp",
  "authorized" : false,
  "amount": "2000",
  "start": "2019-01-01T08:00Z",
  "expiry": "2021-01-02T00:00Z",
  "interval": "P0Y1M0DT0H0M0S",
  "cycles": 12,
  "cap": false,
  "asset": {
    "code": "USD",
    "scale": 2
  },
  "balance": {
    "total": "0",
    "interval": "0",
    "available": "2000"
  },
  "cycle": 0
}
```

Note that the mandate is **not** yet authorized.

The client must now use the authorization endpoint of the wallet to be granted
an access token to execute this mandate.

The URL of the mandate is the `scope` that is requested when getting the access
token.

When the user consents to the mandate during the OAuth flow the mandate will
change to authorized.

The client can now begin sending packets to itself (i.e. to an address of its
own) by connecting to the `payment_endpoint` provided by the wallet using the
access token it was granted.

The client may then choose to fulfill or reject the packets as they arrive.

Note that although the client is sending packets FROM the account of the
counter-party the amount and throughput are still controlled by the
counter-party's wallet.

## Identifying the Client

TODO - Describe how OAuth allows the two parties to identify one another if
required for compliance

## FX

TODO - Describe how the asset selection works and the advantages of this model
in providing flexibility to both parties in who provides the FX in

## Schemas

TODO - JSON Schemas

### Assets

### Intents

### Mandates
