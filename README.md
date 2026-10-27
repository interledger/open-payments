# Open Payments

[![Netlify Status](https://api.netlify.com/api/v1/badges/61b256a1-93e0-4735-a492-1a71d5524e63/deploy-status)](https://app.netlify.com/projects/openpayments/deploys)

## About Open Payments

Open Payments is an open API standard that can be implemented by financial service providers (e.g., banks, digital wallet providers, mobile money providers) to facilitate interoperability in the setup and completion of payments for different use cases.

## About this repo

This repository hosts the source code for [openpayments.dev](https://openpayments.dev). It’s built with [Starlight](https://starlight.astro.build/getting-started/), a documentation framework built on [Astro](https://astro.build/). Visit https://github.com/interledger/open-payments/tree/main/docs for more information.

## Open Payments specifications

The Open Payments specifications live in a separate repo at https://github.com/interledger/open-payments-specifications). The repo is a submodule within a number of Open Payments-related repositories, including the repo you’re in now.

The repo hosts the collection of Open API specs that support the three Open Payments sub-systems:
* A wallet address server, which exposes APIs for obtaining public information about Open Payments-enabled accounts
* A resource server, which exposes APIs for performing functions against Open Payments-enabled accounts
* An authorization server, which exposes APIs compliant with the [Grant Negotiation and Authorization Protocol (GNAP)](datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol) for getting grants to access the resource server APIs

## Open Payments SDKs

The Open Payments SDKs provide developers with pre-built functions that simplify interactions with the Open Payments APIs. Client libraries are available for the following languages:
* [C# (.NET)](https://github.com/interledger/open-payments-dotnet)
* [Go](https://github.com/interledger/open-payments-go)
* [Java](https://github.com/interledger/open-payments-java)
* [PHP](https://github.com/interledger/open-payments-php)
* [Python](https://github.com/interledger/open-payments-python-sdk)
* [Rust](https://github.com/interledger/open-payments-rust)
* [TypeScript/NodeJS](https://github.com/interledger/open-payments-node)

## Open Payments Community Call

We invite our community to join our bi-weekly Open Payments calls. These calls take place every other Thursday at 12:00 UTC via Google Meet.

Video call link: https://meet.google.com/fcb-xamx-csr

[Add to Google Calendar](https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MG1tYzlwOHVtMmg5dnQxOXNodWc4czdxdG5fMjAyNjA0MjNUMTIwMDAwWiBtYXhAaW50ZXJsZWRnZXIub3Jn&tmsrc=max%40interledger.org&scp=ALL)
