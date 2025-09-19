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

//@! start chunk 1 | title=Import dependencies
import { createAuthenticatedClient, isPendingGrant } from "@interledger/open-payments";
//@! end chunk 1

//@! start chunk 2 | title=Initialize Open Payments client
const client = await createAuthenticatedClient({
    walletAddressUrl: WALLET_ADDRESS,
    privateKey: PRIVATE_KEY_PATH,
    keyId: KEY_ID,
});
//@! end chunk 2

//@! start chunk 3 | title=Get wallet address information
const walletAddress = await client.walletAddress.get({
    url: WALLET_ADDRESS,
});
//@! end chunk 3

//@! start chunk 4 | title=Request grant
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
//@! end chunk 4

//@! start chunk 5 | title=Check grant state
if (!isPendingGrant(grant)) {
    throw new Error("Expected interactive grant");
}
//@! end chunk 5

//@! start chunk 6 | title=Output
console.log("Please interact at the following URL:", grant.interact.redirect);
console.log("CONTINUE_ACCESS_TOKEN =", grant.continue.access_token.value);
console.log("CONTINUE_URI =", grant.continue.uri);
//@! end chunk 6
