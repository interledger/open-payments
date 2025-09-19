import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";

dotenv.config({
    path: fileURLToPath(join(import.meta.url, "..", "..", ".env")),
});

const KEY_ID = process.env.KEY_ID;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const OUTGOING_PAYMENT_ACCESS_TOKEN = process.env.OUTGOING_PAYMENT_ACCESS_TOKEN;
const QUOTE_URL = process.env.QUOTE_URL;
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH;

import { createAuthenticatedClient } from "@interledger/open-payments";

const client = await createAuthenticatedClient({
    walletAddressUrl: WALLET_ADDRESS,
    privateKey: PRIVATE_KEY_PATH,
    keyId: KEY_ID,
});

const outgoingPayment = await client.outgoingPayment.create(
    {
        url: new URL(WALLET_ADDRESS).origin,
        accessToken: OUTGOING_PAYMENT_ACCESS_TOKEN,
    },
    {
        walletAddress: WALLET_ADDRESS,
        quoteId: QUOTE_URL,
    },
);

console.log("OUTGOING_PAYMENT_URL = ", outgoingPayment.id);
