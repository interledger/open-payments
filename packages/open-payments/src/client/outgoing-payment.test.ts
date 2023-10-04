import {
  createOutgoingPayment,
  createOutgoingPaymentRoutes,
  getOutgoingPayment,
  listOutgoingPayments,
  validateOutgoingPayment
} from './outgoing-payment'
import { OpenAPI, HttpMethod, createOpenAPI } from '@interledger/openapi'
import {
  defaultAxiosInstance,
  mockOutgoingPayment,
  mockOpenApiResponseValidators,
  silentLogger,
  mockOutgoingPaymentPaginationResult
} from '../test/helpers'
import nock from 'nock'
import path from 'path'
import { v4 as uuid } from 'uuid'
import * as requestors from './requests'

jest.mock('./requests', () => {
  return {
    // https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options
    __esModule: true,
    ...jest.requireActual('./requests')
  }
})

describe('outgoing-payment', (): void => {
  let openApi: OpenAPI

  beforeAll(async () => {
    openApi = await createOpenAPI(
      path.resolve(__dirname, '../openapi/resource-server.yaml')
    )
  })

  const axiosInstance = defaultAxiosInstance
  const logger = silentLogger
  const walletAddress = `http://localhost:1000/.well-known/pay`
  const serverAddress = 'http://localhost:1000'
  const openApiValidators = mockOpenApiResponseValidators()

  describe('getOutgoingPayment', (): void => {
    test('returns outgoing payment if passes validation', async (): Promise<void> => {
      const outgoingPayment = mockOutgoingPayment()

      const scope = nock(serverAddress)
        .get('/outgoing-payments/1')
        .query({ 'wallet-address': walletAddress })
        .reply(200, outgoingPayment)

      const result = await getOutgoingPayment(
        { axiosInstance, logger },
        {
          url: `${serverAddress}/outgoing-payments/1`,
          accessToken: 'accessToken',
          walletAddress
        },
        openApiValidators.successfulValidator
      )
      expect(result).toStrictEqual(outgoingPayment)
      scope.done()
    })

    test('throws if outgoing payment does not pass validation', async (): Promise<void> => {
      const outgoingPayment = mockOutgoingPayment({
        debitAmount: {
          assetCode: 'USD',
          assetScale: 3,
          value: '5'
        },
        sentAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '0'
        }
      })

      const scope = nock(serverAddress)
        .get('/outgoing-payments/1')
        .query({ 'wallet-address': walletAddress })
        .reply(200, outgoingPayment)

      await expect(
        getOutgoingPayment(
          { axiosInstance, logger },
          {
            url: `${serverAddress}/outgoing-payments/1`,
            accessToken: 'accessToken',
            walletAddress
          },
          openApiValidators.successfulValidator
        )
      ).rejects.toThrowError()
      scope.done()
    })

    test('throws if outgoing payment does not pass open api validation', async (): Promise<void> => {
      const outgoingPayment = mockOutgoingPayment()

      const scope = nock(serverAddress)
        .get('/outgoing-payments/1')
        .query({ 'wallet-address': walletAddress })
        .reply(200, outgoingPayment)

      await expect(
        getOutgoingPayment(
          { axiosInstance, logger },
          {
            url: `${serverAddress}/outgoing-payments/1`,
            accessToken: 'accessToken',
            walletAddress
          },
          openApiValidators.failedValidator
        )
      ).rejects.toThrowError()
      scope.done()
    })
  })

  describe('listOutgoingPayment', (): void => {
    describe('forward pagination', (): void => {
      test.each`
        first        | cursor
        ${undefined} | ${undefined}
        ${1}         | ${undefined}
        ${5}         | ${uuid()}
      `(
        'returns outgoing payment list',
        async ({ first, cursor }): Promise<void> => {
          const outgoingPaymentPaginationResult =
            mockOutgoingPaymentPaginationResult({
              result: Array(first).fill(mockOutgoingPayment())
            })

          const scope = nock(serverAddress)
            .get('/outgoing-payments')
            .query({
              'wallet-address': walletAddress,
              ...(first ? { first } : {}),
              ...(cursor ? { cursor } : {})
            })
            .reply(200, outgoingPaymentPaginationResult)

          const result = await listOutgoingPayments(
            { axiosInstance, logger },
            {
              url: serverAddress,
              walletAddress,
              accessToken: 'accessToken'
            },
            openApiValidators.successfulValidator,
            {
              'wallet-address': walletAddress,
              first,
              cursor
            }
          )
          expect(result).toStrictEqual(outgoingPaymentPaginationResult)
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
        'returns outgoing payment list',
        async ({ last, cursor }): Promise<void> => {
          const outgoingPaymentPaginationResult =
            mockOutgoingPaymentPaginationResult({
              result: Array(last).fill(mockOutgoingPayment())
            })

          const scope = nock(serverAddress)
            .get('/outgoing-payments')
            .query({
              'wallet-address': walletAddress,
              ...(last ? { last } : {}),
              cursor
            })
            .reply(200, outgoingPaymentPaginationResult)

          const result = await listOutgoingPayments(
            {
              axiosInstance,
              logger
            },
            {
              url: serverAddress,
              walletAddress,
              accessToken: 'accessToken'
            },
            openApiValidators.successfulValidator,
            {
              'wallet-address': walletAddress,
              last,
              cursor
            }
          )
          expect(result).toStrictEqual(outgoingPaymentPaginationResult)
          scope.done()
        }
      )
    })

    test('throws if an outgoing payment does not pass validation', async (): Promise<void> => {
      const invalidOutgoingPayment = mockOutgoingPayment({
        debitAmount: {
          assetCode: 'CAD',
          assetScale: 2,
          value: '5'
        },
        sentAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '0'
        }
      })

      const outgoingPaymentPaginationResult =
        mockOutgoingPaymentPaginationResult({
          result: [invalidOutgoingPayment]
        })

      const scope = nock(serverAddress)
        .get('/outgoing-payments')
        .query({ 'wallet-address': walletAddress })
        .reply(200, outgoingPaymentPaginationResult)

      await expect(
        listOutgoingPayments(
          {
            axiosInstance,
            logger
          },
          {
            url: serverAddress,
            walletAddress,
            accessToken: 'accessToken'
          },
          openApiValidators.successfulValidator
        )
      ).rejects.toThrowError(/Could not validate outgoing payment/)
      scope.done()
    })

    test('throws if an outgoing payment does not pass open api validation', async (): Promise<void> => {
      const outgoingPaymentPaginationResult =
        mockOutgoingPaymentPaginationResult()

      const scope = nock(serverAddress)
        .get('/outgoing-payments')
        .query({ 'wallet-address': walletAddress })
        .reply(200, outgoingPaymentPaginationResult)

      await expect(
        listOutgoingPayments(
          {
            axiosInstance,
            logger
          },
          {
            url: serverAddress,
            walletAddress,
            accessToken: 'accessToken'
          },
          openApiValidators.failedValidator
        )
      ).rejects.toThrowError()
      scope.done()
    })
  })

  describe('createOutgoingPayment', (): void => {
    const quoteId = `${serverAddress}/quotes/${uuid()}`

    test.each`
      metadata
      ${{ description: 'Some description', externalRef: '#INV-1' }}
      ${undefined}
    `('creates outgoing payment', async ({ metadata }): Promise<void> => {
      const outgoingPayment = mockOutgoingPayment({
        quoteId,
        metadata
      })

      const scope = nock(serverAddress)
        .post('/outgoing-payments')
        .reply(200, outgoingPayment)

      const result = await createOutgoingPayment(
        { axiosInstance, logger },
        {
          url: serverAddress,
          walletAddress,
          accessToken: 'accessToken'
        },
        openApiValidators.successfulValidator,
        {
          quoteId,
          metadata
        }
      )
      expect(result).toEqual(outgoingPayment)
      scope.done()
    })

    test('throws if outgoing payment does not pass validation', async (): Promise<void> => {
      const outgoingPayment = mockOutgoingPayment({
        debitAmount: {
          assetCode: 'USD',
          assetScale: 3,
          value: '5'
        },
        sentAmount: {
          assetCode: 'CAD',
          assetScale: 3,
          value: '0'
        }
      })

      const scope = nock(serverAddress)
        .post('/outgoing-payments')
        .reply(200, outgoingPayment)

      await expect(
        createOutgoingPayment(
          { axiosInstance, logger },
          {
            url: serverAddress,
            walletAddress,
            accessToken: 'accessToken'
          },
          openApiValidators.successfulValidator,
          {
            quoteId: uuid()
          }
        )
      ).rejects.toThrowError()
      scope.done()
    })

    test('throws if outgoing payment does not pass open api validation', async (): Promise<void> => {
      const outgoingPayment = mockOutgoingPayment()

      const scope = nock(serverAddress)
        .post('/outgoing-payments')
        .reply(200, outgoingPayment)

      await expect(
        createOutgoingPayment(
          {
            axiosInstance,
            logger
          },
          {
            url: serverAddress,
            walletAddress,
            accessToken: 'accessToken'
          },
          openApiValidators.failedValidator,
          {
            quoteId: uuid()
          }
        )
      ).rejects.toThrowError()
      scope.done()
    })
  })

  describe('validateOutgoingPayment', (): void => {
    test('returns outgoing payment if passes validation', async (): Promise<void> => {
      const outgoingPayment = mockOutgoingPayment()

      expect(validateOutgoingPayment(outgoingPayment)).toStrictEqual(
        outgoingPayment
      )
    })

    test('throws if send amount and sent amount asset scales are different', async (): Promise<void> => {
      const outgoingPayment = mockOutgoingPayment({
        debitAmount: {
          assetCode: 'USD',
          assetScale: 3,
          value: '5'
        },
        sentAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '0'
        }
      })

      expect(() => validateOutgoingPayment(outgoingPayment)).toThrow(
        'Asset code or asset scale of sending amount does not match sent amount'
      )
    })

    test('throws if send amount and sent amount asset codes are different', async (): Promise<void> => {
      const outgoingPayment = mockOutgoingPayment({
        debitAmount: {
          assetCode: 'CAD',
          assetScale: 2,
          value: '5'
        },
        sentAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '0'
        }
      })

      expect(() => validateOutgoingPayment(outgoingPayment)).toThrow(
        'Asset code or asset scale of sending amount does not match sent amount'
      )
    })

    test('throws if sent amount is larger than send amount', async (): Promise<void> => {
      const outgoingPayment = mockOutgoingPayment({
        debitAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '5'
        },
        sentAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '6'
        }
      })

      expect(() => validateOutgoingPayment(outgoingPayment)).toThrow(
        'Amount sent is larger than maximum amount to send'
      )
    })

    test('throws if sent amount equals send amount, but payment has failed', async (): Promise<void> => {
      const outgoingPayment = mockOutgoingPayment({
        debitAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '5'
        },
        sentAmount: {
          assetCode: 'USD',
          assetScale: 2,
          value: '5'
        },
        failed: true
      })

      expect(() => validateOutgoingPayment(outgoingPayment)).toThrow(
        'Amount to send matches sent amount but payment failed'
      )
    })
  })

  describe('routes', (): void => {
    describe('get', (): void => {
      test('calls get method with correct validator', async (): Promise<void> => {
        const mockResponseValidator = ({ path, method }) =>
          path === '/outgoing-payments/{id}' && method === HttpMethod.GET

        const url = `${serverAddress}/outgoing-payments/1`

        jest
          .spyOn(openApi, 'createResponseValidator')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .mockImplementation(mockResponseValidator as any)

        const getSpy = jest
          .spyOn(requestors, 'get')
          .mockResolvedValueOnce(mockOutgoingPayment())

        await createOutgoingPaymentRoutes({
          openApi,
          axiosInstance,
          logger
        }).get({ url, accessToken: 'accessToken', walletAddress })

        expect(getSpy).toHaveBeenCalledWith(
          {
            axiosInstance,
            logger
          },
          {
            url,
            accessToken: 'accessToken',
            queryParams: {
              'wallet-address': walletAddress
            }
          },
          true
        )
      })
    })

    describe('list', (): void => {
      test('calls get method with correct validator', async (): Promise<void> => {
        const mockResponseValidator = ({ path, method }) =>
          path === '/outgoing-payments' && method === HttpMethod.GET

        const outgoingPaymentPaginationResult =
          mockOutgoingPaymentPaginationResult({
            result: [mockOutgoingPayment()]
          })
        const url = `${serverAddress}/outgoing-payments`

        jest
          .spyOn(openApi, 'createResponseValidator')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .mockImplementation(mockResponseValidator as any)

        const getSpy = jest
          .spyOn(requestors, 'get')
          .mockResolvedValueOnce(outgoingPaymentPaginationResult)

        await createOutgoingPaymentRoutes({
          openApi,
          axiosInstance,
          logger
        }).list({
          url: serverAddress,
          walletAddress,
          accessToken: 'accessToken'
        })

        expect(getSpy).toHaveBeenCalledWith(
          {
            axiosInstance,
            logger
          },
          {
            url,
            accessToken: 'accessToken',
            queryParams: {
              'wallet-address': walletAddress
            }
          },
          true
        )
      })
    })

    describe('create', (): void => {
      test('calls post method with correct validator', async (): Promise<void> => {
        const mockResponseValidator = ({ path, method }) =>
          path === '/outgoing-payments' && method === HttpMethod.POST

        const url = `${serverAddress}/outgoing-payments`
        const outgoingPaymentCreateArgs = {
          quoteId: uuid()
        }

        jest
          .spyOn(openApi, 'createResponseValidator')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .mockImplementation(mockResponseValidator as any)

        const postSpy = jest
          .spyOn(requestors, 'post')
          .mockResolvedValueOnce(mockOutgoingPayment(outgoingPaymentCreateArgs))

        await createOutgoingPaymentRoutes({
          openApi,
          axiosInstance,
          logger
        }).create(
          { url: serverAddress, walletAddress, accessToken: 'accessToken' },
          outgoingPaymentCreateArgs
        )

        expect(postSpy).toHaveBeenCalledWith(
          {
            axiosInstance,
            logger
          },
          { url, accessToken: 'accessToken', body: outgoingPaymentCreateArgs },
          true
        )
      })
    })
  })
})
