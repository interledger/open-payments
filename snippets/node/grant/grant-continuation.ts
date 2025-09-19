import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";

dotenv.config({
    path: fileURLToPath(join(import.meta.url, "..", "..", ".env")),
});

const KEY_ID = process.env.KEY_ID;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const CONTINUE_URI = process.env.CONTINUE_URI;
const CONTINUE_ACCESS_TOKEN = process.env.CONTINUE_ACCESS_TOKEN;
const URL_WITH_INTERACT_REF = process.env.URL_WITH_INTERACT_REF;
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH;

//@! start chunk 1 | title=Import dependencies
import { createAuthenticatedClient, isFinalizedGrant } from "@interledger/open-payments";
//@! end chunk 1

//@! start chunk 2 | title=Initialize Open Payments client
const client = await createAuthenticatedClient({
    walletAddressUrl: WALLET_ADDRESS,
    privateKey: PRIVATE_KEY_PATH,
    keyId: KEY_ID,
});
//@! end chunk 2

// @TODO: Verify hash
const url = new URL(URL_WITH_INTERACT_REF);
const interactRef = url.searchParams.get("interact_ref");

if (!interactRef) {
    throw new Error(`Missing 'interact_ref'. Received params: ${url.searchParams.toString()} `);
}

//@! start chunk 3 | title=Continue grant
const grant = await client.grant.continue(
    {
        accessToken: CONTINUE_ACCESS_TOKEN,
        url: CONTINUE_URI,
    },
    {
        interact_ref: interactRef,
    },
);
//@! end chunk 3

//@! start chunk 4 | title=Check grant state
if (!isFinalizedGrant(grant)) {
    throw new Error("Expected finalized grant. Received non-finalized grant.");
}
//@! end chunk4

console.log(
    "\x1b[34mNote: \x1b[0mIf you requested a grant with the `pnpm grant` script, the following `OUTGOING_PAYMENT_ACCESS_TOKEN` and `OUTGOING_PAYMENT_ACCESS_TOKEN_MANAGE_URL` can be used for Incoming Payments and Quotes as well.\n",
);
//@! start chunk 5 | title=Output
console.log("OUTGOING_PAYMENT_ACCESS_TOKEN =", grant.access_token.value);
console.log("OUTGOING_PAYMENT_ACCESS_TOKEN_MANAGE_URL =", grant.access_token.manage);
//@! end chunk 5
