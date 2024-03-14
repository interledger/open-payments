import { createOpenAPI } from '@interledger/openapi'
import path from 'path'

/**
 * Returns the OpenAPI object for the Open Payments Resource Server OpenAPI spec.
 * This object allows validating requests and responses against the spec.
 * See more: https://github.com/interledger/open-payments/blob/main/packages/openapi/README.md
 */
export async function getResourceServerOpenAPI() {
  return createOpenAPI(path.resolve(__dirname, './specs/resource-server.yaml'))
}

/**
 * Returns the OpenAPI object for the Open Payments Wallet Address Server OpenAPI spec.
 * This object allows validating requests and responses against the spec.
 * See more: https://github.com/interledger/open-payments/blob/main/packages/openapi/README.md
 */
export async function getWalletAddressServerOpenAPI() {
  return createOpenAPI(
    path.resolve(__dirname, './specs/wallet-address-server.yaml')
  )
}

/**
 * Returns the OpenAPI object for the Open Payments Auth Server OpenAPI spec.
 * This object allows validating requests and responses against the spec.
 * See more: https://github.com/interledger/open-payments/blob/main/packages/openapi/README.md
 */
export async function getAuthServerOpenAPI() {
  return createOpenAPI(path.resolve(__dirname, './specs/auth-server.yaml'))
}
