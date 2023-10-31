import * as assert from 'assert'
import * as crypto from 'crypto'
import * as fs from 'fs'
import { Buffer } from 'buffer'
import { loadBase64Key, loadKey, loadOrGenerateKey, generateKey } from './key'

describe('Key methods', (): void => {
  const TMP_DIR = './tmp'

  beforeEach(async (): Promise<void> => {
    fs.rmSync(TMP_DIR, { recursive: true, force: true })
  })

  afterEach(async (): Promise<void> => {
    fs.rmSync(TMP_DIR, { recursive: true, force: true })
  })
  describe('loadOrGenerateKey', (): void => {
    test.each`
      tmpDirExists
      ${false}
      ${true}
    `(
      'generates key and saves file - tmp dir exists: $tmpDirExists',
      async ({ tmpDirExists }): Promise<void> => {
        if (tmpDirExists) {
          fs.mkdirSync(TMP_DIR)
        }
        expect(fs.existsSync(TMP_DIR)).toBe(tmpDirExists)
        const key = loadOrGenerateKey(undefined, { dir: TMP_DIR })
        expect(key).toMatchObject({
          asymmetricKeyType: 'ed25519',
          type: 'private'
        })
        expect(key.export({ format: 'jwk' })).toEqual({
          crv: 'Ed25519',
          kty: 'OKP',
          d: expect.any(String),
          x: expect.any(String)
        })
        const keyfiles = fs.readdirSync(TMP_DIR)
        expect(keyfiles.length).toBe(1)
        expect(fs.readFileSync(`${TMP_DIR}/${keyfiles[0]}`, 'utf8')).toEqual(
          key.export({ format: 'pem', type: 'pkcs8' })
        )
      }
    )

    test('generates new key if parsing error', async (): Promise<void> => {
      const key = loadOrGenerateKey('/some/wrong/file')
      expect(key).toBeInstanceOf(crypto.KeyObject)
      expect(key.export({ format: 'jwk' })).toMatchObject({
        crv: 'Ed25519',
        kty: 'OKP',
        d: expect.any(String),
        x: expect.any(String)
      })
    })

    test('can parse key', async (): Promise<void> => {
      const keypair = crypto.generateKeyPairSync('ed25519')
      const keyfile = `${TMP_DIR}/test-private-key.pem`
      fs.mkdirSync(TMP_DIR)
      fs.writeFileSync(
        keyfile,
        keypair.privateKey.export({ format: 'pem', type: 'pkcs8' })
      )
      assert.ok(fs.existsSync(keyfile))
      const fileStats = fs.statSync(keyfile)
      const key = loadOrGenerateKey(keyfile)
      expect(key).toBeInstanceOf(crypto.KeyObject)
      expect(key.export({ format: 'jwk' })).toEqual({
        crv: 'Ed25519',
        kty: 'OKP',
        d: expect.any(String),
        x: expect.any(String)
      })
      expect(key.export({ format: 'pem', type: 'pkcs8' })).toEqual(
        keypair.privateKey.export({ format: 'pem', type: 'pkcs8' })
      )
      expect(fs.statSync(keyfile).mtimeMs).toEqual(fileStats.mtimeMs)
      expect(fs.readdirSync(TMP_DIR).length).toEqual(1)
    })
  })

  describe('loadKey', (): void => {
    test('can parse key', async (): Promise<void> => {
      const keypair = crypto.generateKeyPairSync('ed25519')
      const keyfile = `${TMP_DIR}/test-private-key.pem`
      fs.mkdirSync(TMP_DIR)
      fs.writeFileSync(
        keyfile,
        keypair.privateKey.export({ format: 'pem', type: 'pkcs8' })
      )
      assert.ok(fs.existsSync(keyfile))
      const fileStats = fs.statSync(keyfile)
      const key = loadKey(keyfile)
      expect(key).toBeInstanceOf(crypto.KeyObject)
      expect(key.export({ format: 'jwk' })).toEqual({
        crv: 'Ed25519',
        kty: 'OKP',
        d: expect.any(String),
        x: expect.any(String)
      })
      expect(key.export({ format: 'pem', type: 'pkcs8' })).toEqual(
        keypair.privateKey.export({ format: 'pem', type: 'pkcs8' })
      )
      expect(fs.statSync(keyfile).mtimeMs).toEqual(fileStats.mtimeMs)
      expect(fs.readdirSync(TMP_DIR).length).toEqual(1)
    })

    test('throws if cannot read file', async (): Promise<void> => {
      const fileName = `${TMP_DIR}/private-key.pem`

      expect(() => {
        loadKey(fileName)
      }).toThrow(`Could not load file: ${fileName}`)
    })

    test('throws if invalid file', async (): Promise<void> => {
      const keyfile = `${TMP_DIR}/test-private-key.pem`
      fs.mkdirSync(TMP_DIR)
      fs.writeFileSync(keyfile, 'not a private key')
      assert.ok(fs.existsSync(keyfile))
      expect(() => loadKey(keyfile)).toThrow(
        'File was loaded, but private key was invalid'
      )
    })

    test('throws if wrong curve', async (): Promise<void> => {
      const keypair = crypto.generateKeyPairSync('ed448')
      const keyfile = `${TMP_DIR}/test-private-key.pem`
      fs.mkdirSync(TMP_DIR)
      fs.writeFileSync(
        keyfile,
        keypair.privateKey.export({ format: 'pem', type: 'pkcs8' })
      )
      assert.ok(fs.existsSync(keyfile))
      expect(() => loadKey(keyfile)).toThrow(
        'Private key did not have Ed25519 curve'
      )
    })
  })

  describe('generateKey', (): void => {
    test('generates key', (): void => {
      const key = generateKey()
      expect(key).toMatchObject({
        asymmetricKeyType: 'ed25519',
        type: 'private'
      })
      expect(key.export({ format: 'jwk' })).toEqual({
        crv: 'Ed25519',
        kty: 'OKP',
        d: expect.any(String),
        x: expect.any(String)
      })
    })

    test.each`
      tmpDirExists
      ${false}
      ${true}
    `(
      'generates key and saves file - tmp dir exists: $tmpDirExists',
      async ({ tmpDirExists }): Promise<void> => {
        if (tmpDirExists) {
          fs.mkdirSync(TMP_DIR)
        }
        expect(fs.existsSync(TMP_DIR)).toBe(tmpDirExists)
        const key = generateKey({ dir: TMP_DIR })
        expect(key).toMatchObject({
          asymmetricKeyType: 'ed25519',
          type: 'private'
        })
        expect(key.export({ format: 'jwk' })).toEqual({
          crv: 'Ed25519',
          kty: 'OKP',
          d: expect.any(String),
          x: expect.any(String)
        })
        const keyfiles = fs.readdirSync(TMP_DIR)
        expect(keyfiles.length).toBe(1)
        expect(fs.readFileSync(`${TMP_DIR}/${keyfiles[0]}`, 'utf8')).toEqual(
          key.export({ format: 'pem', type: 'pkcs8' })
        )
      }
    )

    test('generates key and saves with provided filename', (): void => {
      const fileName = 'private-key'
      const key = generateKey({ dir: TMP_DIR, fileName })
      expect(key).toMatchObject({
        asymmetricKeyType: 'ed25519',
        type: 'private'
      })
      expect(key.export({ format: 'jwk' })).toEqual({
        crv: 'Ed25519',
        kty: 'OKP',
        d: expect.any(String),
        x: expect.any(String)
      })
      const keyfiles = fs.readdirSync(TMP_DIR)
      expect(keyfiles.length).toBe(1)
      expect(keyfiles[0]).toBe(`${fileName}.pem`)
      expect(fs.readFileSync(`${TMP_DIR}/${keyfiles[0]}`, 'utf8')).toEqual(
        key.export({ format: 'pem', type: 'pkcs8' })
      )
    })
  })

  describe('loadBase64Key', (): void => {
    test('can load base64 encoded key', (): void => {
      const key = loadOrGenerateKey(undefined)
      const loadedKey = loadBase64Key(
        Buffer.from(key.export({ type: 'pkcs8', format: 'pem' })).toString(
          'base64'
        )
      )

      assert.ok(loadedKey)
      expect(loadedKey.export({ format: 'jwk' })).toEqual(
        key.export({ format: 'jwk' })
      )
    })

    test('returns undefined if not Ed25519 key', (): void => {
      const key = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048
      }).privateKey
      const loadedKey = loadBase64Key(
        Buffer.from(key.export({ type: 'pkcs8', format: 'pem' })).toString(
          'base64'
        )
      )
      expect(loadedKey).toBeUndefined()
    })
  })
})
