import * as assert from 'assert'
import * as crypto from 'crypto'
import * as fs from 'fs'
import { Buffer } from 'buffer'
import { loadBase64Key, loadKey, loadOrGenerateKey, generateKey } from './key'
import { exportJWK, exportPKCS8, generateEd25519KeyPair } from './crypto'

export async function exportCryptoKey(key: CryptoKey) {
  const exported = await crypto.subtle.exportKey('pkcs8', key)
  const exportedAsString = String.fromCharCode.apply(
    null,
    new Uint8Array(exported)
  )
  const exportedAsBase64 = btoa(exportedAsString)
  return `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`
}

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
        expect(exportJWK(key)).toEqual({
          crv: 'Ed25519',
          kty: 'OKP',
          d: expect.any(String),
          x: expect.any(String)
        })
        const keyfiles = fs.readdirSync(TMP_DIR)
        expect(keyfiles.length).toBe(1)
        expect(fs.readFileSync(`${TMP_DIR}/${keyfiles[0]}`, 'utf8')).toEqual(
          exportPKCS8(key)
        )
      }
    )

    test('generates new key if parsing error', async (): Promise<void> => {
      const key = loadOrGenerateKey('/some/wrong/file')
      expect(key).toBeInstanceOf(Uint8Array)
      expect(key.byteLength).toBe(48)
      expect(exportJWK(key)).toMatchObject({
        crv: 'Ed25519',
        kty: 'OKP',
        d: expect.any(String),
        x: expect.any(String)
      })
    })

    test('can parse key that was generated using noble', async (): Promise<void> => {
      const keypair = generateEd25519KeyPair()
      const keyfile = `${TMP_DIR}/test-private-key.pem`
      fs.mkdirSync(TMP_DIR)
      fs.writeFileSync(keyfile, exportPKCS8(keypair.privateKey))
      assert.ok(fs.existsSync(keyfile))
      const fileStats = fs.statSync(keyfile)
      const key = loadOrGenerateKey(keyfile)
      expect(key).toBeInstanceOf(Uint8Array)
      expect(key.byteLength).toBe(48)
      expect(exportJWK(key)).toEqual({
        crv: 'Ed25519',
        kty: 'OKP',
        d: expect.any(String),
        x: expect.any(String)
      })
      expect(exportPKCS8(key)).toEqual(exportPKCS8(keypair.privateKey))
      expect(fs.statSync(keyfile).mtimeMs).toEqual(fileStats.mtimeMs)
      expect(fs.readdirSync(TMP_DIR).length).toEqual(1)
    })

    test('can parse key that was generated using node crypto module', async (): Promise<void> => {
      const keypair = crypto.generateKeyPairSync('ed25519')
      const keyfile = `${TMP_DIR}/test-private-key.pem`
      fs.mkdirSync(TMP_DIR)
      fs.writeFileSync(
        keyfile,
        keypair.privateKey.export({ type: 'pkcs8', format: 'pem' })
      )
      assert.ok(fs.existsSync(keyfile))
      const fileStats = fs.statSync(keyfile)
      const key = loadOrGenerateKey(keyfile)
      expect(key).toBeInstanceOf(Uint8Array)
      expect(key.byteLength).toBe(48)
      expect(exportJWK(key)).toEqual({
        crv: 'Ed25519',
        kty: 'OKP',
        d: expect.any(String),
        x: expect.any(String)
      })
      const keyPem = keypair.privateKey.export({ type: 'pkcs8', format: 'pem' })
      expect(exportPKCS8(key)).toEqual(keyPem.slice(0, keyPem.length - 1))
      expect(fs.statSync(keyfile).mtimeMs).toEqual(fileStats.mtimeMs)
      expect(fs.readdirSync(TMP_DIR).length).toEqual(1)
    })

    test('can parse key that was generated using subtle crypto', async (): Promise<void> => {
      const keypair = (await crypto.subtle.generateKey('Ed25519', true, [
        'sign',
        'verify'
      ])) as CryptoKeyPair
      const privateKeyPem = await exportCryptoKey(keypair.privateKey)
      const keyfile = `${TMP_DIR}/test-private-key.pem`
      fs.mkdirSync(TMP_DIR)
      fs.writeFileSync(keyfile, privateKeyPem)
      assert.ok(fs.existsSync(keyfile))
      const fileStats = fs.statSync(keyfile)
      const key = loadOrGenerateKey(keyfile)
      expect(key).toBeInstanceOf(Uint8Array)
      expect(key.byteLength).toBe(48)
      expect(exportJWK(key)).toEqual({
        crv: 'Ed25519',
        kty: 'OKP',
        d: expect.any(String),
        x: expect.any(String)
      })

      expect(exportPKCS8(key)).toEqual(
        await exportCryptoKey(keypair.privateKey)
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
      expect(key).toBeInstanceOf(Uint8Array)
      expect(key.byteLength).toBe(48)
      expect(exportJWK(key)).toEqual({
        crv: 'Ed25519',
        kty: 'OKP',
        d: expect.any(String),
        x: expect.any(String)
      })
      // Needs trimming. Exporting a key using crypto module adds a newline at the end
      expect(exportPKCS8(key)).toEqual(
        (
          keypair.privateKey.export({ format: 'pem', type: 'pkcs8' }) as string
        ).trim()
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

    // test('throws if invalid file', async (): Promise<void> => {
    //   const keyfile = `${TMP_DIR}/test-private-key.pem`
    //   fs.mkdirSync(TMP_DIR)
    //   fs.writeFileSync(keyfile, 'not a private key')
    //   assert.ok(fs.existsSync(keyfile))
    //   expect(() => loadKey(keyfile)).toThrow(
    //     'File was loaded, but private key was invalid'
    //   )
    // })

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
      expect(exportJWK(key)).toEqual({
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
        expect(exportJWK(key)).toEqual({
          crv: 'Ed25519',
          kty: 'OKP',
          d: expect.any(String),
          x: expect.any(String)
        })
        const keyfiles = fs.readdirSync(TMP_DIR)
        expect(keyfiles.length).toBe(1)
        expect(fs.readFileSync(`${TMP_DIR}/${keyfiles[0]}`, 'utf8')).toEqual(
          exportPKCS8(key)
        )
      }
    )

    test('generates key and saves with provided filename', (): void => {
      const fileName = 'private-key'
      const key = generateKey({ dir: TMP_DIR, fileName })
      expect(exportJWK(key)).toEqual({
        crv: 'Ed25519',
        kty: 'OKP',
        d: expect.any(String),
        x: expect.any(String)
      })
      const keyfiles = fs.readdirSync(TMP_DIR)
      expect(keyfiles.length).toBe(1)
      expect(keyfiles[0]).toBe(`${fileName}.pem`)
      expect(fs.readFileSync(`${TMP_DIR}/${keyfiles[0]}`, 'utf8')).toEqual(
        exportPKCS8(key)
      )
    })
  })

  describe('loadBase64Key', (): void => {
    test('can load base64 encoded key', (): void => {
      const key = loadOrGenerateKey(undefined)
      const loadedKey = loadBase64Key(
        Buffer.from(exportPKCS8(key)).toString('base64')
      )
      assert.ok(loadedKey)
      expect(exportJWK(loadedKey)).toEqual(exportJWK(key))
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
