# Open Payments

[Open Payments](../../docs/open-payments.md) is an API standard that allows third-parties (with the account holder's consent) to initiate payments and to view the transaction history on the account holder's account.

Open Payments consists of two OpenAPI specifications, a **resource server** which exposes APIs for performing functions against the underlying accounts and an **authorization server** which exposes APIs compliant with the [GNAP](../../docs/glossary.md#grant-negotiation-authorization-protocol) standard for getting grants to access the resource server APIs.

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

This client allows making requests to access publicly available resources, without needing authentication.
The three available resources are [Payment Pointers](https://docs.openpayments.guide/reference/get-payment-pointer), [Payment Pointer Keys](https://docs.openpayments.guide/reference/get-payment-pointer-keys), and [ILP Stream Connections](https://docs.openpayments.guide/reference/get-ilp-stream-connection).

```ts
import { createUnauthenticatedClient } from '@interledger/open-payments'

const client = await createUnauthenticatedClient({
  requestTimeoutMs: 1000, // optional, defaults to 5000
  logger: customLoggerInstance // optional, defaults to pino logger
})

const paymentPointer = await client.paymentPointer.get({
  url: 'https://cloud-nine-wallet/alice'
})
```

### `AuthenticatedClient`

An `AuthenticatedClient` provides all of the methods that `UnauthenticatedClient` does, as well as the rest of the Open Payment APIs (both the authorizaton and resource specs). Each request requiring authentication will be signed (using [HTTP signatures](../../docs/architecture.md#http-signature-utils)) with the given private key.

```ts
import { createAuthenticatedClient } from '@interledger/open-payments'

const client = await createAuthenticatedClient({
  keyId: KEY_ID,
  privateKey: PRIVATE_KEY,
  paymentPointerUrl: PAYMENT_POINTER_URL
})
```

In order to create the client, three properties need to be provided: `keyId`, the `privateKey` and the `paymentPointerUrl`:

| Variable            | Description                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `paymentPointerUrl` | The valid payment pointer with which the client making requests will identify itself. A JSON Web Key Set document that includes the public key that the client instance will use to protect requests MUST be available at the `{paymentPointerUrl}/jwks.json` url. This will be used as the `client` field during [Grant Creation](https://docs.openpayments.guide/reference/post-request). |
| `privateKey`        | The private EdDSA-Ed25519 key bound to the payment pointer, and used to sign the authenticated requests with. As mentioned above, a public JWK document signed with this key MUST be available at the `{paymentPointerUrl}/jwks.json` url.                                                                                                                                                  |
| `keyId`             | The key identifier of the given private key and the corresponding public JWK document.                                                                                                                                                                                                                                                                                                      |

> **Note**
>
> To simplify EdDSA-Ed25519 key provisioning and JWK generation, you can use the `parseOrProvisionKey` and `generateJwk` methods from the [`http-signature-utils`](../http-signature-utils/README.md#usage) package.

## Example

As mentioned previously, Open Payments APIs can facilitate a payment between two parties.

For example, say Alice wants to purchase a $50 product from a merchant called Shoe Shop on the Online Marketplace. If both parties have Open Payments enabled wallets, where Alice's payment pointer is `https://cloud-nine-wallet/alice`, and Shoe Shop's is `https://happy-life-bank/shoe-shop`, requests during checkout from Online Marketplace's backend would look like this using the client:

1. Create an Open Payments client

In this case, since Online Marketplace wants to make requests that require authorization, it will need to create an `AuthenticatedClient`:

```ts
import { createAuthenticatedClient } from '@interledger/open-payments'

const client = await createAuthenticatedClient({
  paymentPointerUrl: 'https://online-marketplace.com/usa',
  keyId: KEY_ID,
  privateKey: PRIVATE_KEY
  // The public JWK with this key (and keyId) would be available at https://online-marketplace.com/usa/jwks.json
})
```

2.  Get `PaymentPointers`

Grab the payment pointers of the parties:

```ts
const shoeShopPaymentPointer = await client.paymentPointer.get({
  url: 'https://happy-life-bank/shoe-shop'
})

const customerPaymentPointer = await client.paymentPointer.get({
  url: 'https://cloud-nine-wallet/alice'
})
```

3. Create `IncomingPayment`

Online Marketplace's backend gets a grant to create an `IncomingPayment` on the merchant's wallet:

```ts
const incomingPaymentGrant = await client.grant.request(
  { url: shoeShopPaymentPointer.authServer },
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
    paymentPointer: shoeShopPaymentPointer.authServer,
    accessToken: incomingPaymentGrant.access_token.value
  },
  {
    incomingAmount: {
      assetCode: 'USD',
      assetScale: 2,
      value: '5000'
    },
    description: 'Purchase at Shoe Shop',
    externalRef: '#INV2022-8363828'
  }
)
```

4. Create `Quote`

Then, it'll get a grant to create a `Quote` on Alice's payment pointer, which will give the amount it'll cost Alice to make the payment (with the ILP fees + her wallet's fees)

```ts
const quoteGrant = await client.grant.request(
  { url: customerPaymentPointer.authServer },
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
    paymentPointer: customerPaymentPointer.id,
    accessToken: quoteGrant.access_token.value
  },
  { receiver: incomingPayment.id }
)

// quote.sendAmount.value = '5200'
```

5. Create `OutgoingPayment` grant & start interaction flow:

The final step for Online Marketplace's backend system will be to create an `OutgoingPayment` on Alice's wallet. Before this, however, Online Marketplace will need to create an outgoing payment grant, which typically requires some sort of interaction with Alice. Online Marketplace will need to facilitate this interaction with Alice (e.g. redirect her to a webpage with a dialog) to get her consent for creating an `OutgoingPayment` on her account. The detailed sequence for how this is achieved can be found [here](../../docs/grant-interaction.md).

6. Create `OutgoingPayment`:

Once the grant interaction flow has finished, and Alice has consented to the payment, Online Marketplace can create the `OutgoingPayment` on her account:

```ts
const outgoingPayment = await client.outgoingPayment.create(
  {
    paymentPointer: customerPaymentPointer.id,
    accessToken: outgoingPaymentGrant.access_token.value
  },
  { quoteId: quote.id, description: 'Your purchase at Shoe Shop' }
)
```

At this point, the Online Marketplace can show to Alice that the payment to Shoe Shop has been completed.
