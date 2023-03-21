import * as assert from 'assert'
import * as crypto from 'crypto'
import * as fs from 'fs'
import { parseOrProvisionKey } from './key'

describe('Config', (): void => {
  describe('parseOrProvisionKey', (): void => {
    const TMP_DIR = './tmp'

    beforeEach(async (): Promise<void> => {
      fs.rmSync(TMP_DIR, { recursive: true, force: true })
    })

    afterEach(async (): Promise<void> => {
      fs.rmSync(TMP_DIR, { recursive: true, force: true })
    })

    test.each`
      tmpDirExists
      ${false}
      ${true}
    `(
      'can provision key - tmp dir exists: $tmpDirExists',
      async ({ tmpDirExists }): Promise<void> => {
        if (tmpDirExists) {
          fs.mkdirSync(TMP_DIR)
        }
        expect(fs.existsSync(TMP_DIR)).toBe(tmpDirExists)
        const key = parseOrProvisionKey(undefined)
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
    test('throws if cannot read file', async (): Promise<void> => {
      expect(() => {
        parseOrProvisionKey(`${TMP_DIR}/private-key.pem`)
      }).toThrow()
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
      const key = parseOrProvisionKey(keyfile)
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
    test('generates new key if wrong curve', async (): Promise<void> => {
      const keypair = crypto.generateKeyPairSync('ed448')
      const keyfile = `${TMP_DIR}/test-private-key.pem`
      fs.mkdirSync(TMP_DIR)
      fs.writeFileSync(
        keyfile,
        keypair.privateKey.export({ format: 'pem', type: 'pkcs8' })
      )
      assert.ok(fs.existsSync(keyfile))
      const fileStats = fs.statSync(keyfile)
      const key = parseOrProvisionKey(keyfile)
      expect(key).toBeInstanceOf(crypto.KeyObject)
      expect(key.export({ format: 'jwk' })).toMatchObject({
        crv: 'Ed25519',
        kty: 'OKP',
        d: expect.any(String),
        x: expect.any(String)
      })
      expect(key.export({ format: 'pem', type: 'pkcs8' })).not.toEqual(
        keypair.privateKey.export({ format: 'pem', type: 'pkcs8' })
      )
      const keyfiles = fs.readdirSync(TMP_DIR)
      expect(keyfiles.length).toEqual(2)
      expect(keyfiles.filter((f) => f.startsWith('private')).length).toEqual(1)
      expect(fs.statSync(keyfile).mtimeMs).toEqual(fileStats.mtimeMs)
    })
  })
})
