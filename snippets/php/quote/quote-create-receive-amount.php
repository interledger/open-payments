<?php

 //@! start chunk 1 | title=Get wallet address information
$wallet = $opClient->walletAddress()->get([
    'url' => $config->getWalletAddressUrl()
]);
//@! end chunk 1
//@! start chunk 2 | title=Create quote
$newQuote = $opClient->quote()->create(
    [
        'url' => $wallet->resourceServer,
        'access_token' => $QUOTE_GRANT_ACCESS_TOKEN,
    ],
    [
        'method' => "ilp",
        'walletAddress' => $wallet->id,
        'receiver' => $INCOMING_PAYMENT_URL,
        'receiveAmount' => [
            'assetCode' => $wallet->assetCode,
            'assetScale' => $wallet->assetScale,
                    'value' => "130",
        ],
    ]
);
//@! end chunk 2

//@! start chunk 3 | title=Output
echo 'QUOTE_URL ' . $newQuote->id . PHP_EOL;
echo 'QUOTE ' . print_r($newQuote, true) . PHP_EOL;
//@! end chunk 3
