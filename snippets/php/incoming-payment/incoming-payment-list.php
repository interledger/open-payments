<?php

//@! start chunk 1 | title=Get wallet address
$wallet = $opClient->walletAddress()->get([
    'url' => $config->getWalletAddressUrl()
]);
//@! end chunk 1
        
//@! start chunk 2 | title=List incoming payments
$incomingPaymentsList = $opClient->incomingPayment()->list(
    [
        'url' => $wallet->resourceServer,
        'access_token' => $INCOMING_PAYMENT_GRANT_ACCESS_TOKEN
    ],
    [
        'wallet-address' => $config->getWalletAddressUrl(),
        'first' => 10,
        'start'=> '96d964f0-3421-4df0-bb04-cb8d653bc571'
    ]
);
//@! end chunk 2

//@! start chunk 3 | title=Output
echo 'INCOMING PAYMENTS ' . PHP_EOL . print_r($incomingPaymentsList, true);
//@! end chunk 3
