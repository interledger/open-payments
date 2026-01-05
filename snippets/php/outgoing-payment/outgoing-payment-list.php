<?php

$wallet  = $opClient->walletAddress()->get([
    'url' => $config->getWalletAddressUrl()
]);
 //@! start chunk 1 | title=List outgoing payments
$outgoingPaymentList = $opClient->outgoingPayment()->list(
    [
        'url' => $wallet->resourceServer,
        'access_token' => $OUTGOING_PAYMENT_GRANT_ACCESS_TOKEN
    ],
    [
        'wallet-address' => $config->getWalletAddressUrl(),
        'first' => 3,
        'start' => '96d964f0-3421-4df0-bb04-cb8d653bc571'
    ]
);
//@! end chunk 1

//@! start chunk 2 | title=Output
echo 'OUTGOING PAYMENTS LIST ' . PHP_EOL . print_r($outgoingPaymentList, true);
//@! end chunk 2
