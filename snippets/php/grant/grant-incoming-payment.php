<?php

//@! start chunk 1 | title=Get wallet address information
$wallet = $opClient->walletAddress()->get([
    'url' => $config->getWalletAddressUrl()
]);
//@! end chunk 1
//@! start chunk 2 | title=Request incoming payment grant
$grant = $opClient->grant()->request(
    [
        'url' => $wallet->authServer
    ],
    [
        'access_token' => [
            'access' => [
                [
                    'type' => 'incoming-payment',
                    'actions' => ['read', 'complete', 'create', 'list']
                ]
            ]
        ]
    ]
);
//@! end chunk 2

//@! start chunk 3 | title=Check grant state
if (!$grant instanceof \OpenPayments\Models\Grant) {
    throw new \Error('Expected non-interactive grant');
}
//@! end chunk 3

//@! start chunk 4 | title=Output
echo 'INCOMING_PAYMENT_GRANT: ' . $grant->access_token->value . PHP_EOL;
echo "INCOMING_PAYMENT_ACCESS_TOKEN_MANAGE_URL = " . $grant->access_token->manage . PHP_EOL;
echo 'GRANT OBJECT: ' . PHP_EOL . print_r($grant, true);
//@! end chunk 4
