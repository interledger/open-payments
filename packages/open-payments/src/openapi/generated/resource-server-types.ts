/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/": {
    /**
     * Retrieve the public information of the Payment Pointer.
     *
     * This end-point should be open to anonymous requests as it allows clients to verify a Payment Pointer URL and get the basic information required to construct new transactions and discover the grant request URL.
     *
     * The content should be slow changing and cacheable for long periods. Servers SHOULD use cache control headers.
     */
    get: operations["get-payment-pointer"];
  };
  "/jwks.json": {
    /** Retrieve the public keys of the Payment Pointer. */
    get: operations["get-payment-pointer-keys"];
  };
  "/connections/{id}": {
    /**
     * *NB* Use server url specific to this path.
     *
     * Fetch new connection credentials for an ILP STREAM connection.
     *
     * A connection is an ephemeral resource that is created to accommodate new incoming payments.
     *
     * A new set of credential will be generated each time this API is called.
     */
    get: operations["get-ilp-stream-connection"];
    parameters: {
      path: {
        /** Sub-resource identifier */
        id: components["parameters"]["id"];
      };
    };
  };
  "/incoming-payments": {
    /** List all incoming payments on the payment pointer */
    get: operations["list-incoming-payments"];
    /**
     * A client MUST create an **incoming payment** resource before it is possible to send any payments to the payment pointer.
     *
     * When a client creates an **incoming payment** the receiving Account Servicing Entity generates unique payment details that can be used to address payments to the account and returns these details to the client as properties of the new **incoming payment**. Any payments received using those details are then associated with the **incoming payment**.
     *
     * All of the input parameters are _optional_.
     *
     * For example, the client could use the `metadata` property to store an external reference on the **incoming payment** and this can be shared with the account holder to assist with reconciliation.
     *
     * If `incomingAmount` is specified and the total received using the payment details equals or exceeds the specified `incomingAmount`, then the receiving Account Servicing Entity MUST reject any further payments and set `completed` to `true`.
     *
     * If an `expiresAt` value is defined, and the current date and time on the receiving Account Servicing Entity's systems exceeds that value, the receiving Account Servicing Entity MUST reject any further payments.
     */
    post: operations["create-incoming-payment"];
  };
  /** Create a new outgoing payment at the payment pointer. */
  "/outgoing-payments": {
    /** List all outgoing payments on the payment pointer */
    get: operations["list-outgoing-payments"];
    /**
     * An **outgoing payment** is a sub-resource of a payment pointer. It represents a payment from the payment pointer.
     *
     * Once created, it is already authorized and SHOULD be processed immediately. If payment fails, the Account Servicing Entity must mark the **outgoing payment** as `failed`.
     */
    post: operations["create-outgoing-payment"];
  };
  /** Create a new quote at the payment pointer. */
  "/quotes": {
    /** A **quote** is a sub-resource of a payment pointer. It represents a quote for a payment from the payment pointer. */
    post: operations["create-quote"];
  };
  "/incoming-payments/{id}": {
    /** A client can fetch the latest state of an incoming payment to determine the amount received into the payment pointer. */
    get: operations["get-incoming-payment"];
    parameters: {
      path: {
        /** Sub-resource identifier */
        id: components["parameters"]["id"];
      };
    };
  };
  "/incoming-payments/{id}/complete": {
    /**
     * A client with the appropriate permissions MAY mark a non-expired **incoming payment** as `completed` indicating that the client is not going to make any further payments toward this **incoming payment**, even though the full `incomingAmount` may not have been received.
     *
     * This indicates to the receiving Account Servicing Entity that it can begin any post processing of the payment such as generating account statements or notifying the account holder of the completed payment.
     */
    post: operations["complete-incoming-payment"];
    parameters: {
      path: {
        /** Sub-resource identifier */
        id: components["parameters"]["id"];
      };
    };
  };
  "/outgoing-payments/{id}": {
    /** A client can fetch the latest state of an outgoing payment. */
    get: operations["get-outgoing-payment"];
    parameters: {
      path: {
        /** Sub-resource identifier */
        id: components["parameters"]["id"];
      };
    };
  };
  "/quotes/{id}": {
    /** A client can fetch the latest state of a quote. */
    get: operations["get-quote"];
    parameters: {
      path: {
        /** Sub-resource identifier */
        id: components["parameters"]["id"];
      };
    };
  };
}

export interface components {
  schemas: {
    /**
     * Payment Pointer
     * @description A **payment pointer** resource is the root of the API and contains the public details of the financial account represented by the Payment Pointer that is also the service endpoint URL.
     */
    "payment-pointer": {
      /**
       * Format: uri
       * @description The URL identifying the payment pointer.
       */
      id: string;
      /** @description A public name for the account. This should be set by the account holder with their provider to provide a hint to counterparties as to the identity of the account holder. */
      publicName?: string;
      assetCode: external["schemas.yaml"]["components"]["schemas"]["assetCode"];
      assetScale: external["schemas.yaml"]["components"]["schemas"]["assetScale"];
      /**
       * Format: uri
       * @description The URL of the authorization server endpoint for getting grants and access tokens for this payment pointer.
       */
      authServer: string;
    };
    /**
     * JSON Web Key Set document
     * @description A JSON Web Key Set document according to [rfc7517](https://datatracker.ietf.org/doc/html/rfc7517) listing the keys associated with this payment pointer. These keys are used to sign requests made by this payment pointer.
     */
    "json-web-key-set": {
      keys: components["schemas"]["json-web-key"][];
    };
    /**
     * ILP Stream Connection
     * @description An **ILP STREAM Connection** is an endpoint that returns unique STREAM connection credentials to establish a STREAM connection to the underlying account.
     */
    "ilp-stream-connection": {
      /**
       * Format: uri
       * @description The URL identifying the endpoint.
       */
      id: string;
      /** @description The ILP address to use when establishing a STREAM connection. */
      ilpAddress: string;
      /** @description The base64 url-encoded shared secret to use when establishing a STREAM connection. */
      sharedSecret: string;
      assetCode: external["schemas.yaml"]["components"]["schemas"]["assetCode"];
      assetScale: external["schemas.yaml"]["components"]["schemas"]["assetScale"];
    };
    /**
     * Incoming Payment
     * @description An **incoming payment** resource represents a payment that will be, is currently being, or has been received by the account.
     */
    "incoming-payment": {
      /**
       * Format: uri
       * @description The URL identifying the incoming payment.
       */
      id: string;
      /**
       * Format: uri
       * @description The URL of the payment pointer this payment is being made into.
       */
      paymentPointer: string;
      /** @description Describes whether the incoming payment has completed receiving fund. */
      completed: boolean;
      /** @description The maximum amount that should be paid into the payment pointer under this incoming payment. */
      incomingAmount?: external["schemas.yaml"]["components"]["schemas"]["amount"];
      /** @description The total amount that has been paid into the payment pointer under this incoming payment. */
      receivedAmount: external["schemas.yaml"]["components"]["schemas"]["amount"];
      /**
       * Format: date-time
       * @description The date and time when payments under this incoming payment will no longer be accepted.
       */
      expiresAt?: string;
      /** @description Additional metadata associated with the incoming payment. (Optional) */
      metadata?: { [key: string]: unknown };
      /**
       * Format: date-time
       * @description The date and time when the incoming payment was created.
       */
      createdAt: string;
      /**
       * Format: date-time
       * @description The date and time when the incoming payment was updated.
       */
      updatedAt: string;
    };
    /**
     * Incoming Payment with Connection
     * @description An **incoming payment** resource with the Interledger STREAM Connection to use to pay into the payment pointer under this incoming payment.
     */
    "incoming-payment-with-connection": components["schemas"]["incoming-payment"] & {
      ilpStreamConnection?: components["schemas"]["ilp-stream-connection"];
    };
    /**
     * Incoming Payment with Connection
     * @description An **incoming payment** resource with the url for the Interledger STREAM Connection resource to use to pay into the payment pointer under this incoming payment.
     */
    "incoming-payment-with-connection-url": components["schemas"]["incoming-payment"] & {
      /**
       * Format: uri
       * @description Endpoint that returns unique STREAM connection credentials to establish a STREAM connection to the underlying account.
       */
      ilpStreamConnection?: string;
    };
    /**
     * Outgoing Payment
     * @description An **outgoing payment** resource represents a payment that will be, is currently being, or has previously been, sent from the payment pointer.
     */
    "outgoing-payment": {
      /**
       * Format: uri
       * @description The URL identifying the outgoing payment.
       */
      id: string;
      /**
       * Format: uri
       * @description The URL of the payment pointer from which this payment is sent.
       */
      paymentPointer: string;
      /**
       * Format: uri
       * @description The URL of the quote defining this payment's amounts.
       */
      quoteId?: string;
      /** @description Describes whether the payment failed to send its full amount. */
      failed?: boolean;
      /** @description The URL of the incoming payment or ILP STREAM Connection that is being paid. */
      receiver: external["schemas.yaml"]["components"]["schemas"]["receiver"];
      /** @description The total amount that should be received by the receiver when this outgoing payment has been paid. */
      receiveAmount: external["schemas.yaml"]["components"]["schemas"]["amount"];
      /** @description The total amount that should be deducted from the sender's account when this outgoing payment has been paid. */
      debitAmount: external["schemas.yaml"]["components"]["schemas"]["amount"];
      /** @description The total amount that has been sent under this outgoing payment. */
      sentAmount: external["schemas.yaml"]["components"]["schemas"]["amount"];
      /** @description Additional metadata associated with the outgoing payment. (Optional) */
      metadata?: { [key: string]: unknown };
      /**
       * Format: date-time
       * @description The date and time when the outgoing payment was created.
       */
      createdAt: string;
      /**
       * Format: date-time
       * @description The date and time when the outgoing payment was updated.
       */
      updatedAt: string;
    };
    /**
     * Quote
     * @description A **quote** resource represents the quoted amount details with which an Outgoing Payment may be created.
     */
    quote: {
      /**
       * Format: uri
       * @description The URL identifying the quote.
       */
      id: string;
      /**
       * Format: uri
       * @description The URL of the payment pointer from which this quote's payment would be sent.
       */
      paymentPointer: string;
      /** @description The URL of the incoming payment or ILP STREAM Connection that the quote is created for. */
      receiver: external["schemas.yaml"]["components"]["schemas"]["receiver"];
      /** @description The total amount that should be received by the receiver when the corresponding outgoing payment has been paid. */
      receiveAmount: external["schemas.yaml"]["components"]["schemas"]["amount"];
      /** @description The total amount that should be deducted from the sender's account when the corresponding outgoing payment has been paid. */
      debitAmount: external["schemas.yaml"]["components"]["schemas"]["amount"];
      /** @description The date and time when the calculated `debitAmount` is no longer valid. */
      expiresAt?: string;
      /**
       * Format: date-time
       * @description The date and time when the quote was created.
       */
      createdAt: string;
    };
    "page-info": {
      /** @description Cursor corresponding to the first element in the result array. */
      startCursor?: string;
      /** @description Cursor corresponding to the last element in the result array. */
      endCursor?: string;
      /** @description Describes whether the data set has further entries. */
      hasNextPage: boolean;
      /** @description Describes whether the data set has previous entries. */
      hasPreviousPage: boolean;
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
  responses: {
    /** Authorization required */
    401: unknown;
    /** Forbidden */
    403: unknown;
  };
  parameters: {
    /** @description The cursor key to list from. */
    cursor: string;
    /** @description The number of items to return after the cursor. */
    first: number;
    /** @description The number of items to return before the cursor. */
    last: number;
    /** @description Sub-resource identifier */
    id: string;
    /** @description The signature generated based on the Signature-Input, using the signing algorithm specified in the "alg" field of the JWK. */
    signature: string;
    /** @description The Signature-Input field is a Dictionary structured field containing the metadata for one or more message signatures generated from components within the HTTP message.  Each member describes a single message signature.  The member's key is the label that uniquely identifies the message signature within the context of the HTTP message.  The member's value is the serialization of the covered components Inner List plus all signature metadata parameters identified by the label.  The following components MUST be included: - "@method" - "@target-uri" - "authorization".  When the message contains a request body, the covered components MUST also include the following: - "content-digest"  The keyid parameter of the signature MUST be set to the kid value of the JWK.      See [ietf-httpbis-message-signatures](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures#section-4.1) for more details. */
    "signature-input": string;
  };
}

export interface operations {
  /**
   * Retrieve the public information of the Payment Pointer.
   *
   * This end-point should be open to anonymous requests as it allows clients to verify a Payment Pointer URL and get the basic information required to construct new transactions and discover the grant request URL.
   *
   * The content should be slow changing and cacheable for long periods. Servers SHOULD use cache control headers.
   */
  "get-payment-pointer": {
    responses: {
      /** Payment Pointer Found */
      200: {
        content: {
          "application/json": components["schemas"]["payment-pointer"];
        };
      };
      /** Payment Pointer Not Found */
      404: unknown;
    };
  };
  /** Retrieve the public keys of the Payment Pointer. */
  "get-payment-pointer-keys": {
    responses: {
      /** JWKS Document Found */
      200: {
        content: {
          "application/json": components["schemas"]["json-web-key-set"];
        };
      };
      /** JWKS Document Not Found */
      404: unknown;
    };
  };
  /**
   * *NB* Use server url specific to this path.
   *
   * Fetch new connection credentials for an ILP STREAM connection.
   *
   * A connection is an ephemeral resource that is created to accommodate new incoming payments.
   *
   * A new set of credential will be generated each time this API is called.
   */
  "get-ilp-stream-connection": {
    parameters: {
      path: {
        /** Sub-resource identifier */
        id: components["parameters"]["id"];
      };
    };
    responses: {
      /** Connection Found */
      200: {
        content: {
          "application/json": components["schemas"]["ilp-stream-connection"];
        };
      };
      /** Connection Not Found */
      404: unknown;
    };
  };
  /** List all incoming payments on the payment pointer */
  "list-incoming-payments": {
    parameters: {
      query: {
        /** The cursor key to list from. */
        cursor?: components["parameters"]["cursor"];
        /** The number of items to return after the cursor. */
        first?: components["parameters"]["first"];
        /** The number of items to return before the cursor. */
        last?: components["parameters"]["last"];
      };
      header: {
        /** The Signature-Input field is a Dictionary structured field containing the metadata for one or more message signatures generated from components within the HTTP message.  Each member describes a single message signature.  The member's key is the label that uniquely identifies the message signature within the context of the HTTP message.  The member's value is the serialization of the covered components Inner List plus all signature metadata parameters identified by the label.  The following components MUST be included: - "@method" - "@target-uri" - "authorization".  When the message contains a request body, the covered components MUST also include the following: - "content-digest"  The keyid parameter of the signature MUST be set to the kid value of the JWK.      See [ietf-httpbis-message-signatures](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures#section-4.1) for more details. */
        "Signature-Input": components["parameters"]["signature-input"];
        /** The signature generated based on the Signature-Input, using the signing algorithm specified in the "alg" field of the JWK. */
        Signature: components["parameters"]["signature"];
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": {
            pagination?: components["schemas"]["page-info"];
            result?: components["schemas"]["incoming-payment-with-connection-url"][];
          };
        };
      };
      401: components["responses"]["401"];
      403: components["responses"]["403"];
    };
  };
  /**
   * A client MUST create an **incoming payment** resource before it is possible to send any payments to the payment pointer.
   *
   * When a client creates an **incoming payment** the receiving Account Servicing Entity generates unique payment details that can be used to address payments to the account and returns these details to the client as properties of the new **incoming payment**. Any payments received using those details are then associated with the **incoming payment**.
   *
   * All of the input parameters are _optional_.
   *
   * For example, the client could use the `metadata` property to store an external reference on the **incoming payment** and this can be shared with the account holder to assist with reconciliation.
   *
   * If `incomingAmount` is specified and the total received using the payment details equals or exceeds the specified `incomingAmount`, then the receiving Account Servicing Entity MUST reject any further payments and set `completed` to `true`.
   *
   * If an `expiresAt` value is defined, and the current date and time on the receiving Account Servicing Entity's systems exceeds that value, the receiving Account Servicing Entity MUST reject any further payments.
   */
  "create-incoming-payment": {
    parameters: {
      header: {
        /** The Signature-Input field is a Dictionary structured field containing the metadata for one or more message signatures generated from components within the HTTP message.  Each member describes a single message signature.  The member's key is the label that uniquely identifies the message signature within the context of the HTTP message.  The member's value is the serialization of the covered components Inner List plus all signature metadata parameters identified by the label.  The following components MUST be included: - "@method" - "@target-uri" - "authorization".  When the message contains a request body, the covered components MUST also include the following: - "content-digest"  The keyid parameter of the signature MUST be set to the kid value of the JWK.      See [ietf-httpbis-message-signatures](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures#section-4.1) for more details. */
        "Signature-Input": components["parameters"]["signature-input"];
        /** The signature generated based on the Signature-Input, using the signing algorithm specified in the "alg" field of the JWK. */
        Signature: components["parameters"]["signature"];
      };
    };
    responses: {
      /** Incoming Payment Created */
      201: {
        content: {
          "application/json": components["schemas"]["incoming-payment-with-connection"];
        };
      };
      401: components["responses"]["401"];
      403: components["responses"]["403"];
    };
    /**
     * A subset of the incoming payments schema is accepted as input to create a new incoming payment.
     *
     * The `incomingAmount` must use the same `assetCode` and `assetScale` as the payment pointer.
     */
    requestBody: {
      content: {
        "application/json": {
          /** @description The maximum amount that should be paid into the payment pointer under this incoming payment. */
          incomingAmount?: external["schemas.yaml"]["components"]["schemas"]["amount"];
          /**
           * Format: date-time
           * @description The date and time when payments into the incoming payment must no longer be accepted.
           */
          expiresAt?: string;
          /** @description Additional metadata associated with the incoming payment. (Optional) */
          metadata?: { [key: string]: unknown };
        };
      };
    };
  };
  /** List all outgoing payments on the payment pointer */
  "list-outgoing-payments": {
    parameters: {
      query: {
        /** The cursor key to list from. */
        cursor?: components["parameters"]["cursor"];
        /** The number of items to return after the cursor. */
        first?: components["parameters"]["first"];
        /** The number of items to return before the cursor. */
        last?: components["parameters"]["last"];
      };
      header: {
        /** The Signature-Input field is a Dictionary structured field containing the metadata for one or more message signatures generated from components within the HTTP message.  Each member describes a single message signature.  The member's key is the label that uniquely identifies the message signature within the context of the HTTP message.  The member's value is the serialization of the covered components Inner List plus all signature metadata parameters identified by the label.  The following components MUST be included: - "@method" - "@target-uri" - "authorization".  When the message contains a request body, the covered components MUST also include the following: - "content-digest"  The keyid parameter of the signature MUST be set to the kid value of the JWK.      See [ietf-httpbis-message-signatures](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures#section-4.1) for more details. */
        "Signature-Input": components["parameters"]["signature-input"];
        /** The signature generated based on the Signature-Input, using the signing algorithm specified in the "alg" field of the JWK. */
        Signature: components["parameters"]["signature"];
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": {
            pagination?: components["schemas"]["page-info"];
            result?: components["schemas"]["outgoing-payment"][];
          };
        };
      };
      401: components["responses"]["401"];
      403: components["responses"]["403"];
    };
  };
  /**
   * An **outgoing payment** is a sub-resource of a payment pointer. It represents a payment from the payment pointer.
   *
   * Once created, it is already authorized and SHOULD be processed immediately. If payment fails, the Account Servicing Entity must mark the **outgoing payment** as `failed`.
   */
  "create-outgoing-payment": {
    parameters: {
      header: {
        /** The Signature-Input field is a Dictionary structured field containing the metadata for one or more message signatures generated from components within the HTTP message.  Each member describes a single message signature.  The member's key is the label that uniquely identifies the message signature within the context of the HTTP message.  The member's value is the serialization of the covered components Inner List plus all signature metadata parameters identified by the label.  The following components MUST be included: - "@method" - "@target-uri" - "authorization".  When the message contains a request body, the covered components MUST also include the following: - "content-digest"  The keyid parameter of the signature MUST be set to the kid value of the JWK.      See [ietf-httpbis-message-signatures](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures#section-4.1) for more details. */
        "Signature-Input": components["parameters"]["signature-input"];
        /** The signature generated based on the Signature-Input, using the signing algorithm specified in the "alg" field of the JWK. */
        Signature: components["parameters"]["signature"];
      };
    };
    responses: {
      /** Outgoing Payment Created */
      201: {
        content: {
          "application/json": components["schemas"]["outgoing-payment"];
        };
      };
      401: components["responses"]["401"];
      403: components["responses"]["403"];
    };
    /**
     * A subset of the outgoing payments schema is accepted as input to create a new outgoing payment.
     *
     * The `debitAmount` must use the same `assetCode` and `assetScale` as the payment pointer.
     */
    requestBody: {
      content: {
        "application/json": {
          /**
           * Format: uri
           * @description The URL of the quote defining this payment's amounts.
           */
          quoteId: string;
          /** @description Additional metadata associated with the outgoing payment. (Optional) */
          metadata?: { [key: string]: unknown };
        };
      };
    };
  };
  /** A **quote** is a sub-resource of a payment pointer. It represents a quote for a payment from the payment pointer. */
  "create-quote": {
    parameters: {
      header: {
        /** The Signature-Input field is a Dictionary structured field containing the metadata for one or more message signatures generated from components within the HTTP message.  Each member describes a single message signature.  The member's key is the label that uniquely identifies the message signature within the context of the HTTP message.  The member's value is the serialization of the covered components Inner List plus all signature metadata parameters identified by the label.  The following components MUST be included: - "@method" - "@target-uri" - "authorization".  When the message contains a request body, the covered components MUST also include the following: - "content-digest"  The keyid parameter of the signature MUST be set to the kid value of the JWK.      See [ietf-httpbis-message-signatures](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures#section-4.1) for more details. */
        "Signature-Input": components["parameters"]["signature-input"];
        /** The signature generated based on the Signature-Input, using the signing algorithm specified in the "alg" field of the JWK. */
        Signature: components["parameters"]["signature"];
      };
    };
    responses: {
      /** Quote Created */
      201: {
        content: {
          "application/json": components["schemas"]["quote"];
        };
      };
      /** No amount was provided and no amount could be inferred from the receiver. */
      400: unknown;
      401: components["responses"]["401"];
      403: components["responses"]["403"];
    };
    /**
     * A subset of the quotes schema is accepted as input to create a new quote.
     *
     * The quote must be created with a (`debitAmount` xor `receiveAmount`) unless the `receiver` is an Incoming Payment which has an `incomingAmount`.
     */
    requestBody: {
      content: {
        "application/json":
          | {
              receiver: external["schemas.yaml"]["components"]["schemas"]["receiver"];
            }
          | {
              receiver: external["schemas.yaml"]["components"]["schemas"]["receiver"];
              /** @description The fixed amount that would be paid into the receiving payment pointer given a successful outgoing payment. */
              receiveAmount: external["schemas.yaml"]["components"]["schemas"]["amount"];
            }
          | {
              receiver: external["schemas.yaml"]["components"]["schemas"]["receiver"];
              /** @description The fixed amount that would be sent from the sending payment pointer given a successful outgoing payment. */
              debitAmount: external["schemas.yaml"]["components"]["schemas"]["amount"];
            };
      };
    };
  };
  /** A client can fetch the latest state of an incoming payment to determine the amount received into the payment pointer. */
  "get-incoming-payment": {
    parameters: {
      path: {
        /** Sub-resource identifier */
        id: components["parameters"]["id"];
      };
      header: {
        /** The Signature-Input field is a Dictionary structured field containing the metadata for one or more message signatures generated from components within the HTTP message.  Each member describes a single message signature.  The member's key is the label that uniquely identifies the message signature within the context of the HTTP message.  The member's value is the serialization of the covered components Inner List plus all signature metadata parameters identified by the label.  The following components MUST be included: - "@method" - "@target-uri" - "authorization".  When the message contains a request body, the covered components MUST also include the following: - "content-digest"  The keyid parameter of the signature MUST be set to the kid value of the JWK.      See [ietf-httpbis-message-signatures](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures#section-4.1) for more details. */
        "Signature-Input": components["parameters"]["signature-input"];
        /** The signature generated based on the Signature-Input, using the signing algorithm specified in the "alg" field of the JWK. */
        Signature: components["parameters"]["signature"];
      };
    };
    responses: {
      /** Incoming Payment Found */
      200: {
        content: {
          "application/json": components["schemas"]["incoming-payment-with-connection"];
        };
      };
      401: components["responses"]["401"];
      403: components["responses"]["403"];
      /** Incoming Payment Not Found */
      404: unknown;
    };
  };
  /**
   * A client with the appropriate permissions MAY mark a non-expired **incoming payment** as `completed` indicating that the client is not going to make any further payments toward this **incoming payment**, even though the full `incomingAmount` may not have been received.
   *
   * This indicates to the receiving Account Servicing Entity that it can begin any post processing of the payment such as generating account statements or notifying the account holder of the completed payment.
   */
  "complete-incoming-payment": {
    parameters: {
      path: {
        /** Sub-resource identifier */
        id: components["parameters"]["id"];
      };
      header: {
        /** The Signature-Input field is a Dictionary structured field containing the metadata for one or more message signatures generated from components within the HTTP message.  Each member describes a single message signature.  The member's key is the label that uniquely identifies the message signature within the context of the HTTP message.  The member's value is the serialization of the covered components Inner List plus all signature metadata parameters identified by the label.  The following components MUST be included: - "@method" - "@target-uri" - "authorization".  When the message contains a request body, the covered components MUST also include the following: - "content-digest"  The keyid parameter of the signature MUST be set to the kid value of the JWK.      See [ietf-httpbis-message-signatures](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures#section-4.1) for more details. */
        "Signature-Input": components["parameters"]["signature-input"];
        /** The signature generated based on the Signature-Input, using the signing algorithm specified in the "alg" field of the JWK. */
        Signature: components["parameters"]["signature"];
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["incoming-payment"];
        };
      };
      401: components["responses"]["401"];
      403: components["responses"]["403"];
      /** Incoming Payment Not Found */
      404: unknown;
    };
  };
  /** A client can fetch the latest state of an outgoing payment. */
  "get-outgoing-payment": {
    parameters: {
      path: {
        /** Sub-resource identifier */
        id: components["parameters"]["id"];
      };
      header: {
        /** The Signature-Input field is a Dictionary structured field containing the metadata for one or more message signatures generated from components within the HTTP message.  Each member describes a single message signature.  The member's key is the label that uniquely identifies the message signature within the context of the HTTP message.  The member's value is the serialization of the covered components Inner List plus all signature metadata parameters identified by the label.  The following components MUST be included: - "@method" - "@target-uri" - "authorization".  When the message contains a request body, the covered components MUST also include the following: - "content-digest"  The keyid parameter of the signature MUST be set to the kid value of the JWK.      See [ietf-httpbis-message-signatures](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures#section-4.1) for more details. */
        "Signature-Input": components["parameters"]["signature-input"];
        /** The signature generated based on the Signature-Input, using the signing algorithm specified in the "alg" field of the JWK. */
        Signature: components["parameters"]["signature"];
      };
    };
    responses: {
      /** Outgoing Payment Found */
      200: {
        content: {
          "application/json": components["schemas"]["outgoing-payment"];
        };
      };
      401: components["responses"]["401"];
      403: components["responses"]["403"];
      /** Outgoing Payment Not Found */
      404: unknown;
    };
  };
  /** A client can fetch the latest state of a quote. */
  "get-quote": {
    parameters: {
      path: {
        /** Sub-resource identifier */
        id: components["parameters"]["id"];
      };
      header: {
        /** The Signature-Input field is a Dictionary structured field containing the metadata for one or more message signatures generated from components within the HTTP message.  Each member describes a single message signature.  The member's key is the label that uniquely identifies the message signature within the context of the HTTP message.  The member's value is the serialization of the covered components Inner List plus all signature metadata parameters identified by the label.  The following components MUST be included: - "@method" - "@target-uri" - "authorization".  When the message contains a request body, the covered components MUST also include the following: - "content-digest"  The keyid parameter of the signature MUST be set to the kid value of the JWK.      See [ietf-httpbis-message-signatures](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures#section-4.1) for more details. */
        "Signature-Input": components["parameters"]["signature-input"];
        /** The signature generated based on the Signature-Input, using the signing algorithm specified in the "alg" field of the JWK. */
        Signature: components["parameters"]["signature"];
      };
    };
    responses: {
      /** Quote Found */
      200: {
        content: {
          "application/json": components["schemas"]["quote"];
        };
      };
      401: components["responses"]["401"];
      403: components["responses"]["403"];
      /** Quote Not Found */
      404: unknown;
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
         * @description The URL of the incoming payment or ILP STREAM connection that is being paid.
         */
        receiver: string;
      };
    };
    operations: {};
  };
}
