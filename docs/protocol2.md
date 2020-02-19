---
id: protocol
title: Protocol
---

## Introduction

The protocols defined here are all used for direct interaction between the
sender and receiver over the Internet using standard Web technologies (HTTP over
TLS) so we also assume both parties are connected to the Internet and capable of
performing secure HTTP requests.


Open Payments has two goals:
1. Provide Wallet to Wallet interoperability
2. Provide Wallet to Application interoperability

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


### Terminology

Interledger

STREAM


### Parties

Sender

Receiver

Aquiring Wallet

Issuing Wallet

Client

Open Payments Server


## Authentication, Authorization, Consent


## Identity

TBD

## Currencies

Talk about supported currencies of wallets.

## Refunds

TBD, most likely will reflect the need

## Intervals

We need to discuss the intervals and how best to handle them. IE what does 1 Month mean.


