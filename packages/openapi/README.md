# OpenAPI 3.1 Validator

This package exposes functionality to validate requests and responses according to a given OpenAPI 3.1 schema.

## Local Development

### Building

```shell
pnpm --filter openapi build
```

### Testing

From the monorepo root directory:

```shell
pnpm --filter openapi test
```

## Usage

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

<br>

Likewise, you can validate both requests and responses inside a middleware method, using `createValidatorMiddleware`:

```ts
const openApi = await createOpenAPI(OPEN_API_URL)
const router = new SomeRouter()
router.get(
  '/resource/{id}',
  createValidatorMiddleware(openApi, {
    path: '/resource/{id}',
    method: HttpMethod.GET
  })
)
```
