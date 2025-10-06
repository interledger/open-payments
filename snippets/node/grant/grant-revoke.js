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
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH;

import { createAuthenticatedClient } from "@interledger/open-payments";

const client = await createAuthenticatedClient({
    walletAddressUrl: WALLET_ADDRESS,
    privateKey: PRIVATE_KEY_PATH,
    keyId: KEY_ID,
});

await client.grant.cancel({
    accessToken: CONTINUE_ACCESS_TOKEN,
    url: CONTINUE_URI,
});

console.log("Grant revoked.");
