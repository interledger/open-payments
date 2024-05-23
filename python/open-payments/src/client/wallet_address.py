import requests
from typing import Optional

class WalletAddress:
    def __init__(self, timeout_seconds: Optional[int], use_http: Optional[bool]=False):
        self.timeout_seconds = timeout_seconds
        self.use_http = use_http

    def use_http_decorator(self, func):
        def wrapper(path):
            if self.use_http == True and path.startswith("https://"):
                path = "http://" + path[len("https://"):]
            return func(path)
        return wrapper

    @use_http_decorator
    def get(self, path: str):
        return requests.get(path, timeout=self.timeout_seconds)
