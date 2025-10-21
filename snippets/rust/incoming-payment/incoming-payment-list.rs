//@! start chunk 1 | title=Import dependencies
use open_payments::client::api::AuthenticatedResources;
use open_payments::client::utils::get_resource_server_url;
use open_payments::snippets::utils::{create_authenticated_client, get_env_var, load_env};
//@! end chunk 1

#[tokio::main]
async fn main() -> open_payments::client::Result<()> {
    load_env()?;

    //@! start chunk 2 | title=Initialize Open Payments client
    let client = create_authenticated_client()?;
    //@! end chunk 2

    //@! start chunk 3 | title=List incoming payments
    let gnap_token = get_env_var("INCOMING_PAYMENT_ACCESS_TOKEN")?;

    let wallet_address_url = get_env_var("WALLET_ADDRESS_URL")?;
    let resource_server_url = get_resource_server_url(&wallet_address_url)?;
    let response = client
        .incoming_payments()
        .list(
            &resource_server_url,
            &wallet_address_url,
            None,
            Some(10),
            None,
            Some(&gnap_token),
        )
        .await?;
    //@! end chunk 3

    //@! start chunk 4 | title=Output
    println!("Incoming payments: {:#?}", response.result);
    println!("Pagination info: {:#?}", response.pagination);

    if response.pagination.has_next_page {
        if let Some(end_cursor) = response.pagination.end_cursor {
            let next_page = client
                .incoming_payments()
                .list(
                    &resource_server_url,
                    &wallet_address_url,
                    Some(&end_cursor),
                    Some(10),
                    None,
                    Some(&gnap_token),
                )
                .await?;
            println!("Next page of incoming payments: {:#?}", next_page.result);
        }
    }
    //@! end chunk 4

    Ok(())
}
