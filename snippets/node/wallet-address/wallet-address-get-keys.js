import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";

dotenv.config({
    path: fileURLToPath(join(import.meta.url, "..", "..", ".env")),
});

const KEY_ID = process.env.KEY_ID;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH;

import { createAuthenticatedClient } from "@interledger/open-payments";

const client = await createAuthenticatedClient({
    walletAddressUrl: WALLET_ADDRESS,
    privateKey: PRIVATE_KEY_PATH,
    keyId: KEY_ID,
});

const walletAddressKeys = await client.walletAddress.getKeys({
    url: WALLET_ADDRESS,
});

console.log("WALLET ADDRESS KEYS:", JSON.stringify(walletAddressKeys, null, 2));
