<?php

$wallet = $opClient->walletAddress()->get([
    'url' => $config->getWalletAddressUrl()
]);

//@! start chunk 1 | title=Create quote
$newQuote = $opClient->quote()->create(
    [
        'url' => $wallet->resourceServer,
        'access_token' => $QUOTE_GRANT_ACCESS_TOKEN,
    ],
    [
        'method' => "ilp",
        'walletAddress' => $wallet->id,
        'receiver' => $INCOMING_PAYMENT_URL,
    ]
);
//@! end chunk 1

//@! start chunk 2 | title=Output
echo 'QUOTE_URL ' . $newQuote->id . PHP_EOL;
echo 'QUOTE ' . print_r($newQuote, true) . PHP_EOL;
//@! end chunk 2
