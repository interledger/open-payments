import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";

dotenv.config({
    path: fileURLToPath(join(import.meta.url, "..", "..", ".env")),
});

const INCOMING_PAYMENT_URL = process.env.INCOMING_PAYMENT_URL;

import { createUnauthenticatedClient } from "@interledger/open-payments";

const client = await createUnauthenticatedClient({});

const incomingPayment = await client.incomingPayment.get({
    url: INCOMING_PAYMENT_URL,
});

console.log("INCOMING PAYMENT:", incomingPayment);
