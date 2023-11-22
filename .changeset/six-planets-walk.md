---
'@interledger/open-payments': patch
---

The `useHttp` option, when initializing an authenticated or unauthenticated client, was not being passed to resource route factories and request functions. This release addresses and resolves this issue.
