import { type KeyLike } from 'crypto'
import { httpbis, createSigner, Request } from 'http-message-signatures'

export interface RequestLike extends Request {
  body?: string
}

export interface SignOptions {
  request: RequestLike
  privateKey: KeyLike
  keyId: string
}

export interface SignatureHeaders {
  Signature: string
  'Signature-Input': string
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

  const signingKey = createSigner(privateKey, 'ed25519', keyId)

  const { headers } = await httpbis.signMessage(
    {
      key: signingKey,
      name: 'sig1',
      params: ['keyid', 'created'],
      fields: components
    },
    {
      method: request.method,
      url: request.url,
      headers: request.headers
    }
  )

  return {
    Signature: headers['Signature'] as string,
    'Signature-Input': headers['Signature-Input'] as string
  }
}
