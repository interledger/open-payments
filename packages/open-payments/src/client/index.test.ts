import { createAuthenticatedClient, OpenPaymentsClientError } from '.'
import fs from 'fs'
import assert from 'assert'
import { generateKeyPairSync } from 'crypto'
import { silentLogger } from '../test/helpers'

describe('Client', (): void => {
  const TMP_DIR = './tmp'

  beforeEach(async (): Promise<void> => {
    fs.rmSync(TMP_DIR, { recursive: true, force: true })
  })

  afterEach(async (): Promise<void> => {
    fs.rmSync(TMP_DIR, { recursive: true, force: true })
  })

  describe('createAuthenticatedClient', (): void => {
    test('properly loads key with privateKey as file path', async (): Promise<void> => {
      const keypair = generateKeyPairSync('ed25519')
      const keyFilePath = `${TMP_DIR}/test-private-key.pem`
      fs.mkdirSync(TMP_DIR)
      fs.writeFileSync(
        keyFilePath,
        keypair.privateKey.export({ format: 'pem', type: 'pkcs8' })
      )
      assert.ok(fs.existsSync(keyFilePath))

      await expect(
        createAuthenticatedClient({
          keyId: 'keyid-1',
          walletAddressUrl: 'http://localhost:1000/.well-known/pay',
          privateKey: keyFilePath,
          logger: silentLogger
        })
      ).resolves.toBeDefined()
    })

    test('properly loads key with privateKey as KeyObject', async (): Promise<void> => {
      const keypair = generateKeyPairSync('ed25519')

      await expect(
        createAuthenticatedClient({
          logger: silentLogger,
          keyId: 'keyid-1',
          walletAddressUrl: 'http://localhost:1000/.well-known/pay',
          privateKey: keypair.privateKey
        })
      ).resolves.toBeDefined()
    })

    test('properly loads key with privateKey as Buffer', async (): Promise<void> => {
      const keypair = generateKeyPairSync('ed25519')

      await expect(
        createAuthenticatedClient({
          logger: silentLogger,
          keyId: 'keyid-1',
          walletAddressUrl: 'http://localhost:1000/.well-known/pay',
          privateKey: Buffer.from(
            keypair.privateKey.export({ format: 'pem', type: 'pkcs8' })
          )
        })
      ).resolves.toBeDefined()
    })

    test('properly creates the client if a custom request interceptor is passed', async (): Promise<void> => {
      await expect(
        createAuthenticatedClient({
          logger: silentLogger,
          walletAddressUrl: 'http://localhost:1000/.well-known/pay',
          requestInterceptor: (config) => config
        })
      ).resolves.toBeDefined()
    })

    test('throws error if could not load private key as Buffer', async (): Promise<void> => {
      try {
        await createAuthenticatedClient({
          logger: silentLogger,
          keyId: 'keyid-1',
          walletAddressUrl: 'http://localhost:1000/.well-known/pay',
          privateKey: Buffer.from('')
        })
      } catch (error) {
        assert.ok(error instanceof OpenPaymentsClientError)
        expect(error.message).toBe(
          'Could not load private key when creating Open Payments client'
        )
        expect(error.description).toBe('Key is not a valid file')
      }
    })

    test('throws error if could not load private key', async (): Promise<void> => {
      try {
        await createAuthenticatedClient({
          logger: silentLogger,
          keyId: 'keyid-1',
          walletAddressUrl: 'http://localhost:1000/.well-known/pay',
          privateKey: '/incorrect/path/'
        })
      } catch (error) {
        assert.ok(error instanceof OpenPaymentsClientError)
        expect(error.message).toBe(
          'Could not load private key when creating Open Payments client'
        )
        expect(error.description).toBe('Key is not a valid path or file')
      }
    })

    test('throws an error if both requestInterceptor and privateKey/keyId are provided', async (): Promise<void> => {
      const keypair = generateKeyPairSync('ed25519')
      try {
        //@ts-expect-error - testing invalid arguments
        await createAuthenticatedClient({
          logger: silentLogger,
          keyId: 'keyid-1',
          walletAddressUrl: 'http://localhost:1000/.well-known/pay',
          privateKey: keypair.privateKey,
          requestInterceptor: (config) => config
        })

        //@ts-expect-error - testing invalid arguments
        await createAuthenticatedClient({
          logger: silentLogger,
          walletAddressUrl: 'http://localhost:1000/.well-known/pay',
          privateKey: keypair.privateKey,
          requestInterceptor: (config) => config
        })

        //@ts-expect-error - testing invalid arguments
        await createAuthenticatedClient({
          logger: silentLogger,
          walletAddressUrl: 'http://localhost:1000/.well-known/pay',
          keyId: 'kid',
          requestInterceptor: (config) => config
        })
      } catch (error) {
        assert.ok(error instanceof OpenPaymentsClientError)
        expect(error.message).toBe(
          'Invalid arguments when creating authenticated client.'
        )
        expect(error.description).toBe(
          'Both `requestInterceptor` and `privateKey`/`keyId` were provided. Please use only one of these options.'
        )
      }
    })
  })
})
