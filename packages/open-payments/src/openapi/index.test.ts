import {
  getResourceServerOpenAPI,
  getAuthServerOpenAPI,
  getWalletAddressServerOpenAPI
} from '.'

describe('OpenAPI', (): void => {
  describe('getResourceServerOpenAPI', () => {
    test('properly generates API paths', async () => {
      const openApi = await getResourceServerOpenAPI()

      expect(openApi).toBeDefined()
      expect(Object.keys(openApi.paths)).toEqual(
        expect.arrayContaining([
          '/incoming-payments',
          '/outgoing-payments',
          '/quotes',
          '/incoming-payments/{id}',
          '/incoming-payments/{id}/complete',
          '/outgoing-payments/{id}',
          '/quotes/{id}'
        ])
      )
    })

    test('properly references $ref to external ./schemas.yaml', async () => {
      const openApi = await getResourceServerOpenAPI()

      expect(
        Object.keys(
          openApi.paths?.['/incoming-payments']?.['post']?.['requestBody']?.[
            'content'
          ]['application/json']['schema']['properties']['incomingAmount'][
            'properties'
          ]
        ).sort()
      ).toEqual(['assetCode', 'assetScale', 'value'].sort())
    })
  })

  describe('getAuthServerOpenAPI', () => {
    test('properly generates API paths', async () => {
      const openApi = await getAuthServerOpenAPI()

      expect(openApi).toBeDefined()
      expect(Object.keys(openApi.paths)).toEqual(
        expect.arrayContaining(['/', '/continue/{id}', '/token/{id}'])
      )
    })

    test('properly references $ref to external ./schemas.yaml', async () => {
      const openApi = await getAuthServerOpenAPI()

      expect(
        Object.keys(
          openApi.paths?.['/']?.['post']?.['requestBody']?.['content'][
            'application/json'
          ]['schema']['properties']['access_token']['properties']['access'][
            'items'
          ]['oneOf'][1]['properties']['limits']['anyOf'][1]['properties'][
            'debitAmount'
          ]['properties']
        ).sort()
      ).toEqual(['assetCode', 'assetScale', 'value'].sort())
    })
  })

  describe('getWalletAddressServerOpenAPI', () => {
    test('properly generates API paths', async () => {
      const openApi = await getWalletAddressServerOpenAPI()

      expect(openApi).toBeDefined()
      expect(Object.keys(openApi.paths)).toEqual(
        expect.arrayContaining(['/', '/jwks.json', '/did.json'])
      )
    })

    test('properly references $ref to external ./schemas.yaml', async () => {
      const openApi = await getWalletAddressServerOpenAPI()

      const getWalletAddressResponse =
        openApi.paths?.['/']?.['get']?.['responses']['200']['content'][
          'application/json'
        ]['schema']['properties']

      expect(getWalletAddressResponse['assetCode'].type).toBe('string')
      expect(getWalletAddressResponse['assetScale'].type).toBe('integer')
    })
  })
})
