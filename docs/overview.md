---
id: overview
title: Overview
---

Open Payments is a standard for interactions between digital payments systems (wallets) to setup and authorize payments 
for a variety of common use cases. While most payment networks have well defined protocols for executing a payment,
no standards exist for discovery and setup of the payment between different parties using different wallets or account 
providers.

Open Payments builds on web technologies to define standard flows for the discovery of counter-party systems and setup 
of the payment for a variety of payment use cases. Open Payments is designed as an application level protocol built on 
top of Interledger.

The Interledger protocol (ILP) is a minimal payments clearing protocol. It was developed to mimic many of the 
characteristics of the Internet Protocol stack in order to “internetwork” clearing participants. The effect of using 
this model is a highly scalable and simple global clearing network on which rapid innovation is possible. Using ILP, 
participants “peer” with other network participants and exchange clearing instructions (ILP packets) directly or 
indirectly with other participants on the network.

The advantage of using ILP over other clearing protocols is that it has been explicitly designed to facilitate high
interoperability between participants irrespective of the use case. Senders and receivers establish the terms of
the payment before starting to exchange ILP packets to clear the funds. As a result, technologies built on ILP are not
siloed by the payment networks they choose to support.

## Background

Open Payments is an evolution of the
[Simple Payment Setup Protocol (SPSP)](https://interledger.org/rfcs/0009-simple-payment-setup-protocol/), providing
support for new use cases and integrating into OAuth 2.0 so that existing identity infrastructure can be leveraged to
handle payments authorization.

<!-- 
In the sections that follow, functions and features of Open Payments are
compared with analogous functions and features of SPSP to help implementors that
are upgrading to Open Payments from SPSP understand the differences (and
similarities).
-->

<img src="/img/four_corner.svg">

Often referred to as the four-corner model, the primary roles in any payment are the Customer (Sender), Merchant
 (Receiver), Acquirer (holds the account of the merchant) and the Issuer (holds the account of the customer). The
  four-corner model is very card-centric but still provides a good model on which to base any retail payments protocol.

In the Open Payments ecosystem an issuer doesn't issue its users payment cards. Instead it issues them one or more
[Payment Pointers](./pointers) which serve a similar purpose to the PAN (card number) on a payment card with
the critical difference that a payment pointer is not sensitive and can't be used to pull money from the user's
 account without explicit consent. This solves one of the major challenges faced by cards online.

Open Payments also leverages [OAuth 2.0](./oauth) for authorization of payments therefor it is useful to map the
 roles defined by [OAuth 2.0](./oauth) to the four-corner model.

| Open Payments     | OAuth 2.0                                   |
| ----------------- | ------------------------------------------- |
| Customer/Sender   | Resource Owner                              |
| Acquirer          | Client                                      |
| Issuer            | Authorization Server / Resource Server      |
| Merchant/Receiver | Client                                      |
| Invoice           | Resource                                    |
| Mandate           | Resource                                    |
| Session           | Resource                                    |
| Account           | Resource                                    |
| Wallet            | Client/Authorization Server/Resource Server |

**Note:**

- In the above table we map both the merchant/receiver and the acquirer to the
  client. The entity that fulfills the role of client (per the OAuth 2.0 model)
  will depend on the context. E.g. In some contexts the merchant/receiver will
  be initiating the payment directly and in others the acquirer will do this on
  their behalf.

- For simplicity, we often refer to a "wallet" in this document. This is used as
  a generic label for the entity that hosts either the sender's or receiver's
  account (i.e. the issuer or acquirer).

## Terminology
