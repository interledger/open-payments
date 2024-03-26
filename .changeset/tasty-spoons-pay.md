---
'@interledger/openapi': major
---

Changes to the `createValidatorMiddleware` behaviour:

- The middleware now throws a `OpenAPIValidatorMiddlewareError` instead of directly using Koa's `ctx.throw` function. This error class has `message` and `status` properties that describe the exact validation error as well as the status code that should be thrown.
- The middleware now takes in an optional `validationOptions` argument that determines whether to validate just the request, the response or both. By default, both are validated, and the middleware no longer uses `process.env.NODE_ENV` to determine whether to validate the response or not.
