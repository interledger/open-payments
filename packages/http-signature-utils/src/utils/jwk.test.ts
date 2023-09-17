import { generateKeyPairSync } from 'crypto'
import { generateJwk } from './jwk'

describe('jwk', (): void => {
  describe('generateJwk', (): void => {
    test('properly generates jwk', async (): Promise<void> => {
      expect(generateJwk({ keyId: 'keyid' })).toEqual({
        alg: 'EdDSA',
        kid: 'keyid',
        kty: 'OKP',
        crv: 'Ed25519',
        x: expect.any(String)
      })
    })

    test('properly generates jwk with defined private key', async (): Promise<void> => {
      expect(
        generateJwk({
          keyId: 'keyid',
          privateKey: generateKeyPairSync('ed25519').privateKey
        })
      ).toEqual({
        alg: 'EdDSA',
        kid: 'keyid',
        kty: 'OKP',
        crv: 'Ed25519',
        x: expect.any(String)
      })
    })

    test('throws if empty keyId', async (): Promise<void> => {
      expect(() => generateJwk({ keyId: '' })).toThrow('KeyId cannot be empty')
    })

    test('throws if provided key is not EdDSA-Ed25519', async (): Promise<void> => {
      expect(() =>
        generateJwk({
          keyId: 'keyid',
          privateKey: generateKeyPairSync('ed448').privateKey
        })
      ).toThrow('Key is not EdDSA-Ed25519')
    })
  })
})
