# @interledger/openapi

## 2.0.3

### Patch Changes

- ff811ea: Updating typescript to v5

## 2.0.2

### Patch Changes

- 18ff574: Updating @apidevtools/json-schema-ref-parser package

## 2.0.1

### Patch Changes

- dd7fb76: - Exporting `OpenAPIValidatorMiddlewareError` from package

## 2.0.0

### Major Changes

- 6dde8b2: Changes to the `createValidatorMiddleware` behaviour:

  - The middleware now throws a `OpenAPIValidatorMiddlewareError` instead of directly using Koa's `ctx.throw` function. This error class has `message` and `status` properties that describe the exact validation error as well as the status code that should be thrown.
  - The middleware now takes in an optional `validationOptions` argument that determines whether to validate just the request, the response or both. By default, both are validated, and the middleware no longer uses `process.env.NODE_ENV` to determine whether to validate the response or not.

## 1.2.1

### Patch Changes

- 8c8d58c: removes defaults from first and last page parameters

## 1.2.0

### Minor Changes

- 4e98e06: Removed payment pointer/wallet address from resource urls

## 1.1.0

### Minor Changes

- 2ea12f0: removed connections route endpoint from the spec and any associated functionality

## 1.0.3

### Patch Changes

- 0b94331: Fixing dependencies & docs

## 1.0.2

### Patch Changes

- 6252042: Update publishConfig

## 1.0.1

### Patch Changes

- 842630e: Update README
