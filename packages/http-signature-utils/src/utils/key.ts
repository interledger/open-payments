import * as crypto from 'crypto'
import * as fs from 'fs'

export function parseKey(keyFilePath: string): crypto.KeyObject {
  let fileBuffer
  try {
    fileBuffer = fs.readFileSync(keyFilePath)
  } catch (error) {
    throw new Error(`Could not load file: ${keyFilePath}`)
  }

  let key
  try {
    key = crypto.createPrivateKey(fileBuffer)
  } catch (error) {
    throw new Error('File was loaded, but private key was invalid')
  }

  if (!isKeyEd25519(key)) {
    throw new Error('Private key did not have Ed25519 curve')
  }

  return key
}

export function provisionKey(dir: string): crypto.KeyObject {
  const keypair = crypto.generateKeyPairSync('ed25519')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  fs.writeFileSync(
    `${dir}/private-key-${new Date().getTime()}.pem`,
    keypair.privateKey.export({ format: 'pem', type: 'pkcs8' })
  )
  return keypair.privateKey
}

export function parseOrProvisionKey(keyFile?: string): crypto.KeyObject {
  if (keyFile) {
    try {
      return parseKey(keyFile)
    } catch (error) {
      console.warn(
        `parseOrProvisionKey: could not parse key (${
          error instanceof Error ? error.message : 'unknown error'
        }). Generating new key.`
      )
    }
  }

  const TMP_DIR = './tmp'
  return provisionKey(TMP_DIR)
}

export function loadBase64Key(base64Key: string): crypto.KeyObject | undefined {
  const privateKey = Buffer.from(base64Key, 'base64').toString('utf-8')
  const key = crypto.createPrivateKey(privateKey)
  if (isKeyEd25519(key)) {
    return key
  }
}

function isKeyEd25519(key: crypto.KeyObject): boolean {
  const jwk = key.export({ format: 'jwk' })
  return jwk.crv === 'Ed25519'
}
