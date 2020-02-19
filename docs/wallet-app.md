---
id: wallet-app
title: Wallet-Application Interoperability
---

Whilst wallet-to-wallet interoperability is important, it does not solve for developers wishing to build applications
ontop of Open Payments easily. Without defining a common interface, wallets would potentially implement custom API's. This
would leave developers needing to implement logic for each major wallet or only support a subset of wallets. In order
to prevent this, Open Payments defines Wallet-Application interface through a delegated access model.

When an application would like to get delegated access to users

## Delegated Access (Mandates)

## Spending

Now that an application has a mandate it needs the ability to be able to perform financial transactions against that
instrument. This is achieved through `/spends` against the mandate, where the information presented to the endpoint is 
an invoice. This will instruct the Issuing wallet to fulfill the invoice within the scope of the Mandate. The Issuing wallet will
use the invoice it has received to determine the 
