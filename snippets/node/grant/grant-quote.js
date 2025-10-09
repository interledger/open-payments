import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";

dotenv.config({
    path: fileURLToPath(join(import.meta.url, "..", "..", ".env")),
});

const KEY_ID = process.env.KEY_ID;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH;

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
                    actions: ["create", "read", "read-all"],
                },
            ],
        },
    },
);

if (isPendingGrant(grant)) {
    throw new Error("Expected non-interactive grant");
}

console.log("QUOTE_ACCESS_TOKEN =", grant.access_token.value);
console.log("QUOTE_ACCESS_TOKEN_MANAGE_URL = ", grant.access_token.manage);
