//@! start chunk 1 | title=Import dependencies
use open_payments::client::AuthenticatedResources;
use open_payments::snippets::utils::{create_authenticated_client, get_env_var, load_env};
use open_payments::types::auth::ContinueResponse;
//@! end chunk 1

#[tokio::main]
async fn main() -> open_payments::client::Result<()> {
    load_env()?;

    //@! start chunk 2 | title=Initialize Open Payments client
    let client = create_authenticated_client()?;
    //@! end chunk 2

    //@! start chunk 3 | title=Continue grant
    let gnap_token = get_env_var("CONTINUE_ACCESS_TOKEN")?;
    let continue_uri = get_env_var("CONTINUE_URI")?;
    let interact_ref = get_env_var("INTERACT_REF")?;

    let response = client
        .grant()
        .continue_grant(&continue_uri, &interact_ref, Some(&gnap_token))
        .await?;
    //@! end chunk 3

    //@! start chunk 4 | title=Output
    match response {
        ContinueResponse::WithToken { access_token, .. } => {
            println!("Received access token: {:#?}", access_token.value);
            println!(
                "Received access token manage URL: {:#?}",
                access_token.manage
            );
        }
        ContinueResponse::Pending { .. } => {
            println!("Pending");
        }
    }
    //@! end chunk 4

    Ok(())
}
