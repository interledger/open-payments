import { generateTestKeys, TestKeys } from '../test-utils/keys'
import { createSignatureHeaders, RequestLike } from './signatures'

describe('Signature Generation', (): void => {
  let testKeys: TestKeys

  beforeEach((): void => {
    testKeys = generateTestKeys()
  })

  test('ensure that the signature input header contains the correct parameters', async (): Promise<void> => {
    const request: RequestLike = {
      headers: {},
      method: 'GET',
      url: 'http://example.com/test'
    }

    const signatureHeaders = await createSignatureHeaders({
      request,
      privateKey: testKeys.privateKey,
      keyId: testKeys.publicKey.kid
    })

    const signatureParameters = signatureHeaders['Signature-Input']
      .split(';')
      .splice(1, 3)
      .map((param) => {
        const [key] = param.split('=')
        return key
      })

    expect(signatureParameters).toContain('keyid')
    expect(signatureParameters).toContain('created')
  })
})
