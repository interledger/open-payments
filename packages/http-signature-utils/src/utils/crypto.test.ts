import { generateEd25519KeyPair, exportPKCS8, exportJWK } from './crypto'

describe('crypto', (): void => {
  describe('generateEd25519KeyPair', (): void => {
    test('generates key pair using the 25519 curve', async (): Promise<void> => {
      const { privateKey, publicKey } = generateEd25519KeyPair()

      expect(privateKey).toHaveLength(48)
      expect(publicKey).toHaveLength(32)
    })
  })

  describe('exportPCKS8', (): void => {
    test('exports private key as PKCS8 in PEM format', async (): Promise<void> => {
      const { privateKey } = generateEd25519KeyPair()
      const pem = exportPKCS8(privateKey)
      const [, body] = pem.split('\n')

      expect(pem).toContain('-----BEGIN PRIVATE KEY-----')
      expect(pem).toContain('-----END PRIVATE KEY-----')
      expect(Buffer.from(body, 'base64').toString('base64')).toStrictEqual(body)
    })
  })

  test('compatibility - noble, subtle crypto', async (): Promise<void> => {
    const { publicKey, privateKey } = generateEd25519KeyPair()
    const importedPublicKey = await crypto.subtle.importKey(
      'raw',
      publicKey,
      'Ed25519',
      true,
      ['verify']
    )
    const importedPrivateKey = await crypto.subtle.importKey(
      'pkcs8',
      privateKey,
      'Ed25519',
      true,
      ['sign']
    )

    const customPublicKeyExport = exportJWK(publicKey)
    const customPrivateKeyExport = exportJWK(privateKey)
    const subtlePublicKeyExport = await crypto.subtle.exportKey(
      'jwk',
      importedPublicKey
    )
    const subtlePrivateKeyExport = await crypto.subtle.exportKey(
      'jwk',
      importedPrivateKey
    )

    expect(customPublicKeyExport.x).toStrictEqual(subtlePublicKeyExport.x)
    expect(customPrivateKeyExport.x).toStrictEqual(subtlePrivateKeyExport.x)
    expect(customPrivateKeyExport.d).toStrictEqual(subtlePrivateKeyExport.d)
  })
})
