import * as crypto from 'crypto'
import * as fs from 'fs'

export function parseOrProvisionKey(
  keyFile: string | undefined
): crypto.KeyObject {
  const TMP_DIR = './tmp'
  if (keyFile) {
    try {
      const key = crypto.createPrivateKey(fs.readFileSync(keyFile))
      const jwk = key.export({ format: 'jwk' })
      if (jwk.crv === 'Ed25519') {
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
