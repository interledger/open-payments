<?php

//@! start chunk 1 | title=Import dependencies
use OpenPayments\AuthClient;
use OpenPayments\Config\Config;
//@! end chunk 1

//@! start chunk 2 | title=Initialize Open Payments unauthenticated client
$config = new Config($WALLET_ADDRESS);
$opClient = new AuthClient($config); // because of missing keys in config, this will be an unauthenticated client
//@! end chunk 2

//@! start chunk 3 | title=Get wallet address
$wallet = $opClient->walletAddress()->get([
    'url' => $config->getWalletAddressUrl()
]);
//@! end chunk 3

//@! start chunk 4 | title=Output wallet address information
echo 'WALLET ADDRESS: ' . PHP_EOL . print_r($wallet, true);
//@! end chunk 4
