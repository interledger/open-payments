---
'@interledger/open-payments': minor
---

(EXPERIMENTAL) Allow a custom request interceptor for the authenticated client instead of providing the private key and key ID. The request interceptor should be responsible for HTTP signature generation and it will replace the built-in interceptor.
