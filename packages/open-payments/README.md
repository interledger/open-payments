# Open Payments

[Open Payments](https://openpayments.guide/) is an API standard that allows third-parties (with the account holder's consent) to initiate payments and to view the transaction history on the account holder's account.

Open Payments consists of two OpenAPI specifications, a **resource server** which exposes APIs for performing functions against the underlying accounts and an **authorization server** which exposes APIs compliant with the [GNAP](https://openpayments.guide/introduction/grants/) standard for getting grants to access the resource server APIs.

This package provides TypeScript & NodeJS tools for using Open Payments:

- Exported TypeScript types generated directly from the Open Payments OpenAPI specifications
- A NodeJS client that exposes Open Payment APIs:
  - Signs requests with provided key
  - Validates responses against OpenAPI specs

## Who is this package for?

This package could be used by (but not limited to):

- eCommerce backend services to facilitate payments between their wallet and a customer's wallet (example below)
- An app to display an account holder's transaction history
- Digital wallets looking to support peer-to-peer payments between Open Payment enabled wallets

## Installation

You can install the Open Payments package using:

```sh
npm install @interledger/open-payments
```

## Usage

This package exports two clients, an `UnauthenticatedClient` and an `AuthenticatedClient`.

### `UnauthenticatedClient`

This client allows making requests to access publicly available resources, without needing to provide a private key (authentication).
The available resources are [Wallet Addresses](https://openpayments.guide/apis/wallet-address-server/operations/get-wallet-address/), [Wallet Address Keys](https://openpayments.guide/apis/wallet-address-server/operations/get-wallet-address-keys/), and the public version of [Incoming Payments](https://openpayments.guide/apis/resource-server/operations/get-incoming-payment/).

```ts
import { createUnauthenticatedClient } from '@interledger/open-payments'

const client = await createUnauthenticatedClient()

const walletAddress = await client.walletAddress.get({
  url: 'https://cloud-nine-wallet.com/alice'
})

const incomingPayment = await client.walletAddress.get({
  url: 'https://cloud-nine-wallet.com/incoming-payment/ef56a2cf-e60f-48ab-a7e8-de6af004c9a0'
})
```

#### Optional client initiation parameters

| Variable            | Description                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| `requestTimeoutMs`  | (optional) The timeout in ms for each request by the client. Defaults to 5000.                                  |
| `logger`            | (optional) The custom logger to provide for the client. Defaults to pino logger.                                |
| `logLevel`          | (optional) The log level for the client. Defaults to `silent`.                                                  |
| `validateResponses` | (optional) Enables or disables response validation against the Open Payments OpenAPI specs. Defaults to `true`. |

### `AuthenticatedClient`

An `AuthenticatedClient` provides all of the methods that `UnauthenticatedClient` does, as well as the rest of the Open Payment APIs (both the authorizaton and resource specs). Each request requiring authentication will be signed (using [HTTP Message Signatures](https://github.com/interledger/open-payments/tree/main/packages/http-signature-utils)) with the given private key.

```ts
import { createAuthenticatedClient } from '@interledger/open-payments'

const client = await createAuthenticatedClient({
  keyId: KEY_ID,
  privateKey: PRIVATE_KEY,
  walletAddressUrl: WALLET_ADDRESS_URL
})
```

In order to create the client, three properties need to be provided: `keyId`, the `privateKey` and the `walletAddressUrl`:

| Variable           | Description                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `walletAddressUrl` | The valid wallet address with which the client making requests will identify itself. A JSON Web Key Set document that includes the public key that the client instance will use to protect requests MUST be available at the `{walletAddressUrl}/jwks.json` url. This will be used as the `client` field during [Grant Creation](https://openpayments.guide/apis/auth-server/operations/post-request/). |
| `privateKey`       | The private EdDSA-Ed25519 key (or the relative or absolute path to the key) bound to the wallet address, and used to sign the authenticated requests with. As mentioned above, a public JWK document signed with this key MUST be available at the `{walletAddressUrl}/jwks.json` url.                                                                                                                  |
| `keyId`            | The key identifier of the given private key and the corresponding public JWK document.                                                                                                                                                                                                                                                                                                                  |

> **Note**
>
> To simplify EdDSA-Ed25519 key provisioning and JWK generation, you can use methods from the [`@interledger/http-signature-utils`](https://github.com/interledger/open-payments/tree/main/packages/http-signature-utils) package.

## Error handling

If an error occurs when making requests with the Open Payments client, an `OpenPaymentsClientError` will be thrown with several properties.

```ts
import {
  createUnauthenticatedClient,
  OpenPaymentsClientError
} from '@interledger/open-payments'

const client = await createUnauthenticatedClient()

try {
  const incomingPayment = await client.incomingPayment.getPublic({
    url: 'https://happy-life-bank.com/incoming-payment/9d14328f-8aeb-4440-b1e3-c78b084cb4ca'
  })
} catch (error) {
  if (error instanceof OpenPaymentsClientError) {
    console.log(error.message)
    console.log(error.description) // additional description of the error
    console.log(error.status) // the HTTP status of the request, if a request failure
    console.log(error.code) // the error code from the Open Payments API
    console.log(error.validationErrors) // an array of validation errors. Populated if the response of the request failed OpenAPI specfication validation, or other validation checks.
  } else {
    console.log(error)
  }
}
```

## Example

> **Note**
>
> A high level Open Payments flow with diagrams can be found [here](https://openpayments.guide/introduction/op-flow/).

As mentioned previously, Open Payments APIs can facilitate a payment between two parties.

For example, say Alice wants to purchase a $50 product from a merchant called Shoe Shop on the Online Marketplace. If both parties have Open Payments enabled wallets, where Alice's wallet address is `https://cloud-nine-wallet.com/alice`, and Shoe Shop's is `https://happy-life-bank.com/shoe-shop`, requests during checkout from Online Marketplace's backend would look like this using the client:

1. Create an Open Payments client

In this case, since Online Marketplace wants to make requests that require authorization, it will need to create an `AuthenticatedClient`:

```ts
import { createAuthenticatedClient } from '@interledger/open-payments'

const client = await createAuthenticatedClient({
  walletAddressUrl: 'https://online-marketplace.com/usa',
  keyId: KEY_ID,
  privateKey: PRIVATE_KEY
  // The public JWK with this key (and keyId) would be available at https://online-marketplace.com/usa/jwks.json
})
```

2.  Get `WalletAddresses`

Grab the wallet addresses of the parties:

```ts
const shoeShopWalletAddress = await client.walletAddress.get({
  url: 'https://happy-life-bank.com/shoe-shop'
})

const customerWalletAddress = await client.walletAddress.get({
  url: 'https://cloud-nine-wallet.com/alice'
})
```

3. Create `IncomingPayment`

Online Marketplace's backend gets a grant to create an `IncomingPayment` on the merchant's wallet:

```ts
const incomingPaymentGrant = await client.grant.request(
  { url: shoeShopWalletAddress.authServer },
  {
    access_token: {
      access: [
        {
          type: 'incoming-payment',
          actions: ['read-all', 'create']
        }
      ]
    }
  }
)
```

and creates an `IncomingPayment` using the access token from the grant:

```ts
const incomingPayment = await client.incomingPayment.create(
  {
    url: new URL(shoeShopWalletAddress.id).origin,
    accessToken: incomingPaymentGrant.access_token.value
  },
  {
    walletAddress: shoeShopWalletAddress.id,
    incomingAmount: {
      assetCode: 'USD',
      assetScale: 2,
      value: '5000'
    },
    metadata: {
      externalRef: '#INV2022-8363828',
      description: 'Purchase at Shoe Shop'
    }
  }
)
```

4. Create `Quote`

Then, it'll get a grant to create a `Quote` on Alice's wallet address, which will give the amount it'll cost Alice to make the payment. This quote will be done over the ILP network, which is the only payment method available (for now) in Open Payments.

```ts
const quoteGrant = await client.grant.request(
  { url: customerWalletAddress.authServer },
  {
    access_token: {
      access: [
        {
          type: 'quote',
          actions: ['create', 'read']
        }
      ]
    }
  }
)

const quote = await client.quote.create(
  {
    url: new URL(customerWalletAddress.id).origin,
    accessToken: quoteGrant.access_token.value
  },
  {
    walletAddress: customerWalletAddress.id,
    receiver: incomingPayment.id,
    method: 'ilp'
  }
)

// quote.debitAmount.value = '5200'
```

5. Create `OutgoingPayment` grant & start interaction flow:

The final step for Online Marketplace's backend system will be to create an `OutgoingPayment` on Alice's wallet. Before this, however, Online Marketplace will need to create an outgoing payment grant, which typically requires some sort of interaction with Alice. Online Marketplace will need to facilitate this interaction with Alice (e.g. redirect her to a webpage with a dialog) to get her consent for creating an `OutgoingPayment` on her account at Cloud Nine Wallet.

```ts
const outgoingPaymentGrant = await client.grant.request(
  { url: customerWalletAddress.authServer },
  {
    access_token: {
      access: [
        {
          type: 'outgoing-payment',
          actions: ['read', 'create', 'list'],
          identifier: customerWalletAddress.id,
          limits: {
            debitAmount: quote.debitAmount, // to authorize an amount up to the quoted amount
            receiveAmount: quote.receiveAmount
          }
        }
      ]
    },
    interact: {
      start: ['redirect'],
      finish: {
        method: 'redirect',
        uri: 'https://online-marketplace.com/complete-payment', // where to redirect the customer after the interaction is completed
        nonce: uuid()
      }
    }
  }
)
```

This request will return a response as such:

```ts
// response
{
  interact: {
    redirect: 'https://cloud-nine-wallet.com/interact/8bb1d236-835d-45b6-8336-430ce084f678/60E93BB0A6C643C6?clientName=Online+Marketplace&clientUri=https%3A%2F%2Fonline-marketplace.com%usa',
    finish: '60E93BB0A6C643C6'
  },
  continue: {
    access_token: { value: '607B1ECEA91D4A40F75F' },
    uri: 'https://gcclfu-ip-83-82-252-168.tunnelmole.net/continue/6352216e-ce5b-4e29-ac37-00d1d0094738',
    wait: 5
  }
}
```

Alice would be then redirected to the URL specified at `interact.redirect`, where she can approve or reject the grant request.

> **Note**
>
> To see a detailed sequence and an example implementation for how this is achieved, see https://github.com/interledger/rafiki.

6. Continue grant

Once Alice approves the grant request at Cloud Nine Wallet (or the Identity Provider that Cloud Nine Wallet has configured), she will be redirected to the URL specified in the original outgoing payment grant request, with an `interact_ref` in the URL. This `interact_ref` can be used to finalize the outgoing payment grant request:

```ts
const finalizedOutgoingPaymentGrant = await client.grant.continue(
  {
    accessToken: outgoingPaymentGrant.access_token.value,
    url: outgoingPaymentGrant.continue.uri
  },
  { interact_ref: INTERACT_REF_FROM_URL }
)
```

7. Create `OutgoingPayment`:

Once the grant interaction flow has finished, and Alice has consented to the payment, Online Marketplace can create the `OutgoingPayment` on her account:

```ts
const outgoingPayment = await client.outgoingPayment.create(
  {
    url: new URL(customerWalletAddress.id).origin,
    accessToken: finalizedOutgoingPaymentGrant.access_token.value
  },
  {
    walletAddress: customerWalletAddress.id,
    quoteId: quote.id,
    metadata: { description: 'Your purchase at Shoe Shop' }
  }
)
```

At this point, the Online Marketplace can show to Alice that the payment to Shoe Shop has been completed, and money will be moved between Alice's wallet address and the Shoe Shop's using the specified payment method.
