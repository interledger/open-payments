import { HttpMethod } from '@interledger/openapi'
import { RouteDeps, UnauthenticatedResourceRequestArgs } from '.'
import { JWKS, WalletAddress, DIDDocument, getWAPath } from '../types'
import { get } from './requests'

export interface WalletAddressRoutes {
    get(args: UnauthenticatedResourceRequestArgs): Promise<WalletAddress>
    getKeys(args: UnauthenticatedResourceRequestArgs): Promise<JWKS>
    // TODO: Define schema for DID Document
    getDIDDocument(args: UnauthenticatedResourceRequestArgs): Promise<DIDDocument>
}

export const createWalletAddressRoutes = (
    deps: RouteDeps
): WalletAddressRoutes => {
    const { axiosInstance, openApi, logger } = deps

    const getWalletAddressValidator =
        openApi.createResponseValidator<WalletAddress>({
            path: getWAPath('/'),
            method: HttpMethod.GET
        })

    const getWalletAddressKeysValidator = openApi.createResponseValidator<JWKS>({
        path: getWAPath('/jwks.json'),
        method: HttpMethod.GET
    })

    const getDidDocumentValidator = openApi.createResponseValidator<DIDDocument>({
        path: getWAPath('/did.json'),
        method: HttpMethod.GET
    })

    return {
        get: (args: UnauthenticatedResourceRequestArgs) =>
            get({ axiosInstance, logger }, args, getWalletAddressValidator),
        getKeys: (args: UnauthenticatedResourceRequestArgs) =>
            get(
                { axiosInstance, logger },
                {
                    url: `${args.url}/jwks.json`
                },
                getWalletAddressKeysValidator
            ),
        getDIDDocument: (args: UnauthenticatedResourceRequestArgs) =>
            get(
                { axiosInstance, logger },
                {
                    url: `${args.url}/did.json`
                },
                getDidDocumentValidator
            )
    }
}
