<?php

//@! start chunk 1 | title=Get incoming payment
$incomingPayment = $opClient->incomingPayment()->get(
    [
        'access_token' => $INCOMING_PAYMENT_GRANT_ACCESS_TOKEN,
        'url' => $INCOMING_PAYMENT_URL
    ]
);
//@! end chunk 1
        
//@! start chunk 2 | title=Output
echo 'INCOMING PAYMENT: ' . PHP_EOL . print_r($incomingPayment, true);
//@! end chunk 2
