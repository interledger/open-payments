import crypto from 'crypto'
import { generateEd25519KeyPair, exportPKCS8, exportJWK } from './crypto'
import { generateKey, loadKey, isKeyEd25519 } from './key'
import fs from 'fs'

describe('crypto', (): void => {
  describe('generateEd25519KeyPair', (): void => {
    test('generates key pair using the 25519 curve', async (): Promise<void> => {
      const { privateKey, publicKey } = generateEd25519KeyPair()

      expect(privateKey).toHaveLength(32)
      expect(publicKey).toHaveLength(32)
    })
  })

  describe('exportPCKS8', (): void => {
    test('exports private key as PKCS8 [PEM - noble]', async (): Promise<void> => {
      const { privateKey } = generateEd25519KeyPair()
      const pem = exportPKCS8(privateKey)
      const [, body] = pem.split('\n')

      expect(pem).toContain('-----BEGIN PRIVATE KEY-----')
      expect(pem).toContain('-----END PRIVATE KEY-----')
      expect(Buffer.from(body, 'base64').toString('base64')).toStrictEqual(body)
    })

    test('exports private key as PKCS8 [PEM - node crypto]', async (): Promise<void> => {
      const { privateKey } = crypto.generateKeyPairSync('ed25519')
      const pem = privateKey.export({ format: 'pem', type: 'pkcs8' }) as string
      const [, body] = pem.split('\n')

      expect(pem).toContain('-----BEGIN PRIVATE KEY-----')
      expect(pem).toContain('-----END PRIVATE KEY-----')
      expect(Buffer.from(body, 'base64').toString('base64')).toStrictEqual(body)
    })
  })

  test('testing - 1', (): void => {
    const TMP_DIR = './tmp-crypto'
    generateKey({ dir: TMP_DIR, fileName: 'test-private-key' })
    const privateKey = loadKey(`${TMP_DIR}/test-private-key.pem`)
    fs.rmSync(TMP_DIR, { recursive: true, force: true })

    expect(isKeyEd25519(privateKey)).toBe(true)
  })

  test('testing - 2', async (): Promise<void> => {
    const { publicKey, privateKey } = generateEd25519KeyPair()

    const importedPublicKey = await crypto.subtle.importKey(
      'raw',
      publicKey,
      'Ed25519',
      true,
      ['verify']
    )

    const importedPrivateKey = await crypto.subtle.importKey(
      'raw',
      privateKey,
      'Ed25519',
      true,
      []
    )

    const customPublicKeyExport = exportJWK(publicKey)
    const subtlePublicKeyExport = await crypto.subtle.exportKey(
      'jwk',
      importedPublicKey
    )

    const customPrivateKeyExport = exportJWK(privateKey)
    const subtlePrivateKeyExport = await crypto.subtle.exportKey(
      'jwk',
      importedPrivateKey
    )

    expect(customPublicKeyExport.x).toStrictEqual(subtlePublicKeyExport.x)
    expect(customPrivateKeyExport.x).toStrictEqual(subtlePrivateKeyExport.x)
  })
})
