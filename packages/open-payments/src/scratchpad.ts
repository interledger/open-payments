import { createAuthenticatedClient } from './index'

async function main() {
  const client = await createAuthenticatedClient({
    keyId: 'test',
    privateKey: 'test',
    walletAddressUrl: 'test.com'
  })

  client.grant.request(
    {
      url: 'url'
    },
    {
      access_token: {
        access: [
          {
            type: 'incoming-payment',
            actions: ['create']
          }
        ]
      }
    }
  )
}

main()
