import crypto from 'crypto'
import { v4 } from 'uuid'

import { generateJwk, JWK } from '../utils/jwk'

export type TestKeys = {
  publicKey: JWK
  privateKey: crypto.KeyObject
}

export function generateTestKeys(): TestKeys {
  const { privateKey } = crypto.generateKeyPairSync('ed25519')

  return {
    publicKey: generateJwk({
      keyId: v4(),
      privateKey
    }),
    privateKey
  }
}
