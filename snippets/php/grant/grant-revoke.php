<?php

//@! start chunk 1 | title=Revoke grant
$response = $opClient->grant()->cancel(
    [
        'access_token'=> $ACCESS_TOKEN,
        'url' => $CONTINUE_URI
    ]
);
//@! end chunk 1
