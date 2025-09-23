import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";

dotenv.config({
    path: fileURLToPath(join(import.meta.url, "..", "..", ".env")),
});

const KEY_ID = process.env.KEY_ID;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const INCOMING_PAYMENT_ACCESS_TOKEN = process.env.INCOMING_PAYMENT_ACCESS_TOKEN;
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH;

//@! start chunk 1 | title=Import dependencies
import { createAuthenticatedClient } from "@interledger/open-payments";
//@! end chunk 1

//@! start chunk 2 | title=Initialize Open Payments client
const client = await createAuthenticatedClient({
    walletAddressUrl: WALLET_ADDRESS,
    privateKey: PRIVATE_KEY_PATH,
    keyId: KEY_ID,
});
//@! end chunk 2

//@! start chunk 3 | title=List incoming payments
const incomingPayments = await client.incomingPayment.list(
    {
        url: new URL(WALLET_ADDRESS).origin,
        walletAddress: WALLET_ADDRESS,
        accessToken: INCOMING_PAYMENT_ACCESS_TOKEN,
    },
    {
        first: 10,
        last: undefined,
        cursor: undefined,
    },
);
//@! end chunk 3

//@! start chunk 4 | title=Output
console.log("INCOMING PAYMENTS:", JSON.stringify(incomingPayments, null, 2));
//@! end chunk 4
