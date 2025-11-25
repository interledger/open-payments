<?php

//@! start chunk 1 | title=Continue grant
$grant = $opClient->grant()->continue(
    [
        'access_token' => $CONTINUE_ACCESS_TOKEN,
        'url' => $CONTINUE_URI
    ],
    [
        'interact_ref' => $interactRef,
    ]
);
//@! end chunk 1

//@! start chunk 2 | title=Check grant state
if (!$grant instanceof \OpenPayments\Models\Grant) {
    throw new \Error('Expected finalized grant. Received non-finalized grant.');
}
//@! end chunk 2

//@! start chunk 3 | title=Output
echo 'OUTGOING_PAYMENT_GRANT_ACCES_TOKEN: ' . $grant->access_token->value . PHP_EOL;
echo 'OUTGOING_PAYMENT_ACCESS_TOKEN_MANAGE_URL: ' . $grant->access_token->manage . PHP_EOL;
echo 'GRANT OBJECT: ' . PHP_EOL . print_r($grant, true);
//@! end chunk 3
