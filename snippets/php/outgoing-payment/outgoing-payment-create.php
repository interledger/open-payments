<?php

 //@! start chunk 1 | title=Create outgoing payment
$newOutgoingPayment = $opClient->outgoingPayment()->create(
    [
        'url' => $wallet->resourceServer,
        'access_token' => $OUTGOING_PAYMENT_GRANT_ACCESS_TOKEN
    ],
    [
        'walletAddress' => $config->getWalletAddressUrl(),
        'quoteId' => $QUOTE_URL,
        'metadata' => [
            'description' => 'Test outgoing payment',
            'reference' => '1234567890',
            'invoiceId' => '1234567890',
            'customData' => [
                'key1' => 'value1',
                'key2' => 'value2'
            ]
        ],
    ]
);
//@! end chunk 1

//@! start chunk 2 | title=Create outgoing payment with amount
$newOutgoingPayment = $opClient->outgoingPayment()->create(
    [
        'url' => $wallet->resourceServer,
        'access_token' => $OUTGOING_PAYMENT_GRANT_ACCESS_TOKEN
    ],
    [
        'walletAddress' => $config->getWalletAddressUrl(),
        'incomingPayment' => $INCOMING_PAYMENT_URL,
        'debitAmount' => [
            'value' => '9',
            'assetCode' => 'USD',
            'assetScale' => 2
        ],
        'metadata' => [
            'description' => 'Test outgoing payment',
            'reference' => '1234567890',
            'invoiceId' => '1234567890',
            'customData' => [
                'key1' => 'value1',
                'key2' => 'value2'
            ]
        ],
    ]
);
//@! end chunk 2

//@! start chunk 3 | title=Output
echo 'OUTGOING_PAYMENT_URL: '.$newOutgoingPayment->id . PHP_EOL;
echo 'OUTGOING_PAYMENT OBJECT: ' . PHP_EOL . print_r($newOutgoingPayment, true) . PHP_EOL;
//@! end chunk 3
