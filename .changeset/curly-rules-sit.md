---
'@interledger/open-payments': minor
---

- Adding `OpenPaymentsClientError`, which gets thrown when making any request, as well as during client initialization. This error class contains additional error properties: `description` `status` (if thrown during an API request) and `validationErrors`. Example usage is in the README.
- **Behaviour change**: Adding `useHttp` flag to the client, so that the conversion to http is explicitly set instead of using `process.env.NODE_ENV`. To keep the same behaviour, set `useHttp: process.env.NODE_ENV` when callng `createAuthenticatedClient` or `createUnauthenticatedClient`
- Adding `logLevel` flag to the client initialization
- Adding additional notes to the README with the new spec changes.
