import { sign, KeyLike, BinaryLike } from 'crypto'
import {
  httpis as httpsig,
  Algorithm,
  RequestLike,
  Signer
} from 'http-message-signatures'

export interface SignOptions {
  request: RequestLike
  privateKey: KeyLike
  keyId: string
}

export interface SignatureHeaders {
  Signature: string
  'Signature-Input': string
}

const createSigner = (privateKey: KeyLike): Signer => {
  const signer = async (data: BinaryLike) =>
    sign(null, data as Buffer, privateKey)
  signer.alg = 'ed25519' as Algorithm
  return signer
}

export const createSignatureHeaders = async ({
  request,
  privateKey,
  keyId
}: SignOptions): Promise<SignatureHeaders> => {
  const components = ['@method', '@target-uri']
  if (request.headers['Authorization'] || request.headers['authorization']) {
    components.push('authorization')
  }
  if (request.body) {
    components.push('content-digest', 'content-length', 'content-type')
  }
  const { headers } = await httpsig.sign(request, {
    components,
    parameters: {
      created: Math.floor(Date.now() / 1000)
    },
    keyId,
    signer: createSigner(privateKey),
    format: 'httpbis'
  })
  return {
    Signature: headers['Signature'] as string,
    'Signature-Input': headers['Signature-Input'] as string
  }
}
