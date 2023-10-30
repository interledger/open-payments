# Open Payments

<p align="center">
  <img src="https://raw.githubusercontent.com/interledger/open-payments/main/docs/public/img/logo.svg" width="700" alt="Open Payments">
</p>

## What is Open Payments?

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
https://openpayments.guide.

The code for the landing [page](https://openpayments.guide) is in `./docs`.

## Dependencies

- [Interledger](https://interledger.org/developers/rfcs/interledger-protocol/)

### New to Interledger?

Never heard of Interledger before? Or would you like to learn more? Here are some excellent places to start:

- [Interledger Website](https://interledger.org/)
- [Interledger Specification](https://interledger.org/developers/rfcs/interledger-protocol/)
- [Interledger Explainer Video](https://twitter.com/Interledger/status/1567916000074678272)
- [Open Payments](https://openpayments.guide/)
- [Web monetization](https://webmonetization.org/)

## Contributing

Please read the [contribution guidelines](.github/contributing.md) before submitting contributions. All contributions must adhere to our [code of conduct](.github/code_of_conduct.md).

## Open Payments Catchup Call

Our catchup calls are open to our community. We have them every Monday at 11:00 GMT, via Google Meet.

Video call link: https://meet.google.com/htd-eefo-ovn

Or dial: (DE) +49 30 300195061 and enter this PIN: 105 520 503#

More phone numbers: https://tel.meet/htd-eefo-ovn?hs=5

## Local Development Environment

### Prerequisites

- [NVM](https://github.com/nvm-sh/nvm)

### Environment Setup

```sh
# install node 18
nvm install lts/hydrogen
nvm use lts/hydrogen

# install pnpm
corepack enable

# if moving from yarn run
pnpm clean

# install dependencies
pnpm i
```

### Local Development

### Useful commands

```sh
# format and lint code:
pnpm format

# check lint and formatting
pnpm checks

# verify code formatting:
pnpm check:prettier

# verify lint
pnpm check:lint

# build all the packages in the repo:
pnpm -r build

# run individual tests (e.g. open-payments)
pnpm --filter open-payments test

# run all tests
pnpm -r --workspace-concurrency=1 test
```
