/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
    "/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a Wallet Address
         * @description Retrieve the public information of the Wallet Address.
         *
         *     This end-point should be open to anonymous requests as it allows clients to verify a Wallet Address URL and get the basic information required to construct new transactions and discover the grant request URL.
         *
         *     The content should be slow changing and cacheable for long periods. Servers SHOULD use cache control headers.
         */
        get: operations["get-wallet-address"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jwks.json": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the keys bound to a Wallet Address
         * @description Retrieve the public keys of the Wallet Address.
         */
        get: operations["get-wallet-address-keys"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/did.json": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the DID Document for this wallet
         * @description Retrieve the DID Document of the Wallet Address.
         */
        get: operations["get-wallet-address-did-document"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /**
         * Wallet Address
         * @description A **wallet address** resource is the root of the API and contains the public details of the financial account represented by the Wallet Address that is also the service endpoint URL.
         */
        "wallet-address": {
            /**
             * Format: uri
             * @description The URL identifying the wallet address.
             */
            readonly id: string;
            /** @description A public name for the account. This should be set by the account holder with their provider to provide a hint to counterparties as to the identity of the account holder. */
            readonly publicName?: string;
            assetCode: components["schemas"]["assetCode"];
            assetScale: components["schemas"]["assetScale"];
            /**
             * Format: uri
             * @description The URL of the authorization server endpoint for getting grants and access tokens for this wallet address.
             */
            readonly authServer: string;
            /**
             * Format: uri
             * @description The URL of the resource server endpoint for performing Open Payments with this wallet address.
             */
            readonly resourceServer: string;
        } & {
            [key: string]: unknown;
        };
        /**
         * JSON Web Key Set document
         * @description A JSON Web Key Set document according to [rfc7517](https://datatracker.ietf.org/doc/html/rfc7517) listing the keys associated with this wallet address. These keys are used to sign requests made by this wallet address.
         */
        "json-web-key-set": {
            readonly keys: components["schemas"]["json-web-key"][];
        };
        /**
         * Ed25519 Public Key
         * @description A JWK representation of an Ed25519 Public Key
         */
        "json-web-key": {
            kid: string;
            /**
             * @description The cryptographic algorithm family used with the key. The only allowed value is `EdDSA`.
             * @enum {string}
             */
            alg: "EdDSA";
            /** @enum {string} */
            use?: "sig";
            /** @enum {string} */
            kty: "OKP";
            /** @enum {string} */
            crv: "Ed25519";
            /** @description The base64 url-encoded public key. */
            x: string;
        };
        /**
         * DID Document
         * @description A DID Document using JSON encoding
         */
        "did-document": {
            [key: string]: unknown;
        };
        /**
         * Asset code
         * @description The assetCode is a code that indicates the underlying asset. An ISO4217 currency code should be used whenever possible. The ISO4217 representation of the US Dollar is USD.
         */
        assetCode: string;
        /**
         * Asset scale
         * @description The number of decimal places that defines the scale of the smallest divisible unit for the given asset code. It determines how an integer amount is scaled to derive the actual monetary value. For example, USD has an asset scale of 2 with the smallest unit being 0.01. An integer amount of `1000` with an `assetCode` of `USD` and `assetScale` of `2` translates to $10.00.
         */
        assetScale: number;
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    "get-wallet-address": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Wallet Address Found */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["wallet-address"];
                };
            };
            /** @description If the `Accept` header is `text/html` in the request, the server may choose to redirect to an HTML page for the given wallet address. */
            302: {
                headers: {
                    /** @description The URL of the wallet address webpage. */
                    Location?: string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Wallet Address Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    "get-wallet-address-keys": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description JWKS Document Found */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["json-web-key-set"];
                };
            };
            /** @description JWKS Document Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    "get-wallet-address-did-document": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description DID Document Found */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["did-document"];
                };
            };
            /** @description DID Document not yet implemented */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
