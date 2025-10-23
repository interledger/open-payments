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

    //@! start chunk 3 | title=Complete incoming payment
    let access_token = get_env_var("INCOMING_PAYMENT_ACCESS_TOKEN")?;
    let incoming_payment_url = get_env_var("INCOMING_PAYMENT_URL")?;

    let payment = client
        .incoming_payments()
        .complete(&incoming_payment_url, Some(&access_token))
        .await?;
    //@! end chunk 3

    //@! start chunk 4 | title=Output
    println!("Completed incoming payment: {payment:#?}");
    //@! end chunk 4
    Ok(())
}
