<?php

//@! start chunk 1 | title=Request outgoing payment grant with interval
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
                        'debitAmount' => [
                            'assetCode' => 'USD',
                            'assetScale' => 2,
                            'value' => "132",
                        ],
                        'interval' => 'R/2025-04-22T08:00:00Z/P1D',
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
//@! end chunk 1
