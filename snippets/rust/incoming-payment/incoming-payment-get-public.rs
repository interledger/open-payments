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

    //@! start chunk 3 | title=Get without authentication
    let incoming_payment_url = get_env_var("INCOMING_PAYMENT_URL")?;

    let payment = client
        .public_incoming_payments()
        .get(&incoming_payment_url)
        .await?;
    //@! end chunk 3

    //@! start chunk 4 | title=Output
    println!("Public incoming payment: {payment:#?}");
    //@! end chunk 4
    Ok(())
}


