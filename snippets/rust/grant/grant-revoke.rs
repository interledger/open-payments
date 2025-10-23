//@! start chunk 1 | title=Import dependencies
use open_payments::client::AuthenticatedResources;
use open_payments::snippets::utils::{create_authenticated_client, get_env_var, load_env};
//@! end chunk 1

#[tokio::main]
async fn main() -> open_payments::client::Result<()> {
    load_env()?;

    //@! start chunk 2 | title=Initialize Open Payments client
    let client = create_authenticated_client()?;
    //@! end chunk 2

    //@! start chunk 3 | title=Revoke grant
    let access_token = get_env_var("CONTINUE_ACCESS_TOKEN")?;
    let continue_uri = get_env_var("CONTINUE_URI")?;

    client
        .grant()
        .cancel(&continue_uri, Some(&access_token))
        .await?;
    //@! end chunk 3

    //@! start chunk 4 | title=Output
    println!("Grant cancelled successfully");
    //@! end chunk 4
    Ok(())
}
