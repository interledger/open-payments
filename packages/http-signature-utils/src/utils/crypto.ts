import * as ed from '@noble/ed25519'
import { sha512 } from '@noble/hashes/sha512'

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m))

/**
 * PKCS#8 PrivateKeyInfo SEQUENCE:
 *  - version: INTEGER 0
 *  - algorithm: SEQUENCE
 *    - OJBECT IDENTIFIER: 1.3.101.112 curveEd25519 (EdDSA 25519 signature algorithm)
 *  - privateKey OCTET STRING
 */
const PCKS8_SEQUENCE_PARTS = new Uint8Array([
  48, 46, 2, 1, 0, 48, 5, 6, 3, 43, 101, 112, 4, 34, 4, 32
])

export function generateEd25519KeyPair() {
  const privateKey = ed.utils.randomPrivateKey()
  const publicKey = ed.getPublicKey(privateKey)

  return { privateKey, publicKey }
}

// TODO: Do we need to export the private key as JWK as well?
export function exportPKCS8(privateKey: Uint8Array, format: 'pem' = 'pem') {
  if (format !== 'pem') throw new Error('Unsupported format')

  const header = '-----BEGIN PRIVATE KEY-----'
  const footer = '-----END PRIVATE KEY-----'

  // TODO: add concat utility
  const pkcs8PrivateKey = new Uint8Array([
    ...PCKS8_SEQUENCE_PARTS,
    ...privateKey
  ])

  // `btoa` and `atob` are marked as deprecated in Node.js
  const body =
    typeof Buffer !== 'undefined'
      ? Buffer.from(pkcs8PrivateKey).toString('base64')
      : btoa(new TextDecoder().decode(pkcs8PrivateKey))

  return `${header}\n${body}\n${footer}`
}

export function exportJWK(key: Uint8Array) {
  let binary = ''

  key.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  const base64PublicKey =
    typeof Buffer !== 'undefined'
      ? Buffer.from(binary, 'binary').toString('base64')
      : btoa(binary)

  const base64UrlPublicKey = base64PublicKey
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const jwk = {
    crv: 'Ed25519',
    alg: 'EdDSA',
    kty: 'OKP',
    x: base64UrlPublicKey
  }

  return jwk
}

export { ed }
