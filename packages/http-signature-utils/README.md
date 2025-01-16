# HTTP Signature Utils Library

This library provides tools for working with [HTTP Message Signatures](https://datatracker.ietf.org/doc/draft-ietf-httpbis-message-signatures):

- Loading Ed25519 keys from a file or creating them
- Generating JWKs from Ed25519 keys
- Creating HTTP Signature headers & digests
- Validating and verifying HTTP Signature headers

HTTP Message Signatures are used for protecting the integrity of [Open Payments](https://openpayments.dev/introduction/http-signatures/) API requests.

## Installation

You can install the package using:

```shell
npm install @interledger/http-signature-utils
```

## Usage

Load a private Ed25519 key:

```ts
const key = loadKey('/PATH/TO/private-key.pem')
```

Generate a private Ed25519 key:

```ts
const key = generateKey('/PATH_TO_SAVE_KEY_IN')
```

Load or generate a private Ed25519 key:

```ts
const key = loadOrGenerateKey('/PATH/TO/private-key.pem')
```

Load a base64 encoded Ed25519 private key:

```ts
const key = loadBase64Key(
  'LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1DNENBUUF3QlFZREsyVndCQ0lFSUkvWHBwdkZPOWltNE9odWkxNytVMnpWNUNuMDJBWXBZWFpwcUlSQ1M0UFkKLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLQo='
)
```

Create JWK from private Ed25519 key:

```ts
const jwk = generateJwk({
  privateKey: key,
  keyId: '5cd52c55-05f1-41be-9474-a5c432cd4375'
})
```

Create signature headers:

```ts
const signatureHeaders = await createSignatureHeaders({
  request: {
    method: 'POST',
    url: 'https://example.com',
    headers: {
      authorization: 'GNAP 123454321'
    },
    body: JSON.stringify(body)
  }
  privateKey: key,
  keyId: '5cd52c55-05f1-41be-9474-a5c432cd4375'
})
```

Create signature and content headers:

```ts
const headers = await createHeaders({
  request: {
    method: 'POST',
    url: 'https://example.com',
    headers: {
      authorization: 'GNAP 123454321'
    },
    body: JSON.stringify(body)
  }
  privateKey: key,
  keyId: '5cd52c55-05f1-41be-9474-a5c432cd4375'
})
```

Validate signature and content headers:

```ts
const isValidHeader = validateSignatureHeaders(request: {
    method: 'POST',
    url: 'https://example.com',
    headers: {
      'content-type': 'application/json',
      'content-length': '1234',
      'content-digest': "sha-512=:vMVGexd7h7oBvi9aTwj05YvuCBTJaAYFPTwaxzu41/TyjXTueuKjxLlnTOhQfxE+YdA/QTiSXEkWh4gZ5zDZLg==:",
    signature: "sig1=:Tk6ZvOqKxPysDpLPyjDRah76Uskr8OYxcuJasg4tSrD8qRaGBTji+WdMHxkkTqUX1cASaoqAdE3s7YDUFmlnCw==:",
    'signature-input': 'sig1=("@method" "@target-uri" "authorization" "content-digest" "content-length" "content-type");created=1670837620;keyid="keyid-97a3a431-8ee1-48fc-ac85-70e2f5eba8e5";alg="ed25519"',
      authorization: 'GNAP 123454321'
    },
    body: JSON.stringify(body)
  })
```

Verify signature:

```ts
const isValidSig = await validateSignature(
  clientKey: jwk,
  request: {
    method: 'POST',
    url: 'https://example.com',
    headers: {
      'content-type': 'application/json',
      'content-length': '1234',
      'content-digest': "sha-512=:vMVGexd7h7oBvi9aTwj05YvuCBTJaAYFPTwaxzu41/TyjXTueuKjxLlnTOhQfxE+YdA/QTiSXEkWh4gZ5zDZLg==:",
    signature: "sig1=:Tk6ZvOqKxPysDpLPyjDRah76Uskr8OYxcuJasg4tSrD8qRaGBTji+WdMHxkkTqUX1cASaoqAdE3s7YDUFmlnCw==:",
    'signature-input': 'sig1=("@method" "@target-uri" "authorization" "content-digest" "content-length" "content-type");created=1670837620;keyid="keyid-97a3a431-8ee1-48fc-ac85-70e2f5eba8e5";alg="ed25519"',
      authorization: 'GNAP 123454321'
    },
    body: JSON.stringify(body)
  }
):
```
