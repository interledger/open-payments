import { createPublicKey, generateKeyPairSync, KeyObject } from 'crypto'

export interface JWK {
  kid: string
  alg: 'EdDSA'
  use?: 'sig'
  kty: 'OKP'
  crv: 'Ed25519'
  x: string
}

export const generateJwk = ({
  privateKey: providedPrivateKey,
  keyId
}: {
  privateKey?: KeyObject
  keyId: string
}): JWK => {
  if (!keyId.trim()) {
    throw new Error('KeyId cannot be empty')
  }

  const privateKey = providedPrivateKey
    ? providedPrivateKey
    : generateKeyPairSync('ed25519').privateKey

  const jwk = createPublicKey(privateKey).export({
    format: 'jwk'
  })
  if (jwk.x === undefined) {
    throw new Error('Failed to derive public key')
  }

  if (jwk.crv !== 'Ed25519' || jwk.kty !== 'OKP' || !jwk.x) {
    throw new Error('Key is not EdDSA-Ed25519')
  }

  return {
    alg: 'EdDSA',
    kid: keyId,
    kty: jwk.kty,
    crv: jwk.crv,
    x: jwk.x
  }
}
