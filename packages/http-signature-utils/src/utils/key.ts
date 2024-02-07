import * as fs from 'fs'
import { exportPKCS8, generateEd25519KeyPair } from './crypto'
import ASN1 from '@lapo/asn1js'
import { stringToUint8Array } from './helpers'

export function pemToUint8Array(pem: string): Uint8Array {
  const header = '-----BEGIN PRIVATE KEY-----'
  const footer = '-----END PRIVATE KEY-----'
  const body = pem.substring(header.length, pem.length - footer.length - 1)

  // TODO: utility function to use Buffer or btoa
  const key =
    typeof Buffer !== 'undefined'
      ? new Uint8Array(Buffer.from(body, 'base64'))
      : stringToUint8Array(atob(body))

  return key
}

/**
 * Loads a EdDSA-Ed25519 private key from a file.
 * - Node.js only
 *
 * @param keyFilePath - The file path of the private key.
 * @returns The KeyObject of the loaded private key
 *
 */
export function loadKey(keyFilePath: string): Uint8Array {
  let fileBuffer: string | undefined
  try {
    fileBuffer = fs.readFileSync(keyFilePath, 'utf-8')
  } catch (error) {
    throw new Error(`Could not load file: ${keyFilePath}`)
  }

  const key = pemToUint8Array(fileBuffer)

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
export function generateKey(args?: GenerateKeyArgs): Uint8Array {
  const keypair = generateEd25519KeyPair()
  if (args && args.dir) {
    if (!fs.existsSync(args.dir)) {
      fs.mkdirSync(args.dir)
    }
    fs.writeFileSync(
      `${args.dir}/${
        args.fileName || `private-key-${new Date().getTime()}`
      }.pem`,
      exportPKCS8(keypair.privateKey)
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
): Uint8Array {
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
export function loadBase64Key(base64Key: string): Uint8Array | undefined {
  const pem = Buffer.from(base64Key, 'base64').toString('utf-8').trim()

  const key = pemToUint8Array(pem)

  if (isKeyEd25519(key)) {
    return key
  }
}

export function isKeyEd25519(key: Uint8Array): boolean {
  // https://www.ibm.com/docs/en/linux-on-systems?topic=formats-ecc-key-token#l0wskc02_ecckt__ecc_edward_curves
  const OID = '1.3.101.112'
  const CURVE = 'curveEd25519'

  let pkcs8Sequence: ASN1

  try {
    pkcs8Sequence = ASN1.decode(key)
  } catch {
    return false
  }

  // Header length: 2
  // PKCS8 sequence length: 46
  if (pkcs8Sequence.length + pkcs8Sequence.header !== 48) return false
  if (!pkcs8Sequence.sub) return false
  // Sequence containing 3 elements (version, algorithm, and private key)
  if (pkcs8Sequence.sub.length !== 3) return false

  const [, algorithmSequence] = pkcs8Sequence.sub

  // Header length: 2
  // Algorithm length: 5
  if (algorithmSequence.length + algorithmSequence.header !== 7) return false
  // Sequence containing 1 element (algorithm identifier)
  if (!algorithmSequence.sub) throw new Error('Invalid algorithm sequence.')
  if (algorithmSequence.sub.length !== 1) return false

  const algorithm = algorithmSequence.sub[0].content()

  if (!algorithm) return false

  const [oid, curve] = algorithm.split('\n')

  if (oid !== OID || curve !== CURVE) return false

  return true
}
