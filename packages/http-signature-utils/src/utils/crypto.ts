import * as ed from '@noble/ed25519'
import { sha512 } from '@noble/hashes/sha512'
import { type JWK } from './jwk'
import { binaryToBase64url } from './helpers'

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

  return {
    privateKey: new Uint8Array([...PCKS8_SEQUENCE_PARTS, ...privateKey]),
    publicKey
  }
}

export function exportPKCS8(privateKey: Uint8Array) {
  const header = '-----BEGIN PRIVATE KEY-----'
  const footer = '-----END PRIVATE KEY-----'

  const body =
    typeof Buffer !== 'undefined'
      ? Buffer.from(privateKey).toString('base64')
      : btoa(String.fromCharCode(...privateKey))

  return `${header}\n${body}\n${footer}`
}

export function exportJWK(key: Uint8Array): Omit<JWK, 'kid' | 'alg'> {
  if (![32, 48].includes(key.length)) throw new Error('Invalid key length.')

  let binary = ''
  const isPrivateKey = key.length === 48

  if (isPrivateKey) {
    let publicKeyBinary = ''
    const privateKey = key.subarray(16, 48)
    const publicKey = ed.getPublicKey(privateKey)
    privateKey.forEach((byte) => {
      binary += String.fromCharCode(byte)
    })
    publicKey.forEach((byte) => {
      publicKeyBinary += String.fromCharCode(byte)
    })

    return {
      kty: 'OKP',
      crv: 'Ed25519',
      x: binaryToBase64url(publicKeyBinary),
      d: binaryToBase64url(binary)
    }
  }

  key.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return {
    kty: 'OKP',
    crv: 'Ed25519',
    x: binaryToBase64url(binary)
  }
}

export { ed }
