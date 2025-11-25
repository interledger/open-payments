<?php

$wallet = $opClient->walletAddress()->get([
    'url' => $config->getWalletAddressUrl()
]);

//@! start chunk 1 | title=Create quote
$quote = $opClient->quote()->get(
    [
        'access_token' => $QUOTE_GRANT_ACCESS_TOKEN,
        'url' => $QUOTE_URL
    ]
);
//@! end chunk 1

//@! start chunk 2 | title=Output
echo 'QUOTE_URL ' . $quote->id . PHP_EOL;
echo 'QUOTE ' . print_r($quote, true) . PHP_EOL;
//@! end chunk 2
