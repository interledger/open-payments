<?php

//@! start chunk 1 | title=Import dependencies
use OpenPayments\AuthClient;
use OpenPayments\Config\Config;
//@! end chunk 1

//@! start chunk 2 | title=Initialize Open Payments client
$config = new Config(
    $WALLET_ADDRESS,
    $PRIVATE_KEY,
    $KEY_ID
);
$opClient = new AuthClient($config);
//@! end chunk 2

//@! start chunk 3 | title=Create incoming payment
$newIncomingPayment = $opClient->incomingPayment()->create(
    [
        'url' => $wallet->resourceServer,
        'access_token' => $INCOMING_PAYMENT_GRANT_ACCESS_TOKEN
    ],
    [
        'walletAddress' => $config->getWalletAddressUrl(),
        'incomingAmount' => [
            'value' => "130",
            'assetCode' => 'USD',
            'assetScale' => 2
        ],
        'metadata' => [
            'description' => 'Test php snippets transaction with $1,30 amount',
            'externalRef' => 'INVOICE-' . uniqid()
        ],
        'expiresAt' => (new \DateTime())->add(new \DateInterval('PT59M'))->format("Y-m-d\TH:i:s.v\Z")
    ]
);
//@! end chunk 3

//@! start chunk 4 | title=Output
echo 'INCOMING_PAYMENT_URL: ' . $newIncomingPayment->id . PHP_EOL;
echo 'INCOMING PAYMENT OBJECT:' . PHP_EOL . print_r($newIncomingPayment, true);
//@! end chunk 4
