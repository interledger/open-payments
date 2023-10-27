import * as crypto from 'crypto'
import * as fs from 'fs'

/**
 * Loads a EdDSA-Ed25519 private key.
 *
 * @param keyFilePath - The file path of the private key.
 * @returns The KeyObject of the loaded private key
 *
 */
export function loadKey(keyFilePath: string): crypto.KeyObject {
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

/**
 * Generates a EdDSA-Ed25519 private key, and saves it in the given directory.
 *
 * @param dir - The directory to use for saving the key
 * @returns The KeyObject that was generated
 *
 */
export function generateKey(dir: string): crypto.KeyObject {
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

/**
 * Loads a EdDSA-Ed25519 private key. If a path to the key was not provided,
 * or if there were any errors when trying to load the given key, a new key is generated and
 * saved in a file.
 *
 * @param keyFilePath - The file path of the private key.
 * @returns The KeyObject of the loaded or generated private key
 *
 */
export function loadOrGenerateKey(keyFilePath?: string): crypto.KeyObject {
  if (keyFilePath) {
    try {
      return loadKey(keyFilePath)
    } catch {
      /* Could not load key, generating new one */
    }
  }

  const TMP_DIR = './tmp'
  return generateKey(TMP_DIR)
}

/**
 * Loads a Base64 encoded EdDSA-Ed25519 private key.
 *
 * @param keyFilePath - The file path of the private key.
 * @returns the KeyObject of the loaded private key, or undefined if the key was not EdDSA-Ed25519
 *
 */
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
