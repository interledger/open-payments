/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/": {
    /** Make a new grant request */
    post: operations["post-request"];
    parameters: {};
  };
  "/continue/{id}": {
    /** Continue a grant request during or after user interaction. */
    post: operations["post-continue"];
    /** Cancel a grant request or delete a grant client side. */
    delete: operations["delete-continue"];
    parameters: {
      path: {
        id: string;
      };
    };
  };
  "/token/{id}": {
    /** Management endpoint to rotate access token. */
    post: operations["post-token"];
    /** Management endpoint to revoke access token. */
    delete: operations["delete-token"];
    parameters: {
      path: {
        id: string;
      };
    };
  };
}

export interface components {
  schemas: {
    /** @description A description of the rights associated with this access token. */
    access: components["schemas"]["access-item"][];
    /** @description The access associated with the access token is described using objects that each contain multiple dimensions of access. */
    "access-item":
      | components["schemas"]["access-incoming"]
      | components["schemas"]["access-outgoing"]
      | components["schemas"]["access-quote"];
    /** access-incoming */
    "access-incoming": {
      /** @description The type of resource request as a string.  This field defines which other fields are allowed in the request object. */
      type: "incoming-payment";
      /** @description The types of actions the client instance will take at the RS as an array of strings. */
      actions: (
        | "create"
        | "complete"
        | "read"
        | "read-all"
        | "list"
        | "list-all"
      )[];
      /**
       * Format: uri
       * @description A string identifier indicating a specific resource at the RS.
       */
      identifier?: string;
    };
    /** access-outgoing */
    "access-outgoing": {
      /** @description The type of resource request as a string.  This field defines which other fields are allowed in the request object. */
      type: "outgoing-payment";
      /** @description The types of actions the client instance will take at the RS as an array of strings. */
      actions: ("create" | "read" | "read-all" | "list" | "list-all")[];
      /**
       * Format: uri
       * @description A string identifier indicating a specific resource at the RS.
       */
      identifier: string;
      limits?: components["schemas"]["limits-outgoing"];
    };
    /** access-quote */
    "access-quote": {
      /** @description The type of resource request as a string.  This field defines which other fields are allowed in the request object. */
      type: "quote";
      /** @description The types of actions the client instance will take at the RS as an array of strings. */
      actions: ("create" | "read" | "read-all")[];
    };
    /**
     * access_token
     * @description A single access token or set of access tokens that the client instance can use to call the RS on behalf of the RO.
     */
    access_token: {
      /** @description The value of the access token as a string.  The value is opaque to the client instance.  The value SHOULD be limited to ASCII characters to facilitate transmission over HTTP headers within other protocols without requiring additional encoding. */
      value: string;
      /**
       * Format: uri
       * @description The management URI for this access token. This URI MUST NOT include the access token value and SHOULD be different for each access token issued in a request.
       */
      manage: string;
      /** @description The number of seconds in which the access will expire.  The client instance MUST NOT use the access token past this time.  An RS MUST NOT accept an access token past this time. */
      expires_in?: number;
      access: components["schemas"]["access"];
    };
    /**
     * client
     * @description Wallet address of the client instance that is making this request.
     *
     * When sending a non-continuation request to the AS, the client instance MUST identify itself by including the client field of the request and by signing the request.
     *
     * A JSON Web Key Set document, including the public key that the client instance will use to protect this request and any continuation requests at the AS and any user-facing information about the client instance used in interactions, MUST be available at the wallet address + `/jwks.json` url.
     *
     * If sending a grant initiation request that requires RO interaction, the wallet address MUST serve necessary client display information.
     */
    client:
      | string
      | {
          wallet_address: string;
        }
      | {
          jwk: components["schemas"]["json-web-key"];
        };
    /**
     * continue
     * @description If the AS determines that the request can be continued with additional requests, it responds with the continue field.
     */
    continue: {
      /** @description A unique access token for continuing the request, called the "continuation access token". */
      access_token: {
        value: string;
      };
      /**
       * Format: uri
       * @description The URI at which the client instance can make continuation requests.
       */
      uri: string;
      /** @description The amount of time in integer seconds the client instance MUST wait after receiving this request continuation response and calling the continuation URI. */
      wait?: number;
    };
    /**
     * interact
     * @description The client instance declares the parameters for interaction methods that it can support using the interact field.
     */
    "interact-request": {
      /** @description Indicates how the client instance can start an interaction. */
      start: "redirect"[];
      /** @description Indicates how the client instance can receive an indication that interaction has finished at the AS. */
      finish?: {
        /** @description The callback method that the AS will use to contact the client instance. */
        method: "redirect";
        /**
         * Format: uri
         * @description Indicates the URI that the AS will either send the RO to after interaction or send an HTTP POST request.
         */
        uri: string;
        /** @description Unique value to be used in the calculation of the "hash" query parameter sent to the callback URI, must be sufficiently random to be unguessable by an attacker.  MUST be generated by the client instance as a unique value for this request. */
        nonce: string;
      };
    };
    /** interact-response */
    "interact-response": {
      /**
       * Format: uri
       * @description The URI to direct the end user to.
       */
      redirect: string;
      /** @description Unique key to secure the callback. */
      finish: string;
    };
    /**
     * Interval
     * @description [ISO8601 repeating interval](https://en.wikipedia.org/wiki/ISO_8601#Repeating_intervals)
     */
    interval: string;
    /**
     * limits-outgoing
     * @description Open Payments specific property that defines the limits under which outgoing payments can be created.
     */
    "limits-outgoing": Partial<unknown> & {
      receiver?: external["schemas.yaml"]["components"]["schemas"]["receiver"];
      /** @description All amounts are maxima, i.e. multiple payments can be created under a grant as long as the total amounts of these payments do not exceed the maximum amount per interval as specified in the grant. */
      debitAmount?: external["schemas.yaml"]["components"]["schemas"]["amount"];
      /** @description All amounts are maxima, i.e. multiple payments can be created under a grant as long as the total amounts of these payments do not exceed the maximum amount per interval as specified in the grant. */
      receiveAmount?: external["schemas.yaml"]["components"]["schemas"]["amount"];
      interval?: components["schemas"]["interval"];
    };
    /**
     * Ed25519 Public Key
     * @description A JWK representation of an Ed25519 Public Key
     */
    "json-web-key": {
      kid: string;
      /** @description The cryptographic algorithm family used with the key. The only allowed value is `EdDSA`. */
      alg: "EdDSA";
      use?: "sig";
      kty: "OKP";
      crv: "Ed25519";
      /** @description The base64 url-encoded public key. */
      x: string;
    };
  };
}

export interface operations {
  /** Make a new grant request */
  "post-request": {
    parameters: {};
    responses: {
      /** OK */
      200: {
        content: {
          "application/json":
            | {
                interact: components["schemas"]["interact-response"];
                continue: components["schemas"]["continue"];
              }
            | {
                access_token: components["schemas"]["access_token"];
                continue: components["schemas"]["continue"];
              };
        };
      };
      /** Bad Request */
      400: unknown;
      /** Unauthorized */
      401: unknown;
      /** Internal Server Error */
      500: unknown;
    };
    requestBody: {
      content: {
        "application/json": {
          access_token: {
            access: components["schemas"]["access"];
          };
          client: components["schemas"]["client"];
          interact?: components["schemas"]["interact-request"];
        };
      };
    };
  };
  /** Continue a grant request during or after user interaction. */
  "post-continue": {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      /** Success */
      200: {
        content: {
          "application/json": {
            access_token?: components["schemas"]["access_token"];
            continue: components["schemas"]["continue"];
          };
        };
      };
      /** Bad Request */
      400: unknown;
      /** Unauthorized */
      401: unknown;
      /** Not Found */
      404: unknown;
    };
    requestBody: {
      content: {
        "application/json": {
          /**
           * @description The interaction reference generated for this
           * interaction by the AS.
           */
          interact_ref?: string;
        };
      };
    };
  };
  /** Cancel a grant request or delete a grant client side. */
  "delete-continue": {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      /** No Content */
      204: never;
      /** Bad Request */
      400: unknown;
      /** Unauthorized */
      401: unknown;
      /** Not Found */
      404: unknown;
    };
  };
  /** Management endpoint to rotate access token. */
  "post-token": {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": {
            access_token: components["schemas"]["access_token"];
          };
        };
      };
      /** Bad Request */
      400: unknown;
      /** Unauthorized */
      401: unknown;
      /** Not Found */
      404: unknown;
    };
  };
  /** Management endpoint to revoke access token. */
  "delete-token": {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      /** No Content */
      204: never;
      /** Bad Request */
      400: unknown;
      /** Unauthorized */
      401: unknown;
    };
  };
}

export interface external {
  "schemas.yaml": {
    paths: {};
    components: {
      schemas: {
        /** amount */
        amount: {
          /**
           * Format: uint64
           * @description The value is an unsigned 64-bit integer amount, represented as a string.
           */
          value: string;
          assetCode: external["schemas.yaml"]["components"]["schemas"]["assetCode"];
          assetScale: external["schemas.yaml"]["components"]["schemas"]["assetScale"];
        };
        /**
         * Asset code
         * @description The assetCode is a code that indicates the underlying asset. This SHOULD be an ISO4217 currency code.
         */
        assetCode: string;
        /**
         * Asset scale
         * @description The scale of amounts denoted in the corresponding asset code.
         */
        assetScale: number;
        /**
         * Receiver
         * Format: uri
         * @description The URL of the incoming payment that is being paid.
         */
        receiver: string;
        /**
         * Wallet Address
         * Format: uri
         * @description URL of a wallet address hosted by a Rafiki instance.
         */
        walletAddress: string;
      };
    };
    operations: {};
  };
}
