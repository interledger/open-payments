<?php

//@! start chunk 1 | title=Import dependencies
use OpenPayments\AuthClient;
use OpenPayments\Config\Config;
//@! end chunk 1

//@! start chunk 2 | title=Initialize Open Payments unauthenticated client
$config = new Config($WALLET_ADDRESS);
$opClient = new AuthClient($config);
//@! end chunk 2

//@! start chunk 3 | title=Get wallet address keys
$walletKeys = $opClient->walletAddress()->getKeys([
    'url' => $config->getWalletAddressUrl()
]);
//@! end chunk 3

//@! start chunk 4 | title=Output wallet address keys
echo 'WALLET ADDRESS KEYS: ' . PHP_EOL . print_r($walletKeys, true);
//@! end chunk 4
