<?php

//@! start chunk 1 | title=Get outgoing payment
$outgoingPayment = $opClient->outgoingPayment()->get(
    [
        'access_token' => $OUTGOING_PAYMENT_GRANT_ACCESS_TOKEN,
        'url' => $OUTGOING_PAYMENT_URL
    ]
);
//@! end chunk 1

//@! start chunk 2 | title=Output
echo 'OUTGOING PAYMENT: ' . PHP_EOL . print_r($outgoingPayment, true);
//@! end chunk 2
