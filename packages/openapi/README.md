# OpenAPI 3.1 Validator

This package exposes functionality to validate requests and responses according to a given OpenAPI 3.1 schema.

## Installation

You can install the package using:

```shell
npm install @interledger/openapi
```

## Usage

### Validators

First, instantiate an `OpenAPI` validator object with a reference to your OpenAPI spec:

```ts
const openApi = await createOpenAPI(OPEN_API_URL_OR_FILE_PATH)
```

Then, validate requests and responses as such:

```ts
const validateRequest = openApi.createRequestValidator({
  path: '/resource/{id}',
  method: HttpMethod.GET
})

validateRequest(request) // throws or returns true

const validateResponse = openApi.createResponseValidator({
  path: '/resource/{id}',
  method: HttpMethod.GET
})

validateResponse({ body: response.body, status }) // throws or returns true
```

> **Note**
>
> The underlying response & request validator [packages](https://github.com/kogosoftwarellc/open-api/tree/master/packages) use the [Ajv schema validator](https://ajv.js.org) library. Each time validators are created via `createRequestValidator` and `createResponseValidator`, a `new Ajv()` instance is also [created](https://github.com/kogosoftwarellc/open-api/blob/master/packages/openapi-response-validator/index.ts). Since Ajv [recommends](https://ajv.js.org/guide/managing-schemas.html#compiling-during-initialization) instantiating once at initialization, these validators should also be instantiated just once during the lifecycle of the application to avoid any issues.

### Middleware

Likewise, you can validate both requests and responses inside a [Koa](https://github.com/koajs/koa) middleware method, using `createValidatorMiddleware`:

```ts
const openApi = await createOpenAPI(OPEN_API_URL)
const router = new SomeRouter()
router.get(
  '/resource/{id}',
  createValidatorMiddleware(
    openApi,
    {
      path: '/resource/{id}',
      method: HttpMethod.GET
    },
    { validateRequest: true, validateResponse: false } // optional arguments to determine what you want the middleware to validate. Both properties are true by default. Setting both variables to false results in a noop middleware.
  )
)
```

If a validation error occurs, the middleware will throw an `OpenAPIValidatorMiddlewareError`:

```ts
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    if (err instanceof OpenAPIValidatorMiddlewareError) {
      console.log(err.message) // e.g. Received error validating OpenAPI response: response.receivedAmount.value must match format "uint64"
      console.log(err.status) // e.g. 400
    }
  }
})
```
