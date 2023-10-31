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

interface GenerateKeyArgs {
  /** The directory where to save the key */
  dir?: string
  /** The fileName of the saved key, without the file extension. `args.dir` must be provided for the fileName to register. */
  fileName?: string
}

/**
 * Generates a EdDSA-Ed25519 private key, and optionally saves it in the given directory.
 *
 * @param args - The arguments used to specify where to optionally save the generated key
 * @returns The KeyObject that was generated
 *
 */
export function generateKey(args?: GenerateKeyArgs): crypto.KeyObject {
  const keypair = crypto.generateKeyPairSync('ed25519')
  if (args && args.dir) {
    if (!fs.existsSync(args.dir)) {
      fs.mkdirSync(args.dir)
    }
    fs.writeFileSync(
      `${args.dir}/${
        args.fileName || `private-key-${new Date().getTime()}`
      }.pem`,
      keypair.privateKey.export({ format: 'pem', type: 'pkcs8' })
    )
  }
  return keypair.privateKey
}

/**
 * Loads a EdDSA-Ed25519 private key. If a path to the key was not provided,
 * or if there were any errors when trying to load the given key, a new key is generated and
 * optionally saved in a file.
 *
 * @param keyFilePath - The file path of the private key.
 * @param generateKeyArgs - The arguments used to specify where to optionally save the generated key
 * @returns The KeyObject of the loaded or generated private key
 *
 */
export function loadOrGenerateKey(
  keyFilePath?: string,
  generateKeyArgs?: GenerateKeyArgs
): crypto.KeyObject {
  if (keyFilePath) {
    try {
      return loadKey(keyFilePath)
    } catch {
      /* Could not load key, generating new one */
    }
  }

  return generateKey(generateKeyArgs)
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
