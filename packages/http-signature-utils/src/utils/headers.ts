import { createContentDigestHeader } from 'httpbis-digest-headers'
import {
  createSignatureHeaders,
  SignatureHeaders,
  SignOptions
} from './signatures'

interface ContentHeaders {
  'Content-Digest': string
  'Content-Length': string
  'Content-Type': string
}

export interface Headers extends SignatureHeaders, Partial<ContentHeaders> {}

const createContentHeaders = (body: string): ContentHeaders => {
  return {
    'Content-Digest': createContentDigestHeader(
      JSON.stringify(JSON.parse(body)),
      ['sha-512']
    ),
    'Content-Length': Buffer.from(body as string, 'utf-8').length.toString(),
    'Content-Type': 'application/json'
  }
}

export const createHeaders = async ({
  request,
  privateKey,
  keyId
}: SignOptions): Promise<Headers> => {
  const contentHeaders =
    request.body && createContentHeaders(request.body as string)

  if (contentHeaders) {
    request.headers = { ...request.headers, ...contentHeaders }
  }

  const signatureHeaders = await createSignatureHeaders({
    request,
    privateKey,
    keyId
  })

  return {
    ...contentHeaders,
    ...signatureHeaders
  }
}

const KEY_ID_PREFIX = 'keyid="'

export const getKeyId = (signatureInput: string): string | undefined => {
  const keyIdParam = signatureInput
    .split(';')
    .find((param) => param.startsWith(KEY_ID_PREFIX))
  // Trim prefix and quotes
  return keyIdParam?.slice(KEY_ID_PREFIX.length, -1)
}
