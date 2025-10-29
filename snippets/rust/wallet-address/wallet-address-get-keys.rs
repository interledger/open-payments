//@! start chunk 1 | title=Import dependencies
use open_payments::client::api::UnauthenticatedResources;
use open_payments::snippets::utils::{create_unauthenticated_client, get_env_var, load_env};
//@! end chunk 1

#[tokio::main]
async fn main() -> open_payments::client::Result<()> {
    load_env()?;

    //@! start chunk 2 | title=Initialize Open Payments client
    let client = create_unauthenticated_client();
    //@! end chunk 2

    //@! start chunk 3 | title=Get wallet address information
    let wallet_address_url = get_env_var("WALLET_ADDRESS_URL")?;
    let wallet_address = client.wallet_address().get(&wallet_address_url).await?;
    //@! end chunk 3

    //@! start chunk 4 | title=Get keys
    let keys = client.wallet_address().get_keys(&wallet_address).await?;
    //@! end chunk 4

    //@! start chunk 5 | title=Output
    println!("Retrieved wallet address: {wallet_address:#?}");
    println!("Retrieved keys: {keys:#?}");
    //@! end chunk 5
    Ok(())
}
