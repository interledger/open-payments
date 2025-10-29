//@! start chunk 1 | title=Import dependencies
use open_payments::client::api::AuthenticatedResources;
use open_payments::client::utils::get_resource_server_url;
use open_payments::snippets::utils::{create_authenticated_client, get_env_var, load_env};
use open_payments::types::OutgoingPaymentRequest;
//@! end chunk 1

#[tokio::main]
async fn main() -> open_payments::client::Result<()> {
    load_env()?;

    //@! start chunk 2 | title=Initialize Open Payments client
    let client = create_authenticated_client()?;
    //@! end chunk 2

    //@! start chunk 3 | title=Prepare outgoing payment request
    let access_token = get_env_var("OUTGOING_PAYMENT_ACCESS_TOKEN")?;
    let quote_url = get_env_var("QUOTE_URL")?;
    let wallet_address_url = get_env_var("WALLET_ADDRESS_URL")?;
    let resource_server_url = get_resource_server_url(&wallet_address_url)?;

    let request = OutgoingPaymentRequest::FromQuote {
        wallet_address: wallet_address_url,
        quote_id: quote_url,
        metadata: None,
    };

    //@! end chunk 3

    //@! start chunk 4 | title=Create outgoing payment
    println!(
        "Outgoing payment create request JSON: {}",
        serde_json::to_string_pretty(&request)?
    );

    let payment = client
        .outgoing_payments()
        .create(&resource_server_url, &request, Some(&access_token))
        .await?;
    //@! end chunk 4

    //@! start chunk 5 | title=Output
    println!("Created outgoing payment: {payment:#?}");
    //@! end chunk 5
    Ok(())
}
