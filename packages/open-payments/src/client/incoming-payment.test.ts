import {
  completeIncomingPayment,
  createIncomingPayment,
  createIncomingPaymentRoutes,
  listIncomingPayment,
  getIncomingPayment,
  validateCompletedIncomingPayment,
  validateCreatedIncomingPayment,
  validateIncomingPayment
} from './incoming-payment'
import { OpenAPI, HttpMethod, createOpenAPI } from '@interledger/openapi'
import {
  defaultAxiosInstance,
  mockIncomingPayment,
  mockIncomingPaymentPaginationResult,
  mockOpenApiResponseValidators,
  silentLogger
} from '../test/helpers'
import nock from 'nock'
import path from 'path'
import { v4 as uuid } from 'uuid'
import * as requestors from './requests'
import { getRSPath } from '../types'

jest.mock('./requests', () => {
  return {
    // https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options
    __esModule: true,
    ...jest.requireActual('./requests')
  }
})

describe('incoming-payment', (): void => {
  let openApi: OpenAPI

  beforeAll(async () => {
    openApi = await createOpenAPI(
      path.resolve(__dirname, '../openapi/resource-server.yaml')
    )
  })

  const axiosInstance = defaultAxiosInstance
  const logger = silentLogger
  const walletAddress = 'http://localhost:1000/alice/.well-known/pay'
  const serverAddress = 'http://localhost:1000'
  const accessToken = 'accessToken'
  const openApiValidators = mockOpenApiResponseValidators()

  describe('getIncomingPayment', (): void => {
    test('returns incoming payment if passes validation', async (): Promise<void> => {
      const incomingPayment = mockIncomingPayment()

      nock(walletAddress)
        .get('/incoming-payments/1')
        .reply(200, incomingPayment)

      const result = await getIncomingPayment(
        { axiosInstance, logger },
        {
          url: `${walletAddress}/incoming-payments/1`,
          accessToken
        },
        openApiValidators.successfulValidator
      )
      expect(result).toStrictEqual(incomingPayment)
    })

    test('throws if incoming payment does not pass validation', async (): Promise<void> => {
      const incomingPayment = mockIncomingPayment({
        incomingAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '5'
        },
        receivedAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '10'
        }
      })

      nock(walletAddress)
        .get('/incoming-payments/1')
        .reply(200, incomingPayment)

      await expect(
        getIncomingPayment(
          {
            axiosInstance,
            logger
          },
          {
            url: `${walletAddress}/incoming-payments/1`,
            accessToken
          },
          openApiValidators.successfulValidator
        )
      ).rejects.toThrowError()
    })

    test('throws if incoming payment does not pass open api validation', async (): Promise<void> => {
      const incomingPayment = mockIncomingPayment()

      nock(walletAddress)
        .get('/incoming-payments/1')
        .reply(200, incomingPayment)

      await expect(
        getIncomingPayment(
          {
            axiosInstance,
            logger
          },
          {
            url: `${walletAddress}/incoming-payments/1`,
            accessToken
          },
          openApiValidators.failedValidator
        )
      ).rejects.toThrowError()
    })
  })

  describe('createIncomingPayment', (): void => {
    test.each`
      incomingAmount                                      | expiresAt                                      | metadata
      ${undefined}                                        | ${undefined}                                   | ${undefined}
      ${{ assetCode: 'USD', assetScale: 2, value: '10' }} | ${new Date(Date.now() + 60_000).toISOString()} | ${{ description: 'Invoice', externalRef: '#INV-1' }}
    `(
      'returns the incoming payment on success',
      async ({ incomingAmount, expiresAt, metadata }): Promise<void> => {
        const incomingPayment = mockIncomingPayment({
          incomingAmount,
          expiresAt,
          metadata
        })

        const scope = nock(walletAddress)
          .post('/incoming-payments')
          .reply(200, incomingPayment)

        const result = await createIncomingPayment(
          { axiosInstance, logger },
          { walletAddress, accessToken },
          openApiValidators.successfulValidator,
          {
            incomingAmount,
            expiresAt,
            metadata
          }
        )

        scope.done()
        expect(result).toEqual(incomingPayment)
      }
    )

    test('throws if the created incoming payment does not pass validation', async (): Promise<void> => {
      const amount = {
        assetCode: 'USD',
        assetScale: 2,
        value: '10'
      }

      const incomingPayment = mockIncomingPayment({
        incomingAmount: amount,
        receivedAmount: amount,
        completed: false
      })

      const scope = nock(walletAddress)
        .post('/incoming-payments')
        .reply(200, incomingPayment)

      await expect(
        createIncomingPayment(
          { axiosInstance, logger },
          { walletAddress, accessToken },
          openApiValidators.successfulValidator,
          {}
        )
      ).rejects.toThrowError()
      scope.done()
    })

    test('throws if the created incoming payment does not pass open api validation', async (): Promise<void> => {
      const incomingPayment = mockIncomingPayment()

      const scope = nock(walletAddress)
        .post('/incoming-payments')
        .reply(200, incomingPayment)

      await expect(
        createIncomingPayment(
          { axiosInstance, logger },
          { walletAddress, accessToken },
          openApiValidators.failedValidator,
          {}
        )
      ).rejects.toThrowError()
      scope.done()
    })
  })

  describe('completeIncomingPayment', (): void => {
    test('returns incoming payment if it is successfully completed', async (): Promise<void> => {
      const incomingPayment = mockIncomingPayment({
        completed: true
      })

      const scope = nock(serverAddress)
        .post(`/incoming-payments/${incomingPayment.id}/complete`)
        .reply(200, incomingPayment)

      const result = await completeIncomingPayment(
        { axiosInstance, logger },
        {
          url: `${serverAddress}/incoming-payments/${incomingPayment.id}`,
          accessToken
        },
        openApiValidators.successfulValidator
      )

      scope.done()

      expect(result).toStrictEqual(incomingPayment)
    })

    test('throws if the incoming payment does not pass validation', async (): Promise<void> => {
      const incomingPayment = mockIncomingPayment({
        completed: false
      })

      const scope = nock(walletAddress)
        .post(`/incoming-payments/${incomingPayment.id}/complete`)
        .reply(200, incomingPayment)

      await expect(
        completeIncomingPayment(
          { axiosInstance, logger },
          {
            url: `${walletAddress}/incoming-payments/${incomingPayment.id}`,
            accessToken
          },
          openApiValidators.successfulValidator
        )
      ).rejects.toThrowError()

      scope.done()
    })

    test('throws if the incoming payment does not pass open api validation', async (): Promise<void> => {
      const incomingPayment = mockIncomingPayment({
        completed: true
      })

      const scope = nock(walletAddress)
        .post(`/incoming-payments/${incomingPayment.id}/complete`)
        .reply(200, incomingPayment)

      await expect(
        completeIncomingPayment(
          { axiosInstance, logger },
          {
            url: `${walletAddress}/incoming-payments/${incomingPayment.id}`,
            accessToken
          },
          openApiValidators.failedValidator
        )
      ).rejects.toThrowError()

      scope.done()
    })
  })

  describe('listIncomingPayment', (): void => {
    describe('forward pagination', (): void => {
      test.each`
        first        | cursor
        ${undefined} | ${undefined}
        ${1}         | ${undefined}
        ${5}         | ${uuid()}
      `(
        'returns incoming payments list',
        async ({ first, cursor }): Promise<void> => {
          const incomingPaymentPaginationResult =
            mockIncomingPaymentPaginationResult({
              result: Array(first).fill(mockIncomingPayment())
            })

          const scope = nock(walletAddress)
            .get('/incoming-payments')
            .query({
              ...(first ? { first } : {}),
              ...(cursor ? { cursor } : {})
            })
            .reply(200, incomingPaymentPaginationResult)

          const result = await listIncomingPayment(
            {
              axiosInstance,
              logger
            },
            {
              walletAddress,
              accessToken
            },
            openApiValidators.successfulValidator,
            {
              first,
              cursor
            }
          )

          expect(result).toStrictEqual(incomingPaymentPaginationResult)
          scope.done()
        }
      )
    })

    describe('backward pagination', (): void => {
      test.each`
        last         | cursor
        ${undefined} | ${uuid()}
        ${5}         | ${uuid()}
      `(
        'returns incoming payments list',
        async ({ last, cursor }): Promise<void> => {
          const incomingPaymentPaginationResult =
            mockIncomingPaymentPaginationResult({
              result: Array(last).fill(mockIncomingPayment())
            })

          const scope = nock(walletAddress)
            .get('/incoming-payments')
            .query({
              ...(last ? { last } : {}),
              cursor
            })
            .reply(200, incomingPaymentPaginationResult)

          const result = await listIncomingPayment(
            {
              axiosInstance,
              logger
            },
            {
              walletAddress,
              accessToken
            },
            openApiValidators.successfulValidator,
            {
              last,
              cursor
            }
          )

          expect(result).toStrictEqual(incomingPaymentPaginationResult)
          scope.done()
        }
      )
    })

    test('throws if an incoming payment does not pass validation', async (): Promise<void> => {
      const incomingPayment = mockIncomingPayment({
        incomingAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '10'
        },
        receivedAmount: {
          assetCode: 'USD',
          assetScale: 4,
          value: '0'
        }
      })

      const incomingPaymentPaginationResult =
        mockIncomingPaymentPaginationResult({
          result: [incomingPayment]
        })

      const scope = nock(walletAddress)
        .get('/incoming-payments')
        .reply(200, incomingPaymentPaginationResult)

      await expect(
        listIncomingPayment(
          {
            axiosInstance,
            logger
          },
          {
            walletAddress,
            accessToken
          },
          openApiValidators.successfulValidator
        )
      ).rejects.toThrow('Could not validate incoming payment')

      scope.done()
    })

    test('throws if an incoming payment does not pass open api validation', async (): Promise<void> => {
      const incomingPaymentPaginationResult =
        mockIncomingPaymentPaginationResult()

      const scope = nock(walletAddress)
        .get('/incoming-payments')
        .reply(200, incomingPaymentPaginationResult)

      await expect(
        listIncomingPayment(
          { axiosInstance, logger },
          { walletAddress, accessToken },
          openApiValidators.failedValidator
        )
      ).rejects.toThrowError()

      scope.done()
    })
  })

  describe('validateIncomingPayment', (): void => {
    test('returns incoming payment if passes validation', async (): Promise<void> => {
      const incomingPayment = mockIncomingPayment({
        incomingAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '5'
        },
        receivedAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '5'
        },
        completed: true
      })

      expect(validateIncomingPayment(incomingPayment)).toStrictEqual(
        incomingPayment
      )
    })

    test('throws if receiving and incoming amount asset scales are different', async (): Promise<void> => {
      const incomingPayment = mockIncomingPayment({
        incomingAmount: {
          assetCode: 'USD',
          assetScale: 1,
          value: '5'
        },
        receivedAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '5'
        }
      })

      expect(() => validateIncomingPayment(incomingPayment)).toThrow(
        'Incoming amount asset code or asset scale does not match up received amount'
      )
    })

    test('throws if receiving and incoming asset codes are different', async (): Promise<void> => {
      const incomingPayment = mockIncomingPayment({
        incomingAmount: {
          assetCode: 'CAD',
          assetScale: 1,
          value: '5'
        },
        receivedAmount: {
          assetCode: 'USD',
          assetScale: 1,
          value: '5'
        }
      })

      expect(() => validateIncomingPayment(incomingPayment)).toThrow(
        'Incoming amount asset code or asset scale does not match up received amount'
      )
    })

    test('throws if receiving amount is larger than incoming amount', async (): Promise<void> => {
      const incomingPayment = mockIncomingPayment({
        incomingAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '5'
        },
        receivedAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '10'
        }
      })

      expect(() => validateIncomingPayment(incomingPayment)).toThrow(
        'Received amount is larger than incoming amount'
      )
    })

    test('throws if receiving amount is the same as incoming amount but payment status is incomplete', async (): Promise<void> => {
      const incomingPayment = mockIncomingPayment({
        incomingAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '10'
        },
        receivedAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '10'
        },
        completed: false
      })

      expect(() => validateIncomingPayment(incomingPayment)).toThrow(
        'Incoming amount matches received amount but payment is not completed'
      )
    })
  })

  describe('validateCreatedIncomingPayment', (): void => {
    test('returns the created incoming payment if it passes validation', async (): Promise<void> => {
      const incomingPayment = mockIncomingPayment({
        incomingAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '5'
        },
        receivedAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '0'
        }
      })

      expect(validateCreatedIncomingPayment(incomingPayment)).toStrictEqual(
        incomingPayment
      )
    })

    test('throws if received amount is a non-zero value for a newly created incoming payment', async (): Promise<void> => {
      const incomingPayment = mockIncomingPayment({
        receivedAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '1'
        }
      })

      expect(() => validateCreatedIncomingPayment(incomingPayment)).toThrow(
        'Received amount is a non-zero value.'
      )
    })

    test('throws if the created incoming payment is completed', async (): Promise<void> => {
      const incomingPayment = mockIncomingPayment({
        completed: true
      })

      expect(() => validateCreatedIncomingPayment(incomingPayment)).toThrow(
        'Can not create a completed incoming payment.'
      )
    })
  })

  describe('validateCompletedIncomingPayment', (): void => {
    test('returns the completed incoming payment if it passes validation', async (): Promise<void> => {
      const incomingPayment = mockIncomingPayment({
        completed: true
      })

      expect(validateCompletedIncomingPayment(incomingPayment)).toStrictEqual(
        incomingPayment
      )
    })

    test('throws if the incoming payment is not completed', async (): Promise<void> => {
      const incomingPayment = mockIncomingPayment({
        completed: false
      })

      expect(() => validateCompletedIncomingPayment(incomingPayment)).toThrow(
        'Incoming payment could not be completed.'
      )
    })
  })

  describe('routes', (): void => {
    describe('get', (): void => {
      test('calls get method with correct validator', async (): Promise<void> => {
        const mockResponseValidator = ({ path, method }) =>
          path === '/incoming-payments/{id}' && method === HttpMethod.GET

        const url = `${walletAddress}/incoming-payments/1`

        jest
          .spyOn(openApi, 'createResponseValidator')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .mockImplementation(mockResponseValidator as any)

        const getSpy = jest
          .spyOn(requestors, 'get')
          .mockResolvedValueOnce(mockIncomingPayment())

        await createIncomingPaymentRoutes({
          openApi,
          axiosInstance,
          logger
        }).get({ url, accessToken })

        expect(getSpy).toHaveBeenCalledWith(
          {
            axiosInstance,
            logger
          },
          { url, accessToken },
          true
        )
      })
    })

    describe('list', (): void => {
      test('calls get method with correct validator', async (): Promise<void> => {
        const mockResponseValidator = ({ path, method }) =>
          path === '/incoming-payments' && method === HttpMethod.GET

        const incomingPaymentPaginationResult =
          mockIncomingPaymentPaginationResult({
            result: [mockIncomingPayment()]
          })
        const url = `${walletAddress}${getRSPath('/incoming-payments')}`

        jest
          .spyOn(openApi, 'createResponseValidator')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .mockImplementation(mockResponseValidator as any)

        const getSpy = jest
          .spyOn(requestors, 'get')
          .mockResolvedValueOnce(incomingPaymentPaginationResult)

        await createIncomingPaymentRoutes({
          openApi,
          axiosInstance,
          logger
        }).list({ walletAddress, accessToken })

        expect(getSpy).toHaveBeenCalledWith(
          {
            axiosInstance,
            logger
          },
          { url, accessToken },
          true
        )
      })
    })

    describe('create', (): void => {
      test('calls post method with correct validator', async (): Promise<void> => {
        const mockResponseValidator = ({ path, method }) =>
          path === '/incoming-payments' && method === HttpMethod.POST

        const url = `${walletAddress}/incoming-payments`
        const incomingPaymentCreateArgs = {
          description: 'Invoice',
          incomingAmount: { assetCode: 'USD', assetScale: 2, value: '10' }
        }

        jest
          .spyOn(openApi, 'createResponseValidator')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .mockImplementation(mockResponseValidator as any)

        const postSpy = jest
          .spyOn(requestors, 'post')
          .mockResolvedValueOnce(mockIncomingPayment(incomingPaymentCreateArgs))

        await createIncomingPaymentRoutes({
          openApi,
          axiosInstance,
          logger
        }).create({ walletAddress, accessToken }, incomingPaymentCreateArgs)

        expect(postSpy).toHaveBeenCalledWith(
          {
            axiosInstance,
            logger
          },
          { url, accessToken, body: incomingPaymentCreateArgs },
          true
        )
      })
    })

    describe('complete', (): void => {
      test('calls post method with correct validator', async (): Promise<void> => {
        const mockResponseValidator = ({ path, method }) =>
          path === '/incoming-payments/{id}/complete' &&
          method === HttpMethod.POST

        const incomingPaymentUrl = `${walletAddress}/incoming-payments/1`

        jest
          .spyOn(openApi, 'createResponseValidator')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .mockImplementation(mockResponseValidator as any)

        const postSpy = jest
          .spyOn(requestors, 'post')
          .mockResolvedValueOnce(mockIncomingPayment({ completed: true }))

        await createIncomingPaymentRoutes({
          openApi,
          axiosInstance,
          logger
        }).complete({ url: incomingPaymentUrl, accessToken })

        expect(postSpy).toHaveBeenCalledWith(
          {
            axiosInstance,
            logger
          },
          { url: `${incomingPaymentUrl}/complete`, accessToken },
          true
        )
      })
    })
  })
})
