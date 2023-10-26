import { createAuthenticatedClient } from '.'
import fs from 'fs'
import assert from 'assert'
import { generateKeyPairSync } from 'crypto'

describe('Client', (): void => {
  const TMP_DIR = './tmp'

  beforeEach(async (): Promise<void> => {
    fs.rmSync(TMP_DIR, { recursive: true, force: true })
  })

  afterEach(async (): Promise<void> => {
    fs.rmSync(TMP_DIR, { recursive: true, force: true })
  })

  describe('createAuthenticatedClient', (): void => {
    test('properly loads key', async (): Promise<void> => {
      const keypair = generateKeyPairSync('ed25519')
      const keyfile = `${TMP_DIR}/test-private-key.pem`
      fs.mkdirSync(TMP_DIR)
      fs.writeFileSync(
        keyfile,
        keypair.privateKey.export({ format: 'pem', type: 'pkcs8' })
      )
      assert.ok(fs.existsSync(keyfile))

      await expect(
        createAuthenticatedClient({
          keyId: 'keyid-1',
          walletAddressUrl: 'http://localhost:1000/.well-known/pay',
          privateKeyFilePath: keyfile
        })
      ).resolves.toBeDefined()
    })

    test('throws error if could not load private key', async (): Promise<void> => {
      await expect(() =>
        createAuthenticatedClient({
          keyId: 'keyid-1',
          walletAddressUrl: 'http://localhost:1000/.well-known/pay',
          privateKeyFilePath: '/incorrect/path/'
        })
      ).rejects.toThrow()
    })
  })
})
