<?php

//@! start chunk 1 | title=Revoke token
$token = $opClient->token()->rotate(
    [
        'access_token' => $ACCESS_TOKEN,
        'url' => $TOKEN_MANAGE_URL
    ]
);
//@! end chunk 1
        
//@! start chunk 2 | title=Output
echo 'ACCESS_TOKEN: ' . $token->value . PHP_EOL;
echo 'MANAGE_URL: ' . $token->manage . PHP_EOL;
//@! end chunk 2
