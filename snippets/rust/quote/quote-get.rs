//@! start chunk 1 | title=Import dependencies
use open_payments::client::api::AuthenticatedResources;
use open_payments::snippets::utils::{create_authenticated_client, get_env_var, load_env};
//@! end chunk 1

#[tokio::main]
async fn main() -> open_payments::client::Result<()> {
    load_env()?;

    //@! start chunk 2 | title=Initialize Open Payments client
    let client = create_authenticated_client()?;
    //@! end chunk 2

    //@! start chunk 3 | title=Get quote
    let gnap_token = get_env_var("QUOTE_ACCESS_TOKEN")?;
    let quote_url = get_env_var("QUOTE_URL")?;

    let quote = client.quotes().get(&quote_url, Some(&gnap_token)).await?;
    //@! end chunk 3

    //@! start chunk 4 | title=Output
    println!("Quote: {quote:#?}");
    //@! end chunk 4
    Ok(())
}
