import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";

dotenv.config({
    path: fileURLToPath(join(import.meta.url, "..", "..", ".env")),
});

const KEY_ID = process.env.KEY_ID;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const INCOMING_PAYMENT_URL = process.env.INCOMING_PAYMENT_URL;
const QUOTE_ACCESS_TOKEN = process.env.QUOTE_ACCESS_TOKEN;
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

//@! start chunk 3 | title=Get wallet address information
const walletAddress = await client.walletAddress.get({
    url: WALLET_ADDRESS,
});
//@! end chunk 3

//@! start chunk 4 | title=Create quote with debit amount
const quote = await client.quote.create(
    {
        url: new URL(WALLET_ADDRESS).origin,
        accessToken: QUOTE_ACCESS_TOKEN,
    },
    {
        method: "ilp",
        walletAddress: WALLET_ADDRESS,
        receiver: INCOMING_PAYMENT_URL,
        debitAmount: {
            value: "500",
            assetCode: walletAddress.assetCode,
            assetScale: walletAddress.assetScale,
        },
    },
);
//@! end chunk 4

//@! start chunk 5 | title=Output
console.log("QUOTE_URL =", quote.id);
//@! end chunk 5
