import dotenv from "dotenv";
import { join } from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";

dotenv.config({
    path: fileURLToPath(join(import.meta.url, "..", "..", ".env")),
});

const KEY_ID = process.env.KEY_ID;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH;
const NONCE = randomUUID();

import { createAuthenticatedClient, isPendingGrant } from "@interledger/open-payments";

const client = await createAuthenticatedClient({
    walletAddressUrl: WALLET_ADDRESS,
    privateKey: PRIVATE_KEY_PATH,
    keyId: KEY_ID,
});

const walletAddress = await client.walletAddress.get({
    url: WALLET_ADDRESS,
});

const grant = await client.grant.request(
    {
        url: walletAddress.authServer,
    },
    {
        access_token: {
            access: [
                {
                    type: "quote",
                    actions: ["read", "read-all", "create"],
                },
                {
                    type: "incoming-payment",
                    actions: ["read", "read-all", "list", "list-all", "create", "complete"],
                },
                {
                    identifier: WALLET_ADDRESS,
                    type: "outgoing-payment",
                    actions: ["read", "read-all", "list", "list-all", "create"],
                    limits: {
                        debitAmount: {
                            value: "10000",
                            assetCode: "USD",
                            assetScale: 2,
                        },
                    },
                },
            ],
        },
        interact: {
            start: ["redirect"],
            finish: {
                method: "redirect",
                uri: "http://localhost:3344",
                nonce: NONCE,
            },
        },
    },
);

if (!isPendingGrant(grant)) {
    throw new Error("Expected interactive grant");
}

console.log("Please interact at the following URL:", grant.interact.redirect);
console.log("CONTINUE_ACCESS_TOKEN =", grant.continue.access_token.value);
console.log("CONTINUE_URI =", grant.continue.uri);
