<p align="center">
  <img src="https://github.com/interledger/open-payments/blob/master/landing/public/Open%20Payments%20Logo%20with%20text.svg" width="700" alt="Open Payments">
</p>

---

Open Payments is a protocol that can be implemented by digital wallets to
facilitate interoperability in the setup of payments for different use cases.

It builds on ideas from the OAuth and OpenID Connect protocols that allow two
account-servicing entities (wallets, merchants etc.) to interoperate so that a
user/business with an account at one wallet is able to setup and execute a
payment to a user/business with an account at another institution.

Open Payments builds on the Interledger protocol which is used to execute the
payment. Open Payments is focused purely on assisting the two
Interledger-enabled systems to discover the necessary service endpoints and
exchange the necessary data to execute a payment for a variety of use cases
including:

- [Web Monetization](https://webmonetization.org)
- Tipping/Donations (low value/low friction)
- eCommerce checkout
- P2P transfers
- Subscriptions
- Invoice Payments

## Dependencies

 - [Payment Pointers](https://paymentpointers.org)
 - [Interledger](https://interledger.org)