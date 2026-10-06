use chrono::{Duration, Utc};
//@! start chunk 1 | title=Import dependencies
use open_payments::client::api::AuthenticatedResources;
use open_payments::client::api::UnauthenticatedResources;
#[path = "../utils.rs"]
mod snippet_utils;
use snippet_utils::{create_authenticated_client, get_env_var, get_resource_server_url, load_env};
use open_payments::types::{resource::CreateIncomingPaymentRequest, Amount};
//@! end chunk 1

#[tokio::main]
async fn main() -> open_payments::client::Result<()> {
    load_env()?;

    //@! start chunk 2 | title=Initialize Open Payments client
    let client = create_authenticated_client()?;
    //@! end chunk 2

    //@! start chunk 3 | title=Prepare incoming payment request
    let access_token = get_env_var("INCOMING_PAYMENT_ACCESS_TOKEN")?;
    let wallet_address_url = get_env_var("WALLET_ADDRESS_URL")?;
    let resource_server_url = get_resource_server_url(&wallet_address_url)?;

    // Unwrap is safe here because we are adding a positive duration to the current time
    let expires_at = Utc::now()
        .checked_add_signed(Duration::minutes(10000))
        .unwrap();

    let request = CreateIncomingPaymentRequest {
        wallet_address: wallet_address_url,
        incoming_amount: Some(Amount {
            value: "1000".to_string(),
            asset_code: "EUR".to_string(),
            asset_scale: 2u8,
        }),
        expires_at: Some(expires_at),
        metadata: None,
    };
    //@! end chunk 3

    //@! start chunk 4 | title=Create incoming payment
    println!(
        "Incoming payment create request JSON: {}",
        serde_json::to_string_pretty(&request)?
    );

    let payment = client
        .incoming_payments()
        .create(&resource_server_url, &request, Some(&access_token))
        .await?;
    //@! end chunk 4

    //@! start chunk 5 | title=Output
    println!("Created incoming payment: {payment:#?}");
    //@! end chunk 5
    Ok(())
}
