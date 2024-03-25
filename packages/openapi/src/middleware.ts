import { OpenAPI, RequestOptions, isValidationError } from './'

import Koa from 'koa'

interface ValidationOptions {
  validateRequest?: boolean
  validateResponse?: boolean
}

export function createValidatorMiddleware<T extends Koa.DefaultContext>(
  spec: OpenAPI,
  options: RequestOptions,
  validationOptions: ValidationOptions | undefined = {
    validateRequest: true,
    validateResponse: true
  }
): (ctx: Koa.Context, next: () => Promise<unknown>) => Promise<void> {
  const requestValidator = spec.createRequestValidator<T['request']>(options)
  const responseValidator = spec.createResponseValidator(options)

  return async (
    ctx: Koa.Context,
    next: () => Promise<unknown>
  ): Promise<void> => {
    try {
      if (validationOptions?.validateRequest) {
        // TODO: Allow 'application/*+json'
        if (!ctx.accepts('application/json')) {
          throw new OpenAPIValidatorMiddlewareError(
            'Received error validating OpenAPI request: Must accept application/json',
            406
          )
        }

        requestValidator(ctx.request)
      }
    } catch (err) {
      if (isValidationError(err)) {
        throw new OpenAPIValidatorMiddlewareError(
          `Received error validating OpenAPI request: ${err.errors[0]?.message}`,
          err.status || 500
        )
      }

      throw err // Should not be possible (only ValidationError is thrown in requestValidator)
    }

    await next()

    try {
      if (validationOptions?.validateResponse) {
        responseValidator(ctx.response)
      }
    } catch (err) {
      if (isValidationError(err)) {
        throw new OpenAPIValidatorMiddlewareError(
          `Received error validating OpenAPI response: ${err.errors[0]?.message}`,
          err.status || 500
        )
      }

      throw err // Should not be possible (only ValidationError is thrown in responseValidator)
    }

    await next()
  }
}

export class OpenAPIValidatorMiddlewareError extends Error {
  public status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'OpenAPIValidatorMiddlewareError'
    this.status = status
  }
}
