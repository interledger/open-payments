<?php

//@! start chunk 1 | title=Get incoming payment
$incomingPayment = $opClient->incomingPayment()->get(
    [
        'url' => $INCOMING_PAYMENT_URL
    ]
);
//@! end chunk 1
