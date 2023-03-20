<p align="center">
  <img src="https://raw.githubusercontent.com/interledger/open-payments/master/landing/public/Open_Payments_standard_logo.svg" width="700" alt="Open Payments">
</p>

---

Open Payments is a protocol that can be implemented by digital wallets to
facilitate interoperability in the setup of payments for different use cases
including:

- [Web Monetization](https://webmonetization.org)
- Tipping/Donations (low value/low friction)
- eCommerce checkout
- P2P transfers
- Subscriptions
- Invoice Payments

An Open Payments server runs two sub-systems, a **resource server** which exposes APIs for performing functions against the
underlying accounts and and **authorisation server** which exposes APIs compliant with the
[GNAP](https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol) standard for getting grants to access the resource server
APIs.

This repository hosts the Open API Specifications of the two APIs which are published along with additional documentation at
https://docs.openpayments.guide.

The code for the landing [page](https://openpayments.guide) is in `./landing`.

## Dependencies

- [Payment Pointers](https://paymentpointers.org)
- [Interledger](https://interledger.org)
