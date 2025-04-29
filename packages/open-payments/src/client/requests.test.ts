import {
  createHttpClient,
  deleteRequest,
  get,
  handleError,
  HttpClient,
  post,
  requestShouldBeAuthorized,
  signRequest
} from './requests'
import { generateKeyPairSync } from 'crypto'
import nock from 'nock'
import {
  createTestDeps,
  mockOpenApiResponseValidators,
  silentLogger
} from '../test/helpers'
import { OpenPaymentsClientError } from './error'
import assert from 'assert'
import ky, { HTTPError } from 'ky'
import { BaseDeps } from '.'

const HTTP_SIGNATURE_REGEX = /sig1=:([a-zA-Z0-9+/]){86}==:/
const CONTENT_DIGEST_REGEX = /sha-512=:([a-zA-Z0-9+/]){86}==:/

function getSignatureInputRegex(components: string[], keyId: string) {
  const defaultComponents = ['@method', '@target-uri']
  const allComponents = [...defaultComponents, ...components]

  return new RegExp(
    `sig1=\\(${allComponents
      .map((c) => `"${c}"`)
      .join(' ')}\\);keyid="${keyId}";created=[0-9]{10}`
  )
}

describe('requests', (): void => {
  const privateKey = generateKeyPairSync('ed25519').privateKey
  const keyId = 'myId'

  let httpClient: HttpClient
  let deps: BaseDeps

  beforeAll(async () => {
    httpClient = await createHttpClient({
      logger: silentLogger,
      requestTimeoutMs: 1000000,
      requestSigningArgs: {
        privateKey,
        keyId
      }
    })
    deps = await createTestDeps({
      httpClient
    })
  })

  describe('createHttpClient', (): void => {
    test('sets timeout properly', async (): Promise<void> => {
      const kyCreateSpy = jest.spyOn(ky, 'create')

      await createHttpClient({
        logger: silentLogger,
        requestTimeoutMs: 1000,
        requestSigningArgs: {
          privateKey,
          keyId
        }
      })

      expect(kyCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ timeout: 1000 })
      )
    })
    test('sets headers properly', async (): Promise<void> => {
      const kyCreateSpy = jest.spyOn(ky, 'create')

      await createHttpClient({
        logger: silentLogger,
        requestTimeoutMs: 1000,
        requestSigningArgs: {
          privateKey,
          keyId
        }
      })

      expect(kyCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        })
      )
    })

    test('sets private key request interceptor', async (): Promise<void> => {
      const kyInstance = ky.create({})

      jest.spyOn(ky, 'create').mockReturnValueOnce(kyInstance)

      const kyExtendSpy = jest.spyOn(kyInstance, 'extend')

      await createHttpClient({
        logger: silentLogger,
        requestTimeoutMs: 0,
        requestSigningArgs: {
          privateKey,
          keyId
        }
      })

      assert.ok(kyExtendSpy.mock.calls[0][0].hooks?.beforeRequest)
      expect(kyExtendSpy.mock.calls[0][0].hooks?.beforeRequest).toHaveLength(2)

      const requestSignerWithPrivateKey =
        kyExtendSpy.mock.calls[0][0].hooks.beforeRequest[1]

      const request = new Request('http://localhost:1000')

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(requestSignerWithPrivateKey(request, undefined!)).toBeDefined()
    })

    test('sets authenticated request interceptor', async (): Promise<void> => {
      const kyInstance = ky.create({})

      jest.spyOn(ky, 'create').mockReturnValueOnce(kyInstance)

      const kyExtendSpy = jest.spyOn(kyInstance, 'extend')

      const mockedAuthenticatedRequestInterceptor = jest.fn()

      await createHttpClient({
        logger: silentLogger,
        requestTimeoutMs: 0,
        requestSigningArgs: {
          authenticatedRequestInterceptor: mockedAuthenticatedRequestInterceptor
        }
      })

      assert.ok(kyExtendSpy.mock.calls[0][0].hooks?.beforeRequest)
      expect(kyExtendSpy.mock.calls[0][0].hooks?.beforeRequest).toHaveLength(2)

      const authenticatedRequestInterceptor =
        kyExtendSpy.mock.calls[0][0].hooks.beforeRequest[1]

      const request = new Request('http://localhost:1000', { method: 'POST' })

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      authenticatedRequestInterceptor(request, undefined!)

      expect(mockedAuthenticatedRequestInterceptor).toHaveBeenCalled()
    })
  })

  describe('get', (): void => {
    const baseUrl = 'http://localhost:1000'
    const responseValidators = mockOpenApiResponseValidators()

    beforeAll(() => {
      jest.spyOn(httpClient, 'get')
    })

    test('sets headers properly if accessToken provided', async (): Promise<void> => {
      const scope = nock(baseUrl)
        .matchHeader('Signature', HTTP_SIGNATURE_REGEX)
        .matchHeader(
          'Signature-Input',
          getSignatureInputRegex(['authorization'], keyId)
        )
        .get('/incoming-payments')
        .reply(200, { id: 'id' })

      await get(
        deps,
        {
          url: `${baseUrl}/incoming-payments`,
          accessToken: 'accessToken'
        },
        responseValidators.successfulValidator
      )

      scope.done()

      expect(httpClient.get).toHaveBeenCalledWith(
        `${baseUrl}/incoming-payments`,
        {
          headers: {
            Authorization: 'GNAP accessToken'
          }
        }
      )
    })

    test('sets headers properly if accessToken is not provided', async (): Promise<void> => {
      const scope = nock(baseUrl)
        .matchHeader('Signature', (sig) => sig === undefined)
        .matchHeader('Signature-Input', (sigInput) => sigInput === undefined)
        .get('/incoming-payments')
        .reply(200, { id: 'id' })

      await get(
        deps,
        {
          url: `${baseUrl}/incoming-payments`
        },
        responseValidators.successfulValidator
      )
      scope.done()

      expect(httpClient.get).toHaveBeenCalledWith(
        `${baseUrl}/incoming-payments`,
        {
          headers: {}
        }
      )
    })

    test.each`
      title                      | queryParams
      ${'all defined values'}    | ${{ first: 5, cursor: 'id' }}
      ${'some undefined values'} | ${{ first: 5, cursor: undefined }}
      ${'all undefined values'}  | ${{ first: undefined, cursor: undefined }}
    `(
      'properly sets query params with $title',
      async ({ queryParams }): Promise<void> => {
        const cleanedQueryParams = Object.fromEntries(
          Object.entries(queryParams).filter(([_, v]) => v != null)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any

        const scope = nock(baseUrl)
          .matchHeader('Signature', (sig) => sig === undefined)
          .matchHeader('Signature-Input', (sigInput) => sigInput === undefined)
          .get('/incoming-payments')
          .query(cleanedQueryParams)
          .reply(200, { id: 'id' })

        await get(
          deps,
          {
            url: `${baseUrl}/incoming-payments`,
            queryParams
          },
          responseValidators.successfulValidator
        )
        scope.done()

        const expectedUrl =
          Object.values(cleanedQueryParams).length > 0
            ? `${baseUrl}/incoming-payments?${new URLSearchParams(
                cleanedQueryParams
              )}`
            : `${baseUrl}/incoming-payments`

        expect(httpClient.get).toHaveBeenCalledWith(expectedUrl, {
          headers: {}
        })
      }
    )

    test('calls validator function properly', async (): Promise<void> => {
      const status = 200
      const body = {
        id: 'id'
      }

      nock(baseUrl).get('/incoming-payments').reply(status, body)

      const responseValidatorSpy = jest.spyOn(
        responseValidators,
        'successfulValidator'
      )

      await get(
        deps,
        {
          url: `${baseUrl}/incoming-payments`
        },
        responseValidators.successfulValidator
      )

      expect(responseValidatorSpy).toHaveBeenCalledWith({
        body,
        status
      })
    })

    test('throws if failed request', async (): Promise<void> => {
      nock(baseUrl).get('/incoming-payments').reply(400)

      expect.assertions(4)

      try {
        await get(
          deps,
          {
            url: `${baseUrl}/incoming-payments`
          },
          responseValidators.successfulValidator
        )
      } catch (error) {
        assert.ok(error instanceof OpenPaymentsClientError)
        expect(error.message).toBe('Error making Open Payments GET request')
        expect(error.description).toMatch(/Bad Request/)
        expect(error.status).toBe(400)
        expect(error.validationErrors).toBeUndefined()
      }
    })

    test('throws if response validator function fails', async (): Promise<void> => {
      nock(baseUrl).get('/incoming-payments').reply(200, { id: 'id' })

      expect.assertions(4)

      try {
        await get(
          deps,
          {
            url: `${baseUrl}/incoming-payments`
          },
          responseValidators.failedValidator
        )
      } catch (error) {
        assert.ok(error instanceof OpenPaymentsClientError)
        expect(error.message).toBe('Error making Open Payments GET request')
        expect(error.description).toBe('Could not validate OpenAPI response')
        expect(error.status).toBeUndefined()
        expect(error.validationErrors).toEqual(['Failed to validate response'])
      }
    })

    test('keeps https protocol for request if non-development environment', async (): Promise<void> => {
      const httpsUrl = 'https://localhost:1000/'
      const scope = nock(httpsUrl).get('/').reply(200, { id: 'id' })

      await get(deps, { url: httpsUrl }, responseValidators.successfulValidator)

      expect(httpClient.get).toHaveBeenCalledWith(httpsUrl, {
        headers: {}
      })
      scope.done()
    })

    test('uses http protocol for request if development environment', async (): Promise<void> => {
      const tmpDeps = await createTestDeps({
        httpClient: httpClient,
        useHttp: true
      })
      const httpsUrl = 'https://localhost:1000/'
      const httpUrl = httpsUrl.replace('https', 'http')
      const scope = nock(httpUrl).get('/').reply(200, { id: 'id' })

      await get(
        tmpDeps,
        { url: httpsUrl },
        responseValidators.successfulValidator
      )

      expect(httpClient.get).toHaveBeenCalledWith(httpUrl, {
        json: undefined,
        headers: {}
      })
      scope.done()
    })
  })

  describe('post', (): void => {
    const baseUrl = 'http://localhost:1000'
    const responseValidators = mockOpenApiResponseValidators()

    beforeAll(() => {
      jest.spyOn(httpClient, 'post')
    })

    test('properly POSTs request', async (): Promise<void> => {
      const status = 200
      const body = {
        id: 'id'
      }

      const scope = nock(baseUrl)
        .matchHeader('Signature', HTTP_SIGNATURE_REGEX)
        .matchHeader(
          'Signature-Input',
          getSignatureInputRegex(
            ['content-digest', 'content-length', 'content-type'],
            keyId
          )
        )
        .matchHeader('Accept', 'application/json')
        .matchHeader('Content-Digest', CONTENT_DIGEST_REGEX)
        .matchHeader('Content-Length', '11')
        .matchHeader('Content-Type', 'application/json')
        .post('/grant', body)
        .reply(status, body)

      await post(
        deps,
        {
          url: `${baseUrl}/grant`,
          body
        },
        responseValidators.successfulValidator
      )
      scope.done()

      expect(httpClient.post).toHaveBeenCalledWith(`${baseUrl}/grant`, {
        headers: {},
        json: body
      })
    })

    test('properly POSTs request with accessToken', async (): Promise<void> => {
      const status = 200
      const body = {
        id: 'id'
      }
      const accessToken = 'someAccessToken'

      const scope = nock(baseUrl)
        .matchHeader('Signature', HTTP_SIGNATURE_REGEX)
        .matchHeader(
          'Signature-Input',
          getSignatureInputRegex(
            [
              'authorization',
              'content-digest',
              'content-length',
              'content-type'
            ],
            keyId
          )
        )
        .matchHeader('Accept', 'application/json')
        .matchHeader('Authorization', `GNAP ${accessToken}`)
        .matchHeader('Content-Digest', CONTENT_DIGEST_REGEX)
        .matchHeader('Content-Length', '11')
        .matchHeader('Content-Type', 'application/json')
        .post('/grant', body)
        // TODO: verify signature
        .reply(status, body)

      await post(
        deps,
        {
          url: `${baseUrl}/grant`,
          body,
          accessToken
        },
        responseValidators.successfulValidator
      )
      scope.done()

      expect(httpClient.post).toHaveBeenCalledWith(`${baseUrl}/grant`, {
        headers: { Authorization: `GNAP ${accessToken}` },
        json: body
      })
    })

    test('calls validator function properly', async (): Promise<void> => {
      const status = 201
      const body = {
        id: 'id'
      }

      nock(baseUrl).post('/grant', body).reply(status, body)

      const responseValidatorSpy = jest.spyOn(
        responseValidators,
        'successfulValidator'
      )

      await post(
        deps,
        {
          url: `${baseUrl}/grant`,
          body
        },
        responseValidators.successfulValidator
      )

      expect(responseValidatorSpy).toHaveBeenCalledWith({
        body,
        status
      })
    })

    test('throws if failed request', async (): Promise<void> => {
      const body = {
        id: 'id'
      }
      nock(baseUrl).post('/grant', body).reply(400, 'Bad Request')

      expect.assertions(4)

      try {
        await post(
          deps,
          {
            url: `${baseUrl}/grant`,
            body
          },
          responseValidators.successfulValidator
        )
      } catch (error) {
        assert.ok(error instanceof OpenPaymentsClientError)
        expect(error.message).toBe('Error making Open Payments POST request')
        expect(error.description).toMatch(/Bad Request/)
        expect(error.status).toBe(400)
        expect(error.validationErrors).toBeUndefined()
      }
    })

    test('throws if response validator function fails', async (): Promise<void> => {
      const status = 200
      const body = {
        id: 'id'
      }
      nock(baseUrl).post('/grant', body).reply(status, body)

      expect.assertions(4)

      try {
        await post(
          deps,
          {
            url: `${baseUrl}/grant`,
            body
          },
          responseValidators.failedValidator
        )
      } catch (error) {
        assert.ok(error instanceof OpenPaymentsClientError)
        expect(error.message).toBe('Error making Open Payments POST request')
        expect(error.description).toBe('Could not validate OpenAPI response')
        expect(error.status).toBeUndefined()
        expect(error.validationErrors).toEqual(['Failed to validate response'])
      }
    })

    test('keeps https protocol for request if non-development environment', async (): Promise<void> => {
      const httpsUrl = 'https://localhost:1000/'
      const scope = nock(httpsUrl).post('/').reply(200, { id: 'id' })

      await post(
        deps,
        { url: httpsUrl },
        responseValidators.successfulValidator
      )

      expect(httpClient.post).toHaveBeenCalledWith(httpsUrl, {
        json: undefined,
        headers: {}
      })
      scope.done()
    })

    test('uses http protocol for request if development environment', async (): Promise<void> => {
      const tmpDeps = await createTestDeps({
        httpClient,
        useHttp: true
      })
      const httpsUrl = 'https://localhost:1000/'
      const httpUrl = httpsUrl.replace('https', 'http')
      const scope = nock(httpUrl).post('/').reply(200, { id: 'id' })

      await post(
        tmpDeps,
        { url: httpsUrl },
        responseValidators.successfulValidator
      )

      expect(httpClient.post).toHaveBeenCalledWith(httpUrl, {
        json: undefined,
        headers: {}
      })
      scope.done()
    })
  })

  describe('delete', (): void => {
    const baseUrl = 'http://localhost:1000'
    const responseValidators = mockOpenApiResponseValidators()

    beforeAll(() => {
      jest.spyOn(httpClient, 'delete')
    })

    test('properly makes DELETE request', async (): Promise<void> => {
      const status = 204

      const scope = nock(baseUrl)
        .delete(`/grant`)
        // TODO: verify signature
        .reply(status)

      const responseValidatorSpy = jest.spyOn(
        responseValidators,
        'successfulValidator'
      )

      await deleteRequest(
        deps,
        {
          url: `${baseUrl}/grant`
        },
        responseValidators.successfulValidator
      )
      scope.done()

      expect(httpClient.delete).toHaveBeenCalledWith(`${baseUrl}/grant`, {
        headers: {}
      })
      expect(responseValidatorSpy).toHaveBeenCalledWith({
        status,
        body: undefined
      })
    })

    test('properly makes DELETE request with accessToken', async (): Promise<void> => {
      const status = 204
      const accessToken = 'someAccessToken'

      const scope = nock(baseUrl)
        .matchHeader('Signature', HTTP_SIGNATURE_REGEX)
        .matchHeader(
          'Signature-Input',
          getSignatureInputRegex(['authorization'], keyId)
        )
        .matchHeader('Authorization', `GNAP ${accessToken}`)
        .delete(`/grant/`)
        // TODO: verify signature
        .reply(status)

      await deleteRequest(
        deps,
        {
          url: `${baseUrl}/grant/`,
          accessToken
        },
        responseValidators.successfulValidator
      )
      scope.done()

      expect(httpClient.delete).toHaveBeenCalledWith(`${baseUrl}/grant/`, {
        headers: {
          Authorization: `GNAP ${accessToken}`
        }
      })
    })

    test('calls validator function properly', async (): Promise<void> => {
      const status = 204

      const scope = nock(baseUrl).delete(`/grant`).reply(status)

      const responseValidatorSpy = jest.spyOn(
        responseValidators,
        'successfulValidator'
      )

      await deleteRequest(
        deps,
        {
          url: `${baseUrl}/grant`
        },
        responseValidators.successfulValidator
      )

      scope.done()
      expect(responseValidatorSpy).toHaveBeenCalledWith({
        body: undefined,
        status
      })
    })

    test('throws if failed request', async (): Promise<void> => {
      nock(baseUrl).delete('/grant').reply(400, 'Bad Request')

      expect.assertions(4)

      try {
        await deleteRequest(
          deps,
          {
            url: `${baseUrl}/grant`
          },
          responseValidators.successfulValidator
        )
      } catch (error) {
        assert.ok(error instanceof OpenPaymentsClientError)
        expect(error.message).toBe('Error making Open Payments DELETE request')
        expect(error.description).toMatch(/Bad Request/)
        expect(error.status).toBe(400)
        expect(error.validationErrors).toBeUndefined()
      }
    })

    test('throws if response validator function fails', async (): Promise<void> => {
      const status = 299
      nock(baseUrl).delete('/grant').reply(status)

      expect.assertions(4)

      try {
        await deleteRequest(
          deps,
          {
            url: `${baseUrl}/grant`
          },
          responseValidators.failedValidator
        )
      } catch (error) {
        assert.ok(error instanceof OpenPaymentsClientError)
        expect(error.message).toBe('Error making Open Payments DELETE request')
        expect(error.description).toBe('Could not validate OpenAPI response')
        expect(error.status).toBeUndefined()
        expect(error.validationErrors).toEqual(['Failed to validate response'])
      }
    })

    test('keeps https protocol for request if non-development environment', async (): Promise<void> => {
      const httpsUrl = 'https://localhost:1000/'
      const scope = nock(httpsUrl).delete('/').reply(200)

      await deleteRequest(
        deps,
        { url: httpsUrl },
        responseValidators.successfulValidator
      )

      expect(httpClient.delete).toHaveBeenCalledWith(httpsUrl, {
        headers: {}
      })
      scope.done()
    })

    test('uses http protocol for request if development environment', async (): Promise<void> => {
      const tmpDeps = await createTestDeps({
        httpClient,
        useHttp: true
      })
      const httpsUrl = 'https://localhost:1000/'
      const httpUrl = httpsUrl.replace('https', 'http')
      const scope = nock(httpUrl).delete('/').reply(200)

      await deleteRequest(
        tmpDeps,
        { url: httpsUrl },
        responseValidators.successfulValidator
      )

      expect(httpClient.delete).toHaveBeenCalledWith(httpUrl, {
        headers: {}
      })
      scope.done()
    })
  })

  describe('requestShouldBeAuthorized', (): void => {
    test.each`
      method    | hasAuthorizationHeader | expectedResult | description
      ${'GET'}  | ${true}                | ${true}        | ${'should be authorized if it has an authorization header'}
      ${'GET'}  | ${false}               | ${false}       | ${'should not be authorized if it not POST and does not have an authorization header'}
      ${'POST'} | ${false}               | ${true}        | ${'should be authorized if it is POST without an authorization header'}
      ${'POST'} | ${true}                | ${true}        | ${'should be authorized if it is POST and with an authorization header'}
    `(
      'request $description',
      ({ method, hasAuthorizationHeader, expectedResult }): void => {
        const request = new Request('https://localhost:1000/', { method })

        if (hasAuthorizationHeader) {
          request.headers.set('Authorization', 'someToken')
        }

        expect(requestShouldBeAuthorized(request)).toBe(expectedResult)
      }
    )
  })

  describe('signRequest', (): void => {
    test('does not set headers if keyId is not provided', async () => {
      const request = new Request('https://localhost:1000/', { method: 'POST' })
      const signedRequest = await signRequest(request, {
        privateKey,
        keyId: undefined
      })

      expect(signedRequest).toBeDefined()
      expect([...signedRequest.headers.entries()]).toEqual([
        ...request.headers.entries()
      ])
    })

    test('does not set headers if privateKey is not provided', async () => {
      const request = new Request('https://localhost:1000/', { method: 'POST' })
      const signedRequest = await signRequest(request, {
        keyId,
        privateKey: undefined
      })

      expect(signedRequest).toBeDefined()
      expect([...signedRequest.headers.entries()]).toEqual([
        ...request.headers.entries()
      ])
    })

    test('sets signature headers', async () => {
      const request = new Request('https://localhost:1000/', {
        method: 'POST'
      })
      const signedRequest = await signRequest(request, {
        keyId,
        privateKey
      })

      expect(signedRequest.headers.get('Signature')).toMatch(
        HTTP_SIGNATURE_REGEX
      )
      expect(signedRequest.headers.get('Signature-Input')).toMatch(
        getSignatureInputRegex([], keyId)
      )
      expect(signedRequest.headers.get('Content-Digest')).toBeNull()
      expect(signedRequest.headers.get('Content-Type')).toBeNull()
      expect(signedRequest.headers.get('Content-Length')).toBeNull()
    })

    test('sets signature headers with request body', async () => {
      const body = {
        foo: 'bar'
      }
      const stringifiedBody = JSON.stringify(body)

      const request = new Request('https://localhost:1000/', {
        method: 'POST',
        body: stringifiedBody
      })
      const signedRequest = await signRequest(request, {
        keyId,
        privateKey
      })

      expect(signedRequest.headers.get('Signature')).toMatch(
        HTTP_SIGNATURE_REGEX
      )
      expect(signedRequest.headers.get('Signature-Input')).toMatch(
        getSignatureInputRegex(
          ['content-digest', 'content-length', 'content-type'],
          keyId
        )
      )
      expect(signedRequest.headers.get('Content-Digest')).toMatch(
        CONTENT_DIGEST_REGEX
      )
      expect(signedRequest.headers.get('Content-Type')).toBe('application/json')
      expect(signedRequest.headers.get('Content-Length')).toBe(
        stringifiedBody.length.toString()
      )
    })
  })

  describe('handleError', (): void => {
    test('handles HTTP error with expected JSON response', async (): Promise<void> => {
      const url = 'https://localhost:1000/'
      const request = new Request(url)
      const response = new Response(
        JSON.stringify({
          error: {
            code: 'invalid_client',
            description: 'Could not determine client'
          }
        }),
        { status: 400 }
      )

      expect.assertions(5)
      try {
        await handleError(deps, {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          error: new HTTPError(response, request, undefined!),
          requestType: 'POST',
          url
        })
      } catch (error) {
        assert.ok(error instanceof OpenPaymentsClientError)
        expect(error.message).toBe('Error making Open Payments POST request')
        expect(error.description).toBe('Could not determine client')
        expect(error.code).toBe('invalid_client')
        expect(error.status).toBe(400)
        expect(error.validationErrors).toBeUndefined()
      }
    })

    test('handles HTTP error with expected JSON response with details', async (): Promise<void> => {
      const url = 'https://localhost:1000/'
      const request = new Request(url)
      const errDetails = {
        foo: 'bar',
        someObj: {
          anyKey: 'anyValue'
        }
      }
      const response = new Response(
        JSON.stringify({
          error: {
            code: 'invalid_client',
            description: 'Could not determine client',
            details: errDetails
          }
        }),
        { status: 400 }
      )

      expect.assertions(6)
      try {
        await handleError(deps, {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          error: new HTTPError(response, request, undefined!),
          requestType: 'POST',
          url
        })
      } catch (error) {
        assert.ok(error instanceof OpenPaymentsClientError)
        expect(error.message).toBe('Error making Open Payments POST request')
        expect(error.description).toBe('Could not determine client')
        expect(error.code).toBe('invalid_client')
        expect(error.status).toBe(400)
        expect(error.details).toMatchObject(errDetails)
        expect(error.validationErrors).toBeUndefined()
      }
    })

    test('handles HTTP error with unexpected JSON response', async (): Promise<void> => {
      const url = 'https://localhost:1000/'
      const request = new Request(url)
      const responseBody = {
        unexpected: 'response'
      }
      const response = new Response(JSON.stringify(responseBody), {
        status: 400
      })

      expect.assertions(5)
      try {
        await handleError(deps, {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          error: new HTTPError(response, request, undefined!),
          requestType: 'POST',
          url
        })
      } catch (error) {
        assert.ok(error instanceof OpenPaymentsClientError)
        expect(error.message).toBe('Error making Open Payments POST request')
        expect(error.description).toBe(JSON.stringify(responseBody))
        expect(error.code).toBeUndefined()
        expect(error.status).toBe(400)
        expect(error.validationErrors).toBeUndefined()
      }
    })

    test('handles HTTP error with text response', async (): Promise<void> => {
      const url = 'https://localhost:1000/'
      const request = new Request(url)
      const response = new Response('Bad Request', { status: 400 })

      expect.assertions(5)
      try {
        await handleError(deps, {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          error: new HTTPError(response, request, undefined!),
          requestType: 'POST',
          url
        })
      } catch (error) {
        assert.ok(error instanceof OpenPaymentsClientError)
        expect(error.message).toBe('Error making Open Payments POST request')
        expect(error.description).toBe('Bad Request')
        expect(error.code).toBeUndefined()
        expect(error.status).toBe(400)
        expect(error.validationErrors).toBeUndefined()
      }
    })

    test('handles validation error', async (): Promise<void> => {
      const url = 'https://localhost:1000/'

      expect.assertions(5)
      try {
        await handleError(deps, {
          error: {
            status: 400,
            errors: [{ message: 'invalid request' }]
          },
          requestType: 'POST',
          url
        })
      } catch (error) {
        assert.ok(error instanceof OpenPaymentsClientError)
        expect(error.message).toBe('Error making Open Payments POST request')
        expect(error.description).toBe('Could not validate OpenAPI response')
        expect(error.code).toBeUndefined()
        expect(error.status).toBe(400)
        expect(error.validationErrors).toEqual(['invalid request'])
      }
    })

    test('handles ordinary error', async (): Promise<void> => {
      const url = 'https://localhost:1000/'

      expect.assertions(5)
      try {
        await handleError(deps, {
          error: new Error('Something went wrong'),
          requestType: 'POST',
          url
        })
      } catch (error) {
        assert.ok(error instanceof OpenPaymentsClientError)
        expect(error.message).toBe('Error making Open Payments POST request')
        expect(error.description).toBe('Something went wrong')
        expect(error.code).toBeUndefined()
        expect(error.status).toBeUndefined()
        expect(error.validationErrors).toBeUndefined()
      }
    })

    test('handles unexpected (non-object) error', async (): Promise<void> => {
      const url = 'https://localhost:1000/'

      expect.assertions(5)
      try {
        await handleError(deps, {
          error: 'unexpected error',
          requestType: 'POST',
          url
        })
      } catch (error) {
        assert.ok(error instanceof OpenPaymentsClientError)
        expect(error.message).toBe('Error making Open Payments POST request')
        expect(error.description).toBe('Received unexpected error')
        expect(error.code).toBeUndefined()
        expect(error.status).toBeUndefined()
        expect(error.validationErrors).toBeUndefined()
      }
    })
  })
})
