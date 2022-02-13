# Open Payments v2

Open Payments is a standardised HTTP-based API, and multi-party protocol using the API, that can be provided by any account servicing payment service provider (ASPSP) to enable “programmable money” for their user’s accounts.

Taking inspiration from Open Banking and the growing popularity of account-to-account (A2A) payments, the Open Payments APIs expose mechanisms for account holders (and third-parties with delegated access) to accept and initiate payments to and from an account, all via APIs.

## Accounts and Payment Pointers

At the heart of all interactions in Open Payments is a financial account, i.e. an account with a balance and a currency. Access to this account via Open Payments is always via a URL (which we call a **Payment Pointer**).

It’s not relevant to Open Payments who the ASPSP is or what type of entity they are. The ASPSP could be a bank, a mobile money provider, or a crypto wallet as long as the ASPSP is able to send and receive payments to the other ASPSPs on the network.

> _The ability to execute account to account transfers between providers is possible thanks to [Interledger](https://interledger.org). Deeper discussion of Interledger is out of scope of this document._

A single account can have one or more Payment Pointers. The Payment Pointer is a **proxy identifier** for the underlying account. 

Payment Pointers have a shortened form which makes them easier to transcribe and recognize as special purpose URLs that can be used for Open Payments. E.g. The Payment Pointer `https://bank.example/alice` can also be written as `$bank.example/alice`.

>_**TODO:** Multiple community members have highlighted that the use of the dollar `$` symbol is quite specific to the US and ignores the use of otyher symbols in other countries._

An account holder can have multiple Payment Pointers issued for their account to prevent the Payment Pointer becoming a tracking vector. This loose coupling also allows Payment Pointers to be disabled or even linked to a new account (although there are considerations that must be made before allowing this) without affecting the underlying account.

For any external parties, a Payment Pointer is as good as an account. Any two distinct Payment Pointers should be treated as distinct accounts by clients even if they are proxies for the same underlying account.

Permissions granted to a client for access to an account via one Payment Pointer are not automatically usable to access the same account via other Payment Pointers.

The Payment Pointer URL and parts of the Open Payments protocol (the role of the resource server as described below) are served by the ASPSP.

Using URLs solves one of the biggest issues with existing account to account payments, discoverability and interaction. URLs (Universal Resource Locators) have been used on the Web for decades to provide a way for clients to directly locate a resource and begin interacting with it (via HTTP). Payment Pointers are both a proxy account identifier and resource locator for the account in order to access it via APIs and begin an interaction with the ASPSP.

Using URLs as account proxies is also preferable to overloading other identifiers such as email addresses and MSISDNs as these proxies have no standard for interaction.

Given a URL that represents an account, Open Payments defines a standard HTTP-based interaction between a client and the ASPSP behind the URL to execute a variety of financial transactions including sending and receiving payments from and to the account, and getting account information.

## Grant Negotiation and Authorization Protocol

The [Grant Negotiation and Authorization Protocol (GNAP)](https://https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol) is a new protocol being developed at the IETF to succeed OAuth 2.0 for delegated access to resources. 

Open Payments v2 is leveraging GNAP to define a standard mechanism for delegating access to an account. Grants provide fine-grained control over the operations and limits/amounts that a client is permitted to transact on the account.

GNAP clearly separates the roles of the **resource server** (where the operations are performed and to which access is granted) and the **authorisation server** (where the access tokens are requested). 

In Open Payments, the ASPSP is the resource server (and the account is the resource), meaning that the authorization of access to the account can be separated from the account provider if desired. The authorization service can even be fulfilled by multiple federated providers such as the Interledger Foundation, a service nominated by the account holder themselves and the ASPSP.

An open source implementation of an Open Payments resource server, [Rafiki](https://https://github.com/interledger/rafiki), is being developed. As Rafiki is simply the resource server, the implementation can be quite opinionated.

In contrast, an ASPSP that deploys Rafiki is free to implement proprietary logic for account holder authentication and gathering consent as this is the role of the authorization server and often a function that is already quite mature at an ASPSP.


## Open Payments vs Open Banking

Open Payments attempts to improve upon existing Open Banking standards (as defined in the UK, EU and other jurisdictions) in two fundamental ways. 

First, it allows for scenarios where clients dynamically register and engage with the APIs without needing to pre-register with the ASPSP. This allows for a truly distributed and federated payment ecosystem with global reach and no dependence on any particular underlying account type or settlement system. Existing Open Banking ecosystems are dominated by aggregators and intermediaries making it impossible for an independent 3rd-party such as a small merchant, to use payment initiation APIs directly against their customer’s accounts.

Second, Open Payments assumes the presence of a universal payment rail between all accounts (global A2A payments), based on the Interledger protocol, where all counterparty accounts are also addressable as URLs, making Open Payments a borderless, global platform that fits naturally into the Internet and Web economies.

The goal of Open Payments is to define a standard that is adopted by all ASPSPs (banks, digital wallets, mobile money providers etc.), creating an application layer for the Internet of Value. This would allow applications to integrate payments directly into their products without requiring users to create new accounts for every application.

# API

The remainder of this document is the proposed v2 API. 

It is a simple REST API with only 3 resource types: `account`, `incoming-payment` and `outgoing-payment`. 

It leverages HTTP content type negotiation to overload endpoint functionality and reduce the number of requests required to complete common use cases.

## Resources

Below is the list of resources exposed via the API and addressable via a very REST-like interface.

These resources are hosted by the account servicing payment service provider (ASPSP) in its role as the resource server (RS) in a GNAP interaction.

Access to the resources and permission to execute the associated actions is determined by the grants given to the client by the authorization server (AS) which may also be a system run by the ASPSP or a system(s) run by another party.

### Resource States and Mutations

Incoming and outgoing payment resources can transition through various states and may mutate as a result of this, or actions performed by a client. 

> _ **TODO:** Mutations should be recorded along with a timestamp of when they occurred in the `activity` property of a resource and accessible to clients._

Certain actions are executed by modifying the state property of the resource, for example updating the **Processing** state of an incoming payment to **Complete** through the Complete Payment action documented below.

### Resource Schemas

Resources are defined by the schemas detailed below. 

Where a property is marked as **Protected**, the property can be updated by a client with the appropriate permissions. 

Where a property is marked as **Read Only**, the property will only ever be returned by the RS in responses and can’t be provided in create or update actions. 

Properties marked as **Optional** can be excluded from actions as specified in that action description.

### 1. Account

The primary resource for any Open Payments server is an account. All actions related to that account including creation of sub-resources like outgoing and incoming payments are performed against the URL of the account, also known as a Payment Pointer for the account.

#### 1.1 Schemas

**Content-Type**: application/op-account-v1+json

| Property | Type | Description |
| -- | -- | --
| id | URL | The URL that identifies this account.
| publicName | string | A public name for the account. This should be set by the account holder with their provider to provide a hint to counterparties as to the identity of the account holder. (Read Only)
| authServer | URL | The URL of the AS endpoint for getting grants and access tokens for this account. (Read Only)
| assetCode | string | The asset code of the amount. This SHOULD be an ISO4217 currency code. (Read Only)
| assetScale | uint32 | The scale of the amount. (Read Only)

**Content-Type**: application/op-account-holder-v1+json

| Property | Type | Description |
| -- | -- | --
| type | enum | "person" or "business" indicating if the account holder is a natural person or a business.
| name | string | The name of the account holder, either the full name of a natural person or the trading name of a business.
| website | URL | The URL of the homepage of the person or business. (Optional)
| email | Email | The email address of the account holder. (Optional)
| mobile | MSISDN | The mobile number of the account holder. (Optional)
| twitter | URL | The Twitter profile of the account holder. (Optional)
| facebook | URL | The Facebook profile of the account holder. (Optional)
| linkedin | URL | The LinkedIn profile of the account holder. (Optional)
| ??? | URL | Any account holder identifier that could be used for verification. (Optional)

**Content-Type**: application/op-account-transactions-v1+json

| Property | Type | Description |
| -- | -- | --
| transactions | array | An array of transactions
| transaction.id | URL | A unique id for the transaction. This should be an incoming payment URL or an outgoing payment URL.
| transaction.type | enum | `incoming-payment` or `outgoing-payment`
| transaction.amount | Amount | The amount received for an incoming payment or the amount sent for an outgoing payment.
| transaction.receiver | URL | The URL of the account or incoming payment that this payment was sent to if the type is "outgoing-payment", otherwise empty.
| transaction.description | string | The description provided for the transaction.
| transaction.externalRef | string | An external reference provided for the transaction.

#### 1.2 Actions

Actions are executed against the base URL of the account resource.

#### 1.2.1 Request Account Details

**Method**: GET
**Accept**: application/op-account-v1+json

Returns public details of the account.

This end-point should be open to anonymous requests as it allows clients to verify a Payment Pointer URL and get the basic information required to construct new transactions.

The content should be slow changing and cacheable for long periods. Servers SHOULD use cache control headers 

#### 1.2.2 Request Account Holder Details

**Method**: GET
**Accept**: application/op-account-holder-v1+json

Returns details of the account holder.

This end-point MUST be protected from anonymous requests. Only clients with the appropriate permissions should be able to execute this action.

#### 1.2.3 Verify Account Holder Details

**Method**: POST
**Content-Type**: application/op-account-holder-v1+json
**Accept**: application/op-account-holder-v1+json

The Account Holder object can be submitted to this API and the response will return a copy of the posted data containing only the data that has been matched with the Account Holder data on record.

This COULD be used by anonymous clients to do payee verification without revealing the payee’s information by default.

The purpose of this API is to assist senders to verify that they are sending to the correct receiver.

It is important that this interface doesn’t reveal information without the account holder’s consent.

#### 1.2.4 Create Payment Pointer

**Method**: POST
**Content-Type**: application/op-payment-pointer-v1+json
**Accept**: application/op-account-v1+json

Create a new Payment Pointer for the account. 

This request MUST have an EMPTY body.

If the client has the necessary permissions then the resource server should generate a new account URL for the underlying account and return this as the id property in the response.

#### 1.2.5 Get Transactions

**Method**: GET
**Accept**: application/op-account-transactions-v1+json

Get a list of transactions on this account.

### 2. Incoming Payment
An incoming payment is a sub-resource of an account. 

It represents a fixed amount of money coming into the account. An incoming payment has one of 4 states.

1. Pending
2. Processing
3. Completed
4. Expired

The payment has a state of **Pending** when it is initially created. As soon as payment has started (funds have cleared into the account) the state moves to **Processing**.

Once the amount that was specified in the **incomingAmount** has been received the state moves to **Completed**.

If the payment expires before it is completed then the state will move to **Expired** and no further payments will be accepted.

A client with the appropriate permissions can update the state to **Completed** indicating the client is not going to make any further payments toward this incoming payment. E.g. The client has sent the maximum it is willing to send but due to fees or exchange rates that were unforeseen when the incoming payment was created, less has arrived at the receiver than expected.

No further payments should be accepted once the incoming payment has moved to an **Expired** or **Completed** state.

#### 2.1 Schema

**Content-Type**: application/op-incoming-payment-v1+json

| Property | Type | Description |
| -- | -- | --
| id | URL | The URL identifying the incoming payment. (Read Only)
| accountId | URL | The URL of the account this payment is being made into. (Read Only)
| state | enum | The state of the payment as described above. (Protected)
| incomingAmount | Amount | The amount that must be paid into the account to complete the payment.
| receivedAmount | Amount | The amount that has been paid into the incoming payment since it was created. (Read Only)
| expiresAt | DateTime | The date and time when payments into the incoming payment will no longer be accepted. (Optional)
| description | string | Human readable description of the incoming payment. (Optional)
| externalRef | string | A reference that can be used by external systems to reconcile this payment with their systems. E.g. An invoice number. (Optional)
| ilpAddress | string | The ILP address to use when establishing a STREAM connection. (Read Only)
| sharedSecret | string | The shared secret to use when establishing a STREAM connection. (Read Only)
| receiptNonce | uint128 | A random nonce to identify the underlying ILP STREAM connection used to send this payment. (Optional)
| receiptSecret | uint256 | A secret used to sign receipts returned on the ILP STREAM connection used to send this payment. (Optional)
| receiptsEnabled | boolean | True if the underlying STREAM has receipts enabled. (Read Only)

#### 2.2 Actions

Actions are executed against the base URL of the incoming payment.

#### 2.2.1 Create Incoming Payment

**Method**: POST
**Content-Type**: application/op-incoming-payment-v1+json
**Accept**: application/op-incoming-payment-v1+json OR application/ilp-stream-v1+json

Create a new Incoming Payment resource.

The request body contains an Incoming Payment resource encoded as JSON with only the following properties: 

| Property | Required | Notes |
| -- | -- | --
| incomingAmount | No | If specified, the assetCode and assetScale MUST match those of the underlying Account.
| expiresAt | No | MUST be a time in the future. The resource server MAY override the provided value to be within accepted bounds.
| description | No |
| externalRef | No |
| receiptNonce | No | If provided, with a receiptSecret, the receiver SHOULD enable STREAM receipts.
| receiptSecret | No | If provided, with a receiptNonce, the receiver SHOULD enable STREAM receipts.

If any other properties are provided the request MUST be rejected.

#### 2.2.2 Get Incoming Payment

**Method**: GET
**Accept**: application/op-incoming-payment-v1+json

Returns the current state of the incoming payment.

#### 2.2.3 Complete Incoming Payment

**Method**: PUT
**Content**-Type: application/op-incoming-payment-v1+json
**Accept**: application/op-incoming-payment-v1+json

If the state is **Pending** or **Processing** then the state can be updated to **Completed** by a client that has the appropriate permissions.

No further payments will be accepted by the ASPSP after the payment has been transitioned to the **Completed** state.

The request body contains an incoming payment resource encoded as JSON with only the following properties: 

| Property | Required | Notes |
| -- | -- | --
| state | Yes | Only a value of completed is permitted and only if the client has permission to complete incoming payments.

If any other properties are provided the request MUST be rejected.

### 3. Outgoing Payment

An outgoing payment is a sub-resource of an account. It represents a payment from the account and will transition through various states until it is either completed, rejected or failed.

A payment has a number of states indicating the status of the payment.

1. Pending
2. Rejected
3. Authorized
4. Completed
5. Expired
6. Failed

By default a new payment will have the state of **Pending**. A client with permission to authorize the payment can update the state to **Authorized** following which the ASPSP will attempt to execute the payment and the client can no longer update the payment.

When creating a new payment the client must provide at least one of, a value for the **sendAmount**, a value for the **receiveAmount**, or an incoming payment URL as the value for the **receiver**.

If the client provides an incoming payment URL the ASPSP must query it to determine the **receiveAmount**. If the ASPSP is unable to get a **receiveAmount** from the URL provided (insufficient permissions, or the URL is not for a valid incoming payment in an appropriate state) then the ASPSP should set the state of the Outgoing Payment to **Failed**.

If the client provides a **receiveAmount** or incoming iayment then the ASPSP SHOULD calculate a **sendAmount** that will be debited from the underlying account and set this in the response.

The ASPSP MAY specify a value for **expiresAt** for the Outgoing Payment if it calculates the **sendAmount**. The expiry indicates how long the calculated **sendAmount** is valid for. The ASPSP should automatically transition the state to **Expired** at that time and not allow any client to transition the payment to **Authorized** from **Expired**.

A payment that has expired must be updated to **Pending** before it can be updated to **Authorized**. When the ASPSP updates the state from **Expired** to **Pending** it recalculates the **sendAmount** and sets a new value for **expiresAt**.

The payment can be updated from **Pending** to **Authorized** by a different client to the one that created the payment if the client updating the state has permission to authorize the payment.

If a client has the necessary permissions then a payment created by them can be created with the **Authorized** state, in which case the ASPSP will immediately begin executing the payment. This is only useful if the client is specifying the sendAmount or if the client trusts the ASPSP to calculate and use a fair sendAmount.

#### 3.1 Schema

**Content-Type**: application/op-outgoing-payment-v1+json

| Property | Type | Description |
| -- | -- | --
| id | URL | The URL identifying the outgoing payment. (Read Only)
| accountId | URL | The URL of the account this payment is being made into. (Read Only)
| state | enum | The state of the payment as described above. (Protected)
| receivingAccount | URL | The URL of the account that is being paid.
| receivingPayment | URL | The URL of the incoming payment that is being paid.
| receiveAmount | Amount | The amount that must be paid into the receiver’s account. (Optional)
| sendAmount | Amount | The amount that will be debited from the account. (Optional)
| fundsAreAvailable | Boolean | Indicates that there are funds available in the underlying account to complete this payment. This is not a guarantee they will still be available when the payment is attempted but it is a good indicator to a client that it should attempt to authorize the payment. (Protected)
| expiresAt | DateTime | The date and time when the calculated send amount is no longer valid. (Read Only)
| description | string | Human readable description of the outgoing payment. (Optional)
| externalRef | string | A reference that can be used by external systems to reconcile this payment with their systems. E.g. An invoice number or purchase order number. (Optional)
| receiptNonce | uint128 | A random nonce to identify the underlying ILP STREAM connection used to send this payment. (Optional)
| receiptSecret | uint256 | A secret used to sign receipts returned on the ILP STREAM connection used to send this payment. (Optional)

#### 3.2 Actions

Actions are executed against the base URL of the Outgoing Payment resource.

#### 3.2.1 Request Interledger Payment Receipts

**Method**: GET
**Accept**: application/ilp-stream-receipt-v1+json

Returns the latest STREAM Receipt received while executing this Outgoing Payment. 

#### 3.2.2 Create Outgoing Payment

**Method**: POST
**Content-Type**: application/op-outgoing-payment-v1+json
**Accept**: application/op-outgoing-payment-v1+json

Create a new Outgoing Payment sub-resource.

The request body contains an Outgoing Payment resource encoded as JSON with only the following properties:

| Property | Required | Notes
| -- | -- | --
| state | No | Only a value of authorized is permitted and only if the client has permission to authorize outgoing payments.
| receivingAccount | Maybe | Either a receivingAccount or a receivingPayment MUSt be provided.
| receivingPayment | Maybe | Either a receivingAccount or a receivingPayment MUSt be provided.
| receiveAmount | Maybe | Required if no sendAmount and no receivingPayment is provided. assetCode and assetScale MUST match those of the receivingAccount.
| sendAmount | Maybe | Required if no receiveAmount and no receivingPayment is provided.  assetCode and assetScale MUST match those of the underlying Account.
| description | No | A description or message that will be available to the sender and MAY be used by the provider if creating an incoming payment at the receivingAccount.
| externalRef | No | An external reference number or code that can be used to reconcile the payment with external systems such as an invoice number.
| receiptNonce | No | A random nonce to identify the underlying ILP STREAM connection used to send this payment. (Optional)
| receiptSecret | No | A secret used to sign receipts returned on the ILP STREAM connection used to send this payment. (Optional)


If any other properties are provided the request MUST be rejected.

#### 3.2.3 Get Outgoing Payment

**Method**: GET
**Accept**: application/op-outgoing-payment-v1+json

Returns the current state of the Outgoing Payment.

#### 3.2.4 Recalculate Amounts for Outgoing Payment

**Method**: PUT
**Content-Type**: application/op-outgoing-payment-v1+json
**Accept**: application/op-outgoing-payment-v1+json


This will cause the ASPSP to recalculate any amounts that it calculated when the payment was initially created or last updated and set a new expiry for the payment.

If the receiver is an **Account** resource then a new **sendAmount** OR **receiveAmount** can be provided.

If the current state of the payment is **Expired** then the state must also be updated to **Pending**.

The request body contains an Outgoing Payment resource encoded as JSON with only the following properties: 

| Property | Required | Notes
| -- | -- | --
| state | Maybe | If the current state is pending or then this MUST have a value of pending or not be provided. If the current state is expired or then this MUST have a value of pending. If the current state is anything but expired or pending then this request MUST be rejected.
| receiveAmount | No | assetCode and assetScale MUST match those of the receiver. Not permitted if the receiver is an incoming payment resource or if a sendAmount is also provided.
| sendAmount | No | assetCode and assetScale MUST match those of the underlying Account. Not permitted if the receiver is an incoming payment resource or if a receiveAmount is also provided.


If any other properties are provided the request MUST be rejected.

#### 3.2.5 Authorize Payment

**Method**: PUT
**Content-Type**: application/op-outgoing-payment-v1+json
**Accept**: application/op-outgoing-payment-v1+json

If the state is **Pending** then the state can be updated to **Authorized** by a client that has the appropriate permissions.

This will cause the ASPSP to begin executing the payment.

The request body contains an Outgoing Payment resource encoded as JSON with only the following properties: 

| Property | Required | Notes
| -- | -- | --
| state | Yes | This MUST have a value of authorized. If the current state is anything but pending then this request MUST be rejected.

If any other properties are provided the request MUST be rejected.

## Types

The following common data types are used in the resource definitions above

### Amount

| Property | Type | Description |
| -- | -- | --
| amount | uint64 | The amount that must be paid into the receiver’s account. (Optional)
| assetCode | string | The asset code of the amount. This SHOULD be an ISO4217 currency code.
| assetScale | uint32 | The scale of the amount.

## Grants

### Types

The grant types map directly to resource types and include:
* account
* incoming-payment
* outgoing-payment

A grant with the type "account" permits a client to perform actions against the account resources identified by the location property of the grant.

A grant with the type `incoming-payment` permits the client to perform the specified actions on incoming payment resources that are sub-resources of the account resources identified by the location property of the grant.

A grant with the type `outgoing-payment` permits the client to perform the specified actions on outgoing-payment resources that are sub-resources of the account resources identified by the location property of the grant.

### Actions

Actions specify the actions a client can perform against a resource. Different actions are available for different grant types.

*__NOTE:__ We need to validate the account related actions with use cases before we can define the access control properly.*

Incoming Payment
* Create
* Read
* RequestReceipts
* Complete

Outgoing Payment
* Create
* Authorize
* Read
* CheckFunds
* RequestReceipts

### Locations

All grants will have at least one value in the locations property indicating the URL to the underlying resource for which the grant is given. i.e. either a Payment Pointer URL referring to an account or a URL referring to incoming payment or outgoing payment

### Incoming Payment Specific Fields

### Outgoing Payment Specific Fields
* Receiver
* Limits
    * startsAt
    * expiresAt
    * sendAmount
    * receiveAmount
    * interval

# Use Cases

The following use cases are supported by Open Payments.

## Web Monetization

Web Monetization involves sending a stream of micro-payments to a Payment Pointer embedded in the HTML of a website by a sender (a Web Monetization agent) embedded in the Web browser accessing the website.

In this scenario the payer simply requests payment details directly from the Payment Pointer through a GET request with an accepted content type of application/spsp4+json. The response from the resource server is a JSON document with details on how to stream payments to the underlying account via the Interledger network.

Web Monetization follows the Simple Payment Setup Protocol (SPSP) where the resource server fulfills the role of SPSP Server.

> **TODO:** An updated version of Web Monetization that uses Open Payments is being explored. This would involve a POST to the Payment Pointer to create a new incoming payment. This would immediately return the STREAM credentials to begin sending payments.

### Get Payment Details of Payee
**Client:** Web Monetization provider (e.g. Coil)
**Authentication:** None
**Resource Server:** Payee ASPSP

## e-Commerce (Push Payment)
A user paying for goods online is given an Open Payments incoming payment (URL) to pay into.

In this scenario a user (the account holder of the sending account) is making a purchase online from a merchant (the account holder of the receiving account). The merchant generates an incoming payment, shares it with the user, and the user pays into it.

The e-commerce system will create the incoming payment against the account of the merchant with the merchant’s ASPSP. The incoming payment URL is a new Payment Pointer for the underlying account. Using a new unique Payment Pointer allows the merchant to reconcile the incoming payment with the purchase.

The incoming payment URL (Payment Pointer) will be shared with the user. This could be in the form of a link, a client-side exchange (e.g. via the W3C Payment Request API) or a QR code that the user scans to pay.

The user will invoke their own ASPSP using an interaction channel appropriate to the exchange (e.g. via the ASPSP app that is used to scan the QR code).

The user’s ASPSP will request payment details from the merchant ASPSP through a GET of the URL, confirm the payment with the user and then complete the payment.

The user’s ASPSP should protect the user from phishing or sending payments to an incorrect payee by performing some verification of the merchant and displaying this to the user.

### Create Invoice against Merchant account
**Client:** e-Commerce System (e.g. Shopify)
**Authentication:** Light (Mostly for DDoS protection)
**Resource Server:** Merchant’s ASPSP

### Send Payment from User account
**Client:** User via app or website their ASPSP
**Authentication:** Risk based (Known Merchant, Size of Payment, Type of Merchant)
**Resource Server:** User’s ASPSP

## e-Commerce (Pull Payment)

A user paying for goods online connects their account with the merchant who is then able to pull the payment for the goods.

In this scenario a user is making a purchase online from a merchant. The merchant generates an incoming payment and then requests permission to initiate a payment directly from the user’s account at the ASPSP to that incoming payment.

After creating the incoming payment the e-commerce system must initiate an interaction with the user’s ASPSP. This could be through the user clicking a “Pay with Interledger” button and then either selecting their ASPSP from a list or, automatically being redirected to their ASPSP by a mediator that is aware of which ASPSP the user has an account with.

The mediator might be a component of the browser (e.g. a W3C Payment Handler) or an interstitial website hosted by the Interledger Foundation or similar.

Once the user is interacting with their ASPSP directly they will authenticate themselves and consent to the merchant initiating a payment from their account. The request from the merchant that is passed to the ASPSP will be to pay the incoming payment that has been created at the merchant’s ASPSP.

The user’s ASPSP will query the incoming payment to get the details and will calculate the amount that is going to be debited from the user’s account to make the payment.

Both the amount that is being debited from the user’s account and the amount that the merchant will receive SHOULD be shown to the user.

The amount that will be debited from the user MAY be an estimate if there are unknowns such as currency conversion or variable fees that may change by the time the payment is executed. In this case the ASPSP should show the user a range or indicate that the amount that will be charged is an estimate with an indication of the slippage that will be tolerated.

The user MUST consent to the amount that will be received and also a maximum amount their account will be debited, expressed either as a single maximum amount, a range including a minimum and maximum amount, or a mid-market (current) amount and an amount of slippage that will be tolerated.

The ASPSP must ensure the user understands what they are consenting to and is paying the correct merchant they intend to pay. This requires that the merchant provide some proof of identity to the ASPSP.

After consenting to the payment, the user is redirected back to the merchant and the merchant is given a grant that allows them to execute the payment. The merchant uses the grant it has been given to initiate a payment from the user’s account to pay the invoice.

### Create Incoming Payment
**Client:** e-Commerce System (e.g. Shopify)
**Authentication:** Light (DoS protection)
**Resource Server:** Merchant’s ASPSP

### Create Outgoing Payment
**Client:** e-Commerce System or Merchant (e.g. Shopify or Amazon)
**Authentication:** Risk based (Known Merchant, Size of Payment, Type of Merchant)
**Authorization Limits:** Single payment, Fixed receive amount and receiver (incoming payment)
**Resource Server:** User’s ASPSP

### Example

A detailed example is captured [here](./single-pull-payment.md).

## Variable Recurring Payments

A user signing up for a subscription or other service provides consent to a 3rd party to pull multiple payments from their account subject to limits on the number or value of the payments.

This is similar to the e-commerce pull use case except the merchant is requesting consent to pull multiple payments.

The grant given to the merchant will indicate the details of how many payments the merchant is permitted to make in any period (weekly, monthly, annually) and the value per payment and total value per period.

Responsibility for enforcing the restrictions sits with the ASPSP (resource server) even if the authorization server is a 3rd-party. The resource server must track the history of payments initiated by the merchant (the client) and ensure the merchant only initiates payments within the allowed limits.

### Create Incoming Payment (for each payment)
**Client:** Subscription Management System (e.g. Netflix)
**Authentication:** Light (DoS protection)
**Resource Server:** Merchant’s ASPSP

### Create Outgoing Payment
**Client:** Subscription Management System or Merchant (e.g. Netflix)
**Authentication:** Risk based (Known Merchant, Size of Payment, Type of Merchant)
**Authorization Limits:** Single payment, Fixed receive amount
**Resource Server:** User’s ASPSP

## 3rd Party Payment Initiation

This is a variation of the e-commerce (both push and pull) and variable recurring payments use cases.

Instead of authenticating with the ASPSP and consenting to the payment(s), a mutually trusted 3rd party such as a PISP, network operator or digital platform operator could provide some or all of the authorization server role. Examples of such a service could be iDeal (traditional PISP), Mastercard, Visa, or Apple Pay or Google Pay.

For example, a user making a payment at an e-commerce site may elect to pay via Google Pay. The user has previously linked their Open Payments account to Google Pay and granted Google Pay the ability to initiate payments from the account.

### Example

A detailed example is captured [here](./variable-recurring-payments.md).
