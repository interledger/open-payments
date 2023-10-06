# HTTP Signatures

The Open Payments API uses HTTP signatures to secure the integrity of messages between sender, receiver, and third-party initiating payment systems. HTTP signatures are also part of the process that controls access to protected resources that orchestrate payment transactions.

## Purpose

Cryptographic digital signatures make it possible to secure HTTP messages by verifying the:

- **Authenticity** of a system that requests permissions for access to specific resources.
- **Integrity** of messages that are exchanged between Open Payments API enabled systems. This guards against the risk of message tampering, and can apply to the whole message or parts of the message.

In this context, an authorizing server controls API access by granting particular permissions to a specific client.

## Understanding HTTP Signatures

### Specification

<!-- NOTE: the latest published spec. version, as at Oct 2023, is 19. How do we approach updating our spec. refs? Do we first analyse the spec, to ensure that our implementation is in-line with the latest version?
-->
The Open Payments API adheres to the HTTP Message Signature specification drafted by the HTTP workgroup of the Internet Engineering Task Force (IETF).
The referenced specification is published here: [httpbis-message-signature-16](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures-16).

<!-- NOTE: maybe move the link below to a references section -->
At the time of publication, the IETF used the following location to track various drafts and specification revisions:
[http-message-signatures](https://datatracker.ietf.org/doc/draft-ietf-httpbis-message-signatures).

### Cryptographic keys

The Open Payments API uses assymetric keys (i.e. public-private key pairs) to generate and verify HTTP signatures.

The process of key and signature generation typically involves:

- **A signer**: This is the client that requests permissions to access resources that initiate specific transaction flows. The signer generates the public-private key pair with which to sign its messages.
- **A verifier**: This is typically referred to as an authourising server that validates digital signatures and verifies that a signature was produced by the expected signer.

 A signer is peered with a system whose resources are protected by the verifying party.

### Signature algorithms

There are various algorithms that can be used to generate HTTP message signatures.

The Open Payments API implements a specific algorithm called the **Ed25519** variant of the EdDSA (Edwards-curve Digital Signature Algorithm).  Benefits of using this signature algorithm include:

- Good hash function collision resilience.
- Guarding against the risk of an encryption key downgrade attack.
- Speed and efficiency for signature generation and verification.

For more information about the EdDSA and its variants, refer to [RFC8032](https://www.rfc-editor.org/rfc/rfc8032).

### Creating a message signature

Numerous elements make up the message signing procedure that outputs an HTTP message signature.

An HTTP message can have multiple signatures generated from different components of the message. We focus on the following elements of the message signing procedure:

- **Signature algorithm**: EdDSA using Ed25519.
- **Signing key**: The Ed25519 private key of the signer.
- **Signature base**: The subset of HTTP message components that will be signed, these are produced in a particular format.
- **Signature-Input field**: Metadata for the message signature(s) generated from components of an HTTP message. This field must be in the message signature header.
- **Output**: The message signing procedure produces a HTTP message signature value as output. This value is carried in the Signature field of the HTTP message.

This section of the [httpbis-message-signatures-16-create](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures-16#name-http-message-signatures) specification details the signature creation process.

### Bringing it all together
<!-- might rename this, but am keen to add a diagram to illustrate the input-to-process-to-output magic -->

### Other important elements
<!-- unsure about keeping/removing this section...
but we can reuse really great content from Rafiki docs > Open Payments > Key Registry: 
https://rafiki.dev/concepts/open-payments/key-registry/
 -->

- JWK: JSON Web Key created using the private key of the signer.

- Key registry

- Key ID

## Use the HTTP Signature Utils
 <!-- MAYBE this section could be a new page...but would like to reuse the content from the utils readme:

 https://github.com/interledger/open-payments/blob/main/packages/http-signature-utils/README.md

 -->