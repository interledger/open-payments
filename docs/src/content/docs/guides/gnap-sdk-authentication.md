# GNAP Authentication for SDK Developers

This guide explains how GNAP (Grant Negotiation and Authorization Protocol, RFC 9635) authentication works in Open Payments and how to implement it when building SDK clients.

## Overview

Open Payments uses GNAP instead of OAuth 2.0 for authorization. Key differences:

| Feature | OAuth 2.0 | GNAP (RFC 9635) |
|---|---|---|
| Token binding | Bearer tokens | Key-bound tokens |
| Proof of possession | Optional (DPoP) | Required (HTTP Signatures) |
| Grant model | Implicit scope | Explicit access rights |
| Client auth | Client secrets | Key proofs |
| Continuation | Refresh tokens | Grant continuation |

## Authentication Flow

### 1. Client Key Registration

Before making any API calls, your client must have an asymmetric key pair (Ed25519 recommended):

```typescript
import { generateKeyPairSync } from 'crypto';

const { publicKey, privateKey } = generateKeyPairSync('ed25519');
```

### 2. Grant Request

Request access to resources by sending a grant request to the authorization server:

```http
POST / HTTP/1.1
Host: auth.wallet.example
Content-Type: application/json
Signature-Input: sig=("@method" "@target-uri" "content-type" "content-digest");created=1618884473;keyid="client-key-1"
Signature: sig=:base64signature:
Content-Digest: sha-256=:base64hash:

{
  "access_token": {
    "access": [
      {
        "type": "incoming-payment",
        "actions": ["create", "read", "list"]
      }
    ]
  },
  "client": {
    "key": {
      "proof": "httpsig",
      "jwk": { ... }
    }
  },
  "interact": {
    "start": ["redirect"],
    "finish": {
      "method": "redirect",
      "uri": "https://myapp.example/callback",
      "nonce": "LKLTI25DK82FX4T4QFZC"
    }
  }
}
```

### 3. Resource Owner Interaction

The authorization server returns a redirect URI. Direct the resource owner there:

```json
{
  "interact": {
    "redirect": "https://auth.wallet.example/interact/4CF492MLVMSW9MKMXKHQ"
  },
  "continue": {
    "access_token": {
      "value": "80RBER7S28KT4"
    },
    "uri": "https://auth.wallet.example/continue/KSSKX10XS"
  }
}
```

### 4. Continue Grant

After the resource owner authorizes, continue the grant to obtain an access token:

```http
POST /continue/KSSKX10XS HTTP/1.1
Host: auth.wallet.example
Authorization: GNAP 80RBER7S28KT4
Signature-Input: sig=("@method" "@target-uri" "authorization");created=1618884480;keyid="client-key-1"
Signature: sig=:base64signature:

{
  "interact_ref": "4IFWWIKYBC2PQ6U56NL1"
}
```

### 5. Use Access Token

Include the access token in API requests, along with HTTP Message Signatures:

```http
GET /incoming-payments HTTP/1.1
Host: wallet.example
Authorization: GNAP access-token-value
Signature-Input: sig=("@method" "@target-uri" "authorization");created=1618884490;keyid="client-key-1"
Signature: sig=:base64signature:
```

## HTTP Message Signatures (RFC 9421)

Every authenticated request must include HTTP Message Signatures. The signature proves that the request was made by the holder of the private key bound to the access token.

### Covered Components

For Open Payments, the minimum covered components are:

- `@method` - The HTTP method
- `@target-uri` - The full request URL
- `authorization` - The Authorization header (when present)
- `content-digest` - Body hash (for requests with bodies)
- `content-type` - Content type (for requests with bodies)

### Signature Construction

1. **Build the signature base** (the string to sign):
   ```
   "@method": POST
   "@target-uri": https://wallet.example/incoming-payments
   "authorization": GNAP access-token-value
   "content-type": application/json
   "content-digest": sha-256=:X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=:
   "@signature-params": ("@method" "@target-uri" "authorization" "content-type" "content-digest");created=1618884490;keyid="client-key-1"
   ```

2. **Sign the base** with your Ed25519 private key
3. **Base64-encode** the signature
4. **Add headers**: `Signature` and `Signature-Input`

## Common Pitfalls

1. **Missing Content-Digest**: POST/PUT/PATCH requests must include a Content-Digest header
2. **Clock skew**: The `created` timestamp must be within the server's acceptable window
3. **Key binding**: The key used for signing must match the key registered with the grant
4. **Component ordering**: Covered components in the signature base must match the Signature-Input order

## Resources

- [RFC 9635 - GNAP](https://www.rfc-editor.org/rfc/rfc9635)
- [RFC 9421 - HTTP Message Signatures](https://www.rfc-editor.org/rfc/rfc9421)
- [RFC 9530 - Digest Fields](https://www.rfc-editor.org/rfc/rfc9530)
- [Open Payments Documentation](https://openpayments.dev)
