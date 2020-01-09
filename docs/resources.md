---
id: resources
title: Resources
---

Modern APIs are almost always "resource-oriented" and when using OAuth 2.0
resources are a critical part of the model.

Open Payments, as an extension of OAuth 2.0, is very specific about the
resources it defines and how they can be manipulated and used to execute
different payment use cases.

In general, a payment using the Open Payments protocol involves creation,
update, and/or read-only access to one of the resources described below. OAuth
2.0 is used to manage the authorization of third-parties to perform actions
against these resources.

## Agreements

The primary resources in the Open Payments model are collectively referred to as
**agreements**. They consist of invoices, mandates and sessions.

Payments are tightly regulated and participants in the ecosystem are subject to
regulations that vary depending on what they do. Agreements codify the details
of a proposed payment.

**Invoices** and **Sessions** codify a proposed payment from a sender to a
receiver. **Mandates** codify the agreement by a sender to allow one or more
future payments to a receiver (initiated by the receiver). With Open Payments,
payments are only made following the creation of an **Agreement**.

**Invoices** and **Sessions** are distinct from authorizations because in some
cases they don't require explicit authorization. For example, a payee may allow
unsolicited payments into their account up to a specific amount, such as when
accepting donations. In this case the payee would not require authorization of
payer when it creates the invoice that is required to precede the payment.

In most cases, the initiator of a payment will create either a **Session**,
**Invoice** or **Mandate** at the wallet of the other party and then, if
necessary, request authorization to execute the payment described by the
**Agreement**.

**Agreements** are resources on the Web under the same origin as the user's
account provider (wallet). They are serialized as JSON and can be managed
through standard HTTP.

The endpoints at which **Agreements** are managed are discovered through the
_Payment Pointer_ of the counter-party. (See [Discovery](./protocol#discovery)).

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

### Sessions

To support the streaming nature of Interledger payments and especially the Web
Monetization use case, we define **Sessions** which are ephemeral sub-accounts
that are created to track incoming payments that are not linked to an issued
**Invoice**.

## Accounts

TODO

## Credits

This model builds on the excellent work by Sabine Bertram on Pull Payments using
SPSP.
