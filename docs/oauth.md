---
id: oauth
title: OAuth 2.0 and Open ID Connect
---

Open Payments embraces the tight relationship between identity, security, and
payments and the need for payments systems to offer a way for access to be
secure and authenticated with complex authorization logic being the critical
feature that unlocks different use cases.

For that reason the Open Payments protocol builds directly on OAuth 2.0 and Open
ID Connect to handle use cases where authorization and identity are required.

OAuth 2.0 and OpenID Connect have become the defacto standard for
authentication, authorization and user information exchange on the Internet.
Open Payments is designed to integrate easily into existing online systems.

## Payment Pointers

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

Open Payments defines a complete account discovery protocol based on Payment
Pointers and leveraging the existing server meta-data standards defined for
OAuth 2.

Using this protocol, the end user can provide their Payment Pointer to a
counter-party or app which is then able to discover the necessary endpoints to
interact with the user's account using Interledger.

See [Discovery](#discovery) for more details.

## Financial-grade API

The Open ID Foundation's [Financial-grade API WG](https://openid.net/wg/fapi/)
is currently developing OAuth 2.0 profiles which further enhance the security of
using OAuth 2.0 for the use of financial APIs.

These are being widely adopted by the financial services industry, especially by
groups developing Open Banking APIs suggesting this is a safe technology bet.