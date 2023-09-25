<p align="center">
  <img src="https://raw.githubusercontent.com/interledger/open-payments/main/docs/public/img/logo.svg" width="700" alt="Open Payments">
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

The code for the landing [page](https://openpayments.guide) is in `./docs`.

## Dependencies

- [Interledger](https://interledger.org)

## Open Payments Catchup Call

Our catchup calls are open to our community. We have them every Monday at 11:00 GMT, via Google Meet.

Video call link: https://meet.google.com/htd-eefo-ovn

Or dial: (DE) +49 30 300195061 and enter this PIN: 105 520 503#

More phone numbers: https://tel.meet/htd-eefo-ovn?hs=5

[Add to Google Calendar](https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MTdkZTEwYThhNjliNDUxOGJmNTc0ZWE2NjgxZWViZjlfMjAyMzA5MDRUMTEwMDAwWiBzYWJpbmVAaW50ZXJsZWRnZXIub3Jn&tmsrc=sabine%40interledger.org&scp=ALL)
