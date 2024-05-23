from wallet_address import WalletAddress
from typing import Optional

class Client:
    def __init__(self, timeout_seconds: Optional[int], use_http: Optional[bool]=False):
        self.timeout_seconds = timeout_seconds
        self.use_http = use_http

class UnauthenticatedClient(Client):
    def __init__(self):
        self.wallet_address = WalletAddress(self.timeout_seconds, self.use_http)

# if __name__ == "__main__":
#     client = UnauthenticatedClient(100)
#     client.walletAddress()