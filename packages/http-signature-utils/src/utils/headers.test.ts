import { getKeyId } from './headers'

describe('headers', (): void => {
  describe('getKeyId', (): void => {
    test('extracts key id from signature input', async (): Promise<void> => {
      const keyId = 'gnap-rsa'
      const sigInput = `sig1=("@method" "@target-uri" "authorization");created=1618884473;keyid="${keyId}";nonce="NAOEJF12ER2";tag="gnap"`
      expect(getKeyId(sigInput)).toEqual(keyId)
    })

    test('returns undefined for missing key id', async (): Promise<void> => {
      const sigInput =
        'sig1=("@method" "@target-uri" "authorization");created=1618884473;nonce="NAOEJF12ER2";tag="gnap"'
      expect(getKeyId(sigInput)).toBeUndefined()
    })

    test('returns undefined for invalid signature input', async (): Promise<void> => {
      const sigInput = 'invalid signature input'
      expect(getKeyId(sigInput)).toBeUndefined()
    })
  })
})
