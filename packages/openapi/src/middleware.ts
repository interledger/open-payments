import { OpenAPI, RequestOptions, isValidationError } from './'

import Koa from 'koa'

export function createValidatorMiddleware<T extends Koa.DefaultContext>(
  spec: OpenAPI,
  options: RequestOptions
): (ctx: Koa.Context, next: () => Promise<unknown>) => Promise<void> {
  const validateRequest = spec.createRequestValidator<T['request']>(options)
  const validateResponse =
    process.env.NODE_ENV !== 'production' &&
    spec.createResponseValidator(options)

  return async (
    ctx: Koa.Context,
    next: () => Promise<unknown>
  ): Promise<void> => {
    // TODO: Allow 'application/*+json'
    ctx.assert(ctx.accepts('application/json'), 406, 'must accept json')
    try {
      if (validateRequest(ctx.request)) {
        await next()
        if (validateResponse && !validateResponse(ctx.response)) {
          throw new Error('unreachable')
        }
      } else {
        throw new Error('unreachable')
      }
    } catch (err) {
      if (err instanceof Koa.HttpError) {
        throw err
      } else if (isValidationError(err)) {
        ctx.throw(err.status ?? 500, err.errors[0])
      } else {
        console.log('err=', err)
        ctx.throw(500)
      }
    }
  }
}
