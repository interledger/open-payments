### Use Case: Managed Push

For managed push payments, such as a P2P remittance, the client manages the full
payment life-cycle and fulfills all of the packets it sends. This way it has
full control over which packets are fulfilled. It can choose to fulfill or
reject a payment based upon the amount it receives in the packet when it is sent
to the callback URL.

Below is a non-normative example of the creation of an invoice to send money to
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
