<?php

//@! start chunk 1 | title=Revoke token
$tokenResponse = $opClient->token()->revoke(
    [
            'access_token' => $ACCESS_TOKEN,
        'url' => $TOKEN_MANAGE_URL
    ]
);
//@! end chunk 1
