import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";

dotenv.config({
    path: fileURLToPath(join(import.meta.url, "..", "..", ".env")),
});

const KEY_ID = process.env.KEY_ID;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH;

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

//@! start chunk 4 | title=Request incoming payment grant
const grant = await client.grant.request(
    {
        url: walletAddress.authServer,
    },
    {
        access_token: {
            access: [
                {
                    type: "incoming-payment",
                    actions: ["list", "read", "read-all", "complete", "create"],
                },
            ],
        },
    },
);
//@! end chunk 4

//@! start chunk 5 | title=Check grant state
if (isPendingGrant(grant)) {
    throw new Error("Expected non-interactive grant");
}
//@! end chunk 5

//@! start chunk 6 | title=Output
console.log("INCOMING_PAYMENT_ACCESS_TOKEN =", grant.access_token.value);
console.log("INCOMING_PAYMENT_ACCESS_TOKEN_MANAGE_URL = ", grant.access_token.manage);
//@! end chunk 6
