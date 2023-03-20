import * as crypto from 'crypto'
import { RequestLike } from 'http-message-signatures'
import { verifyContentDigest } from 'httpbis-digest-headers'
import { importJWK } from 'jose'
import { JWK } from './jwk'

export function validateSignatureHeaders(request: RequestLike): boolean {
  const sig = request.headers['signature']
  const sigInput = request.headers['signature-input']

  if (
    !sig ||
    !sigInput ||
    typeof sig !== 'string' ||
    typeof sigInput !== 'string'
  )
    return false

  const sigInputComponents = getSigInputComponents(sigInput)

  return (
    !!sigInputComponents &&
    validateSigInputComponents(sigInputComponents, request)
  )
}

export async function validateSignature(
  clientKey: JWK,
  request: RequestLike
): Promise<boolean> {
  const sig = request.headers['signature'] as string
  const sigInput = request.headers['signature-input'] as string
  const challenge = sigInputToChallenge(sigInput, request)
  if (!challenge) {
    return false
  }

  const publicKey = (await importJWK({ ...clientKey })) as crypto.KeyLike
  const data = Buffer.from(challenge)
  return crypto.verify(
    null,
    data,
    publicKey,
    Buffer.from(sig.replace('sig1=', ''), 'base64')
  )
}

function sigInputToChallenge(
  sigInput: string,
  request: RequestLike
): string | null {
  const sigInputComponents = getSigInputComponents(sigInput)

  if (
    !sigInputComponents ||
    !validateSigInputComponents(sigInputComponents, request)
  )
    return null

  // https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures-09#section-2.3
  let signatureBase = ''
  for (const component of sigInputComponents) {
    if (component === '@method') {
      signatureBase += `"@method": ${request.method}\n`
    } else if (component === '@target-uri') {
      signatureBase += `"@target-uri": ${request.url}\n`
    } else {
      signatureBase += `"${component}": ${request.headers[component]}\n`
    }
  }

  signatureBase += `"@signature-params": ${(
    request.headers['signature-input'] as string
  )?.replace('sig1=', '')}`
  return signatureBase
}

function getSigInputComponents(sigInput: string): string[] | null {
  // https://datatracker.ietf.org/doc/html/rfc8941#section-4.1.1.1
  const messageComponents = sigInput
    .split('sig1=')[1]
    ?.split(';')[0]
    ?.split(' ')
  return messageComponents
    ? messageComponents.map((component) => component.replace(/[()"]/g, ''))
    : null
}

function validateSigInputComponents(
  sigInputComponents: string[],
  request: RequestLike
): boolean {
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol#section-7.3.1

  for (const component of sigInputComponents) {
    // https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures-09#section-2.1
    if (component !== component.toLowerCase()) return false
  }

  const isValidContentDigest =
    !sigInputComponents.includes('content-digest') ||
    (!!request.headers['content-digest'] &&
      !!request.headers['content-length'] &&
      !!request.headers['content-type'] &&
      request.body &&
      Object.keys(request.body).length > 0 &&
      sigInputComponents.includes('content-digest') &&
      verifyContentDigest(
        request.body,
        request.headers['content-digest'] as string
      ))

  return !(
    !isValidContentDigest ||
    !sigInputComponents.includes('@method') ||
    !sigInputComponents.includes('@target-uri') ||
    (request.headers['authorization'] &&
      !sigInputComponents.includes('authorization'))
  )
}
