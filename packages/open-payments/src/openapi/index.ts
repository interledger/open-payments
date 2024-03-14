import { createOpenAPI } from '@interledger/openapi'
import path from 'path'

export async function getResourceServerOpenAPI() {
  return createOpenAPI(path.resolve(__dirname, './specs/resource-server.yaml'))
}

export async function getWalletAddressServerOpenAPI() {
  return createOpenAPI(
    path.resolve(__dirname, './specs/wallet-address-server.yaml')
  )
}

export async function getAuthServerOpenAPI() {
  return createOpenAPI(path.resolve(__dirname, './specs/auth-server.yaml'))
}
