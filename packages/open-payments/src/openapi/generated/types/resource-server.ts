/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/incoming-payments": {
    /** List all incoming payments on the wallet address */
    get: operations["list-incoming-payments"];
    /**
     * A client MUST create an **incoming payment** resource before it is possible to send any payments to the wallet address.
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
  /** Create a new outgoing payment at the wallet address. */
  "/outgoing-payments": {
    /** List all outgoing payments on the wallet address */
    get: operations["list-outgoing-payments"];
    /**
     * An **outgoing payment** is a sub-resource of a wallet address. It represents a payment from the wallet address.
     *
     * Once created, it is already authorized and SHOULD be processed immediately. If payment fails, the Account Servicing Entity must mark the **outgoing payment** as `failed`.
     */
    post: operations["create-outgoing-payment"];
  };
  /** Create a new quote at the wallet address. */
  "/quotes": {
    /** A **quote** is a sub-resource of a wallet address. It represents a quote for a payment from the wallet address. */
    post: operations["create-quote"];
  };
  "/incoming-payments/{id}": {
    /** A client can fetch the latest state of an incoming payment to determine the amount received into the wallet address. */
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
       * @description The URL of the wallet address this payment is being made into.
       */
      walletAddress: string;
      /** @description Describes whether the incoming payment has completed receiving fund. */
      completed: boolean;
      /** @description The maximum amount that should be paid into the wallet address under this incoming payment. */
      incomingAmount?: external["schemas.yaml"]["components"]["schemas"]["amount"];
      /** @description The total amount that has been paid into the wallet address under this incoming payment. */
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
     * Incoming Payment with payment methods
     * @description An **incoming payment** resource with public details.
     */
    "incoming-payment-with-methods": components["schemas"]["incoming-payment"] & {
      /** @description The list of payment methods supported by this incoming payment. */
      methods: Partial<components["schemas"]["ilp-payment-method"]>[];
    };
    /**
     * Public Incoming Payment
     * @description An **incoming payment** resource with public details.
     */
    "public-incoming-payment": {
      receivedAmount?: external["schemas.yaml"]["components"]["schemas"]["amount"];
      /**
       * Format: uri
       * @description The URL of the authorization server endpoint for getting grants and access tokens for this wallet address.
       */
      authServer: string;
    };
    /**
     * Outgoing Payment
     * @description An **outgoing payment** resource represents a payment that will be, is currently being, or has previously been, sent from the wallet address.
     */
    "outgoing-payment": {
      /**
       * Format: uri
       * @description The URL identifying the outgoing payment.
       */
      id: string;
      /**
       * Format: uri
       * @description The URL of the wallet address from which this payment is sent.
       */
      walletAddress: string;
      /**
       * Format: uri
       * @description The URL of the quote defining this payment's amounts.
       */
      quoteId?: string;
      /** @description Describes whether the payment failed to send its full amount. */
      failed?: boolean;
      /** @description The URL of the incoming payment that is being paid. */
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
       * @description The URL of the wallet address from which this quote's payment would be sent.
       */
      walletAddress: string;
      /** @description The URL of the incoming payment that the quote is created for. */
      receiver: external["schemas.yaml"]["components"]["schemas"]["receiver"];
      /** @description The total amount that should be received by the receiver when the corresponding outgoing payment has been paid. */
      receiveAmount: external["schemas.yaml"]["components"]["schemas"]["amount"];
      /** @description The total amount that should be deducted from the sender's account when the corresponding outgoing payment has been paid. */
      debitAmount: external["schemas.yaml"]["components"]["schemas"]["amount"];
      method: components["schemas"]["payment-method"];
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
    "payment-method": "ilp";
    "ilp-payment-method": {
      type: "ilp";
      /** @description The ILP address to use when establishing a STREAM connection. */
      ilpAddress: string;
      /** @description The base64 url-encoded shared secret to use when establishing a STREAM connection. */
      sharedSecret: string;
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
    /** @description URL of a wallet address hosted by a Rafiki instance. */
    "wallet-address": string;
    /** @description The signature generated based on the Signature-Input, using the signing algorithm specified in the "alg" field of the JWK. */
    signature: components["parameters"]["optional-signature"];
    /** @description The Signature-Input field is a Dictionary structured field containing the metadata for one or more message signatures generated from components within the HTTP message.  Each member describes a single message signature.  The member's key is the label that uniquely identifies the message signature within the context of the HTTP message.  The member's value is the serialization of the covered components Inner List plus all signature metadata parameters identified by the label.  The following components MUST be included: - "@method" - "@target-uri" - "authorization".  When the message contains a request body, the covered components MUST also include the following: - "content-digest"  The keyid parameter of the signature MUST be set to the kid value of the JWK.      See [ietf-httpbis-message-signatures](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures#section-4.1) for more details. */
    "signature-input": components["parameters"]["optional-signature-input"];
    /** @description The signature generated based on the Signature-Input, using the signing algorithm specified in the "alg" field of the JWK. */
    "optional-signature": string;
    /** @description The Signature-Input field is a Dictionary structured field containing the metadata for one or more message signatures generated from components within the HTTP message.  Each member describes a single message signature.  The member's key is the label that uniquely identifies the message signature within the context of the HTTP message.  The member's value is the serialization of the covered components Inner List plus all signature metadata parameters identified by the label.  The following components MUST be included: - "@method" - "@target-uri" - "authorization".  When the message contains a request body, the covered components MUST also include the following: - "content-digest"  The keyid parameter of the signature MUST be set to the kid value of the JWK.      See [ietf-httpbis-message-signatures](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures#section-4.1) for more details. */
    "optional-signature-input": string;
  };
}

export interface operations {
  /** List all incoming payments on the wallet address */
  "list-incoming-payments": {
    parameters: {
      query: {
        /** URL of a wallet address hosted by a Rafiki instance. */
        "wallet-address": components["parameters"]["wallet-address"];
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
            result?: components["schemas"]["incoming-payment"][];
          };
        };
      };
      401: components["responses"]["401"];
      403: components["responses"]["403"];
    };
  };
  /**
   * A client MUST create an **incoming payment** resource before it is possible to send any payments to the wallet address.
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
          "application/json": components["schemas"]["incoming-payment-with-methods"];
        };
      };
      401: components["responses"]["401"];
      403: components["responses"]["403"];
    };
    /**
     * A subset of the incoming payments schema is accepted as input to create a new incoming payment.
     *
     * The `incomingAmount` must use the same `assetCode` and `assetScale` as the wallet address.
     */
    requestBody: {
      content: {
        "application/json": {
          walletAddress: external["schemas.yaml"]["components"]["schemas"]["walletAddress"];
          /** @description The maximum amount that should be paid into the wallet address under this incoming payment. */
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
  /** List all outgoing payments on the wallet address */
  "list-outgoing-payments": {
    parameters: {
      query: {
        /** URL of a wallet address hosted by a Rafiki instance. */
        "wallet-address": components["parameters"]["wallet-address"];
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
   * An **outgoing payment** is a sub-resource of a wallet address. It represents a payment from the wallet address.
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
     * The `debitAmount` must use the same `assetCode` and `assetScale` as the wallet address.
     */
    requestBody: {
      content: {
        "application/json": {
          walletAddress: external["schemas.yaml"]["components"]["schemas"]["walletAddress"];
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
  /** A **quote** is a sub-resource of a wallet address. It represents a quote for a payment from the wallet address. */
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
              walletAddress: external["schemas.yaml"]["components"]["schemas"]["walletAddress"];
              receiver: external["schemas.yaml"]["components"]["schemas"]["receiver"];
              method: components["schemas"]["payment-method"];
            }
          | {
              walletAddress: external["schemas.yaml"]["components"]["schemas"]["walletAddress"];
              receiver: external["schemas.yaml"]["components"]["schemas"]["receiver"];
              method: components["schemas"]["payment-method"];
              /** @description The fixed amount that would be paid into the receiving wallet address given a successful outgoing payment. */
              receiveAmount: external["schemas.yaml"]["components"]["schemas"]["amount"];
            }
          | {
              walletAddress: external["schemas.yaml"]["components"]["schemas"]["walletAddress"];
              receiver: external["schemas.yaml"]["components"]["schemas"]["receiver"];
              method: components["schemas"]["payment-method"];
              /** @description The fixed amount that would be sent from the sending wallet address given a successful outgoing payment. */
              debitAmount: external["schemas.yaml"]["components"]["schemas"]["amount"];
            };
      };
    };
  };
  /** A client can fetch the latest state of an incoming payment to determine the amount received into the wallet address. */
  "get-incoming-payment": {
    parameters: {
      path: {
        /** Sub-resource identifier */
        id: components["parameters"]["id"];
      };
      header: {
        /** The Signature-Input field is a Dictionary structured field containing the metadata for one or more message signatures generated from components within the HTTP message.  Each member describes a single message signature.  The member's key is the label that uniquely identifies the message signature within the context of the HTTP message.  The member's value is the serialization of the covered components Inner List plus all signature metadata parameters identified by the label.  The following components MUST be included: - "@method" - "@target-uri" - "authorization".  When the message contains a request body, the covered components MUST also include the following: - "content-digest"  The keyid parameter of the signature MUST be set to the kid value of the JWK.      See [ietf-httpbis-message-signatures](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures#section-4.1) for more details. */
        "Signature-Input"?: components["parameters"]["optional-signature-input"];
        /** The signature generated based on the Signature-Input, using the signing algorithm specified in the "alg" field of the JWK. */
        Signature?: components["parameters"]["optional-signature"];
      };
    };
    responses: {
      /** Incoming Payment Found */
      200: {
        content: {
          "application/json": Partial<
            components["schemas"]["incoming-payment-with-methods"]
          > &
            Partial<components["schemas"]["public-incoming-payment"]>;
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