# HTTP Signature Utils Library

The Library includes

- loading Ed25519 keys from file or creating them
- generating JWKs from Ed25519 keys
- creating HTTP signature headers
- validate and verify HTTP signature headers

## Local Development

### Building

From the monorepo root directory:

```shell
pnpm --filter http-signature-utils build
```

### Testing

From the monorepo root directory:

```shell
pnpm --filter http-signature-utils test
```

## Usage

Load or generate a private key

```ts
const key = parseOrProvisionKey('/PATH/TO/private-key.pem')
```

Create JWK from private key

```ts
const jwk = generateJwk({
  privateKey: key,
  keyId: '5cd52c55-05f1-41be-9474-a5c432cd4375'
})
```

Create Signature Headers

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

Create Signature and Content Headers

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

Validate Signature and Content Headers

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

Verify signature

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
