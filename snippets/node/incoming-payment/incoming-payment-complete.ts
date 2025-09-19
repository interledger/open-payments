import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";

dotenv.config({
    path: fileURLToPath(join(import.meta.url, "..", "..", ".env")),
});

const KEY_ID = process.env.KEY_ID;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const INCOMING_PAYMENT_URL = process.env.INCOMING_PAYMENT_URL;
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

//@! start chunk 3 | title=Complete incoming payment
const incomingPayment = await client.incomingPayment.complete({
    url: INCOMING_PAYMENT_URL,
    accessToken: INCOMING_PAYMENT_ACCESS_TOKEN,
});
//@! end chunk 3

//@! start chunk 4 | title=Output
console.log("INCOMING PAYMENT:", JSON.stringify(incomingPayment, null, 2));
//@! end chunk 4
