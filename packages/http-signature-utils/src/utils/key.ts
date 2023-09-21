import * as crypto from 'crypto'
import * as fs from 'fs'

export function parseOrProvisionKey(
  keyFile: string | undefined
): crypto.KeyObject {
  const TMP_DIR = './tmp'
  if (keyFile) {
    try {
      const key = crypto.createPrivateKey(fs.readFileSync(keyFile))
      if (checkKey(key)) {
        console.log(`Key ${keyFile} loaded.`)
        return key
      } else {
        console.log('Private key is not EdDSA-Ed25519 key. Generating new key.')
      }
    } catch (err) {
      console.log('Private key could not be loaded.')
      throw err
    }
  }
  const keypair = crypto.generateKeyPairSync('ed25519')
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR)
  }
  fs.writeFileSync(
    `${TMP_DIR}/private-key-${new Date().getTime()}.pem`,
    keypair.privateKey.export({ format: 'pem', type: 'pkcs8' })
  )
  return keypair.privateKey
}

export function loadBase64Key(base64Key: string): crypto.KeyObject | undefined {
  const privateKey = Buffer.from(base64Key, 'base64').toString('utf-8')
  const key = crypto.createPrivateKey(privateKey)
  if (checkKey(key)) {
    return key
  }
}

function checkKey(key: crypto.KeyObject): boolean {
  const jwk = key.export({ format: 'jwk' })
  return jwk.crv === 'Ed25519'
}
