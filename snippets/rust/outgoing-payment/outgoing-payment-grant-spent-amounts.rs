//@! start chunk 1 | title=Import dependencies
use open_payments::client::api::{AuthenticatedResources, UnauthenticatedResources};
#[path = "../utils.rs"]
mod snippet_utils;
use snippet_utils::{create_authenticated_client, get_env_var, get_resource_server_url, load_env};
//@! end chunk 1

#[tokio::main]
async fn main() -> open_payments::client::Result<()> {
    load_env()?;

    //@! start chunk 2 | title=Initialize Open Payments client
    let client = create_authenticated_client()?;
    //@! end chunk 2

    //@! start chunk 3 | title=Get spent amounts for current outgoing payment grant
    let wallet_address_url = get_env_var("WALLET_ADDRESS_URL")?;
    let resource_server_url =
        get_resource_server_url(&wallet_address_url)?;
    let access_token = get_env_var("OUTGOING_PAYMENT_ACCESS_TOKEN")?;

    let grant_spent_amounts = client
        .outgoing_payments()
        .get_grant_spent_amounts(&resource_server_url, Some(&access_token))
        .await?;
    //@! end chunk 3

    //@! start chunk 4 | title=Output
    println!(
        "GRANT_SPENT_DEBIT_AMOUNT: {:#?}",
        grant_spent_amounts.spent_debit_amount
    );
    println!(
        "GRANT_SPENT_RECEIVE_AMOUNT: {:#?}",
        grant_spent_amounts.spent_receive_amount
    );
    //@! end chunk 4

    Ok(())
}
