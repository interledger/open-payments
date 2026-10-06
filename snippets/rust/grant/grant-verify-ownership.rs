//@! start chunk 1 | title=Import dependencies
use open_payments::client::api::UnauthenticatedResources;
use open_payments::client::AuthenticatedResources;
#[path = "../utils.rs"]
mod snippet_utils;
use open_payments::types::{
    GrantRequest, GrantResponse, InteractFinish, InteractRequest, Subject, SubjectIdentifier,
    SubjectIdentifierFormat,
};
use snippet_utils::{create_authenticated_client, get_env_var, load_env};
use uuid::Uuid;
//@! end chunk 1

#[tokio::main]
async fn main() -> open_payments::client::Result<()> {
    load_env()?;

    //@! start chunk 2 | title=Initialize Open Payments client
    let client = create_authenticated_client()?;
    //@! end chunk 2

    //@! start chunk 3 | title=Get wallet address information
    let wallet_address_url = get_env_var("WALLET_ADDRESS_URL")?;
    let user_wallet_address = client.wallet_address().get(&wallet_address_url).await?;
    //@! end chunk 3

    //@! start chunk 4 | title=Request subject grant to verify wallet address ownership
    let grant_request = GrantRequest::subject_only(
        Subject {
            sub_ids: vec![SubjectIdentifier {
                id: user_wallet_address.id.clone(),
                format: SubjectIdentifierFormat::Uri,
            }],
        },
        Some(InteractRequest {
            start: vec!["redirect".to_string()],
            finish: Some(InteractFinish {
                method: "redirect".to_string(),
                uri: "http://localhost".to_string(),
                nonce: Uuid::new_v4().to_string(),
            }),
        }),
    );

    println!(
        "Grant request JSON: {}",
        serde_json::to_string_pretty(&grant_request)?
    );

    let response = client
        .grant()
        .request(&user_wallet_address.auth_server, &grant_request, None)
        .await?;
    //@! end chunk 4

    //@! start chunk 5 | title=Output
    match response {
        GrantResponse::WithToken { access_token, .. } => {
            println!("Received access token: {:#?}", access_token.value);
            println!(
                "Received access token manage URL: {:#?}",
                access_token.manage
            );
        }
        GrantResponse::WithInteraction {
            interact,
            continue_,
        } => {
            println!("Received interact: {interact:#?}");
            println!("Received continue: {continue_:#?}");
        }
    }
    //@! end chunk 5

    Ok(())
}
