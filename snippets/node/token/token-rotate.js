import { parseTokenArgs } from "utils/parse-token-args";

const KEY_ID = process.env.KEY_ID;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const { ACCESS_TOKEN, MANAGE_URL } = parseTokenArgs(process.argv.slice(2));
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH;

import { createAuthenticatedClient } from "@interledger/open-payments";

const client = await createAuthenticatedClient({
    walletAddressUrl: WALLET_ADDRESS,
    privateKey: PRIVATE_KEY_PATH,
    keyId: KEY_ID,
});

const token = await client.token.rotate({
    url: MANAGE_URL,
    accessToken: ACCESS_TOKEN,
});

console.log("ACCESS_TOKEN =", token.access_token.value);
console.log("MANAGE_URL =", token.access_token.manage);
