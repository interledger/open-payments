//@! start chunk 1 | title=Import dependencies
use open_payments::client::api::UnauthenticatedResources;
use open_payments::client::AuthenticatedResources;
use open_payments::snippets::utils::{create_authenticated_client, get_env_var, load_env};
use open_payments::types::{
    auth::{AccessItem, AccessTokenRequest, GrantRequest, QuoteAction},
    GrantResponse,
};
//@! end chunk 1

#[tokio::main]
async fn main() -> open_payments::client::Result<()> {
    load_env()?;

    //@! start chunk 2 | title=Initialize Open Payments client
    // Authenticated client can be also used for unauthenticated resources
    let client = create_authenticated_client()?;
    //@! end chunk 2

    //@! start chunk 3 | title=Get wallet address information
    let wallet_address_url = get_env_var("WALLET_ADDRESS_URL")?;
    let wallet_address = client.wallet_address().get(&wallet_address_url).await?;
    //@! end chunk 3

    //@! start chunk 4 | title=Request quote grant
    let grant_request = GrantRequest::new(
        AccessTokenRequest {
            access: vec![AccessItem::Quote {
                actions: vec![QuoteAction::Create, QuoteAction::Read, QuoteAction::ReadAll],
            }],
        },
        None,
    );

    println!(
        "Grant request JSON: {}",
        serde_json::to_string_pretty(&grant_request)?
    );

    let response = client
        .grant()
        .request(&wallet_address.auth_server, &grant_request)
        .await?;
    //@! end chunk 4

    //@! start chunk 5 | title=Output
    match response {
        GrantResponse::WithToken { access_token, .. } => {
            println!("Received access token: {:#?}", access_token.value);
            println!(
                "Received access token manage URL: {:#?}",
                access_token.manage
            );
        }
        GrantResponse::WithInteraction { .. } => {
            unreachable!("Interaction not required for quotes");
        }
    }
    //@! end chunk 5

    Ok(())
}
