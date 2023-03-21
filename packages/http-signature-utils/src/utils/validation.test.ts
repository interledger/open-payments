import { validateSignatureHeaders, validateSignature } from './validation'
import { createHeaders } from './headers'
import { RequestLike } from 'http-message-signatures'
import { TestKeys, generateTestKeys } from '../test-utils/keys'
import { createContentDigestHeader } from 'httpbis-digest-headers'

describe('Signature Verification', (): void => {
  let testKeys: TestKeys

  beforeEach((): void => {
    testKeys = generateTestKeys()
  })
  test.each`
    title                                 | withAuthorization | withRequestBody
    ${''}                                 | ${true}           | ${true}
    ${' without an authorization header'} | ${false}          | ${true}
    ${' without a request body'}          | ${true}           | ${false}
  `(
    'can validate signature headers and signature',
    async ({ withAuthorization, withRequestBody }): Promise<void> => {
      const testRequestBody = JSON.stringify({ foo: 'bar' })

      const headers = {}
      if (withAuthorization) {
        headers['authorization'] = 'GNAP test-access-token'
      }

      const request: RequestLike = {
        headers,
        method: 'GET',
        url: 'http://example.com/test'
      }
      if (withRequestBody) {
        request.body = testRequestBody
      }

      const contentAndSigHeaders = await createHeaders({
        request,
        privateKey: testKeys.privateKey,
        keyId: testKeys.publicKey.kid
      })
      const lowerHeaders = Object.fromEntries(
        Object.entries(contentAndSigHeaders).map(([k, v]) => [
          k.toLowerCase(),
          v
        ])
      )
      request.headers = { ...request.headers, ...lowerHeaders }

      expect(validateSignatureHeaders(request)).toEqual(true)
      await expect(
        validateSignature(testKeys.publicKey, request)
      ).resolves.toEqual(true)
    }
  )

  test.each`
    title                                                                               | sigInputHeader
    ${'fails if a component is not in lower case'}                                      | ${'sig1=("@METHOD" "@target-uri" "content-digest" "content-length" "content-type" "authorization");created=1618884473;keyid="gnap-key"'}
    ${'fails @method is missing'}                                                       | ${'sig1=("@target-uri" "content-digest" "content-length" "content-type");created=1618884473;keyid="gnap-key"'}
    ${'fails if @target-uri is missing'}                                                | ${'sig1=("@method" "content-digest" "content-length" "content-type");created=1618884473;keyid="gnap-key"'}
    ${'fails if @content-digest is missing while body is present'}                      | ${'sig1=("@method" "@target-uri" "content-length" "content-type");created=1618884473;keyid="gnap-key"'}
    ${'fails if authorization header is present in headers but not in signature input'} | ${'sig1=("@method" "@target-uri" "content-digest" "content-length" "content-type");created=1618884473;keyid="gnap-key"'}
  `(
    'validates signature header and $title',
    async ({ sigInputHeader }): Promise<void> => {
      const testRequestBody = JSON.stringify({ foo: 'bar' })
      const request = {
        headers: {
          'content-type': 'application/json',
          'content-digest': createContentDigestHeader(testRequestBody, [
            'sha-512'
          ]),
          'content-length': '1234',
          'signature-input': sigInputHeader,
          authorization: 'GNAP test-access-token'
        },
        method: 'GET',
        url: 'http://example.com/test',
        body: testRequestBody
      }
      expect(validateSignatureHeaders(request)).toBe(false)
    }
  )
})
