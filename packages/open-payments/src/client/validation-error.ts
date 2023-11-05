import { BaseDeps, OpenPaymentsClientError } from '.'

export const handleValidationError = (
  deps: BaseDeps,
  error: unknown,
  url: string,
  errorMessage: string
): never => {
  const validationError =
    error instanceof Error ? error.message : 'Unknown error'
  deps.logger.error({ url, validationError }, errorMessage)

  throw new OpenPaymentsClientError(errorMessage, {
    description: validationError,
    validationErrors: [validationError]
  })
}
