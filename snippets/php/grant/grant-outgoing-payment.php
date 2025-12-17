<?php

//@! start chunk 1 | title=Get wallet address information
$wallet  = $opClient->walletAddress()->get([
    'url' => $config->getWalletAddressUrl()
]);
//@! end chunk 1
// See https://openpayments.dev/apis/auth-server/operations/post-request/

//@! start chunk 2 | title=Request outgoing payment grant
$grant = $opClient->grant()->request(
    [
        'url' => $wallet->authServer
    ],
    [
        'access_token' => [
            'access' => [
                [
                    'type' => 'outgoing-payment',
                    'actions' => ['list', 'list-all', 'read', 'read-all', 'create'],
                    'identifier' => $wallet->id,
                    'limits' => [
                        'receiver' => $INCOMING_PAYMENT_URL, //optional
                        'debitAmount' => [
                            'assetCode' => 'USD',
                            'assetScale' => 2,
                            'value' => "130",
                        ]
                    ],
                ]
            ]
        ],
        'client' => $config->getWalletAddressUrl(),
        'interact' => [
            'start' => ["redirect"],
            'finish' => [
                'method' => "redirect",
                'uri' => 'https://localhost/?paymentId=123423',
                'nonce' => "1234567890",
            ],
        ]
    ]
);
//@! end chunk 2

//@! start chunk 3 | title=Check grant state
if (!$grant instanceof \OpenPayments\Models\PendingGrant) {
    throw new \Error('Expected interactive grant');
}
//@! end chunk 3

//@! start chunk 4 | title=Output 
echo 'Please interact at the following URL: ' . $grant->interact->redirect . PHP_EOL;
echo 'CONTINUE_ACCESS_TOKEN = ' . $grant->continue->access_token->value . PHP_EOL;
echo 'CONTINUE_URI = ' . $grant->continue->uri . PHP_EOL;
echo 'GRANT OBJECT: ' . PHP_EOL . print_r($grant, true);
//@! end chunk 4
