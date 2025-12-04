package main

//@! start chunk 1 | title=Import dependencies
import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	op "github.com/interledger/open-payments-go"
)

//@! end chunk 1

func main() {
	walletAddressURL := os.Getenv("WALLET_ADDRESS")
	if walletAddressURL == "" {
		log.Fatalf("WALLET_ADDRESS environment variable is required\n")
	}
	privateKeyBase64 := os.Getenv("PRIVATE_KEY")
	if privateKeyBase64 == "" {
		log.Fatalf("PRIVATE_KEY environment variable is required\n")
	}
	keyID := os.Getenv("KEY_ID")
	if keyID == "" {
		log.Fatalf("KEY_ID environment variable is required\n")
	}

	//@! start chunk 2 | title=Initialize Open Payments client
	client, err := op.NewAuthenticatedClient(walletAddressURL, privateKeyBase64, keyID)
	if err != nil {
		log.Fatalf("Error creating authenticated client: %v\n", err)
	}
	//@! end chunk 2

	//@! start chunk 3 | title=Get wallet address
	walletAddress, err := client.WalletAddress.Get(context.TODO(), op.WalletAddressGetParams{
		URL: walletAddressURL,
	})
	if err != nil {
		log.Fatalf("Error fetching wallet address: %v\n", err)
	}
	//@! end chunk 3

	//@! start chunk 4 | title=Output
	walletAddressJSON, err := json.MarshalIndent(walletAddress, "", "  ")
	if err != nil {
		log.Fatalf("Error marshaling wallet address: %v\n", err)
	}
	fmt.Println("WALLET ADDRESS:", string(walletAddressJSON))
	//@! end chunk 4
}

