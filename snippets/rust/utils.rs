use open_payments::client::{
    AuthenticatedClient, ClientConfig, OpClientError, Result, UnauthenticatedClient,
};
use open_payments::client::utils as client_utils;
use open_payments::http_signature::jwk::Jwk;
use dotenv::dotenv;
use std::{env, path::PathBuf};

pub fn load_env() -> Result<()> {
    dotenv().ok();
    Ok(())
}

pub fn get_env_var(key: &str) -> Result<String> {
    env::var(key).map_err(|_| {
        OpClientError::other(format!("{key} environment variable not set")).into()
    })
}

pub fn create_authenticated_client() -> Result<AuthenticatedClient> {
    let wallet_address_url = get_env_var("WALLET_ADDRESS_URL")?;
    let private_key_path = PathBuf::from(get_env_var("PRIVATE_KEY_PATH")?);
    let key_id = get_env_var("KEY_ID")?;
    let key_id_clone = key_id.clone();
    let jwks_path = get_env_var("JWKS_PATH").ok().map(PathBuf::from);

    let client = AuthenticatedClient::new(ClientConfig {
        key_id,
        private_key_path,
        jwks_path,
        wallet_address_url,
    })
    .map_err(|e| OpClientError::other(format!("Client creation error: {e}")))?;
    Jwk::new(key_id_clone, Some(&client.signing_key))
        .map_err(|e| OpClientError::other(format!("JWK error: {e}")))?;
    Ok(client)
}

pub fn create_unauthenticated_client() -> UnauthenticatedClient {
    UnauthenticatedClient::new()
}

pub fn get_resource_server_url(wallet_address_url: &str) -> Result<String> {
    client_utils::get_resource_server_url(wallet_address_url)
}
