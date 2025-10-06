import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";

dotenv.config({
    path: fileURLToPath(join(import.meta.url, "..", "..", ".env")),
});

const INCOMING_PAYMENT_URL = process.env.INCOMING_PAYMENT_URL;

//@! start chunk 1 | title=Import dependencies
import { createUnauthenticatedClient } from "@interledger/open-payments";
//@! end chunk 1

//@! start chunk 2 | title=Initialize Open Payments client
const client = await createUnauthenticatedClient({});
//@! end chunk 2

//@! start chunk 3 | title=Get incoming payment
const incomingPayment = await client.incomingPayment.get({
    url: INCOMING_PAYMENT_URL,
});
//@! end chunk 3

//@! start chunk 4 | title=Output
console.log("INCOMING PAYMENT:", incomingPayment);
//@! end chunk 4
