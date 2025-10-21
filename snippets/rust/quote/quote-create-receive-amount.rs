//@! start chunk 1 | title=Import dependencies
use open_payments::client::api::AuthenticatedResources;
use open_payments::client::utils::get_resource_server_url;
use open_payments::snippets::utils::{create_authenticated_client, get_env_var, load_env};
use open_payments::types::{resource::CreateQuoteRequest, Amount, PaymentMethodType, Receiver};
//@! end chunk 1

#[tokio::main]
async fn main() -> open_payments::client::Result<()> {
    load_env()?;

    //@! start chunk 2 | title=Initialize Open Payments client
    let client = create_authenticated_client()?;
    //@! end chunk 2

    //@! start chunk 3 | title=Create quote with receive amount
    let gnap_token = get_env_var("QUOTE_ACCESS_TOKEN")?;
    let incoming_payment_url = get_env_var("INCOMING_PAYMENT_URL")?;
    let wallet_address_url = get_env_var("WALLET_ADDRESS_URL")?;
    let resource_server_url = get_resource_server_url(&wallet_address_url)?;

    let request = CreateQuoteRequest::FixedReceiveAmountQuote {
        wallet_address: wallet_address_url,
        receiver: Receiver(incoming_payment_url),
        method: PaymentMethodType::Ilp,
        receive_amount: Amount {
            value: "1000".to_string(),
            asset_code: "EUR".to_string(),
            asset_scale: 2u8,
        },
    };

    println!(
        "Quote create request JSON: {}",
        serde_json::to_string_pretty(&request)?
    );

    let quote = client
        .quotes()
        .create(&resource_server_url, &request, Some(&gnap_token))
        .await?;
    //@! end chunk 3

    //@! start chunk 4 | title=Output
    println!("Created quote: {quote:#?}");
    //@! end chunk 4
    Ok(())
}
