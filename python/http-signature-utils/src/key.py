import os
import base64
import time
from Crypto.PublicKey import ECC
from typing import Optional

def load_key(key_file_path: str) -> ECC.EccKey:
    try:
        with open(key_file_path, "rb") as key_file:
            key_bytes = key_file.read()
    except FileNotFoundError:
        raise FileNotFoundError(f"Could not load file: {key_file_path}")

    try:
        key = ECC.import_key(key_bytes)
    except Exception:
        raise ValueError("File was loaded, but private key was invalid")

    if not is_key_ed25519(key):
        raise ValueError("Private key did not have Ed25519 curve")

    return key

def generate_key(directory: Optional[str] = None, file_name: Optional[str] = None) -> ECC.EccKey:
    key_pair = ECC.generate(curve='Ed25519')
    
    if directory:
        os.makedirs(directory, exist_ok=True)
        file_name = file_name or f"private-key-{int(time.time())}.pem"
        key_file_path = os.path.join(directory, file_name)
        with open(key_file_path, "wt") as key_file:
            key_file.write(key_pair.export_key(format='PEM', passphrase=None))

    return key_pair

def load_or_generate_key(key_file_path: Optional[str] = None, generate_key_args: Optional[dict] = None) -> ECC.EccKey:
    if key_file_path:
        try:
            return load_key(key_file_path)
        except FileNotFoundError:
            pass
        except Exception:
            pass

    return generate_key(**generate_key_args)

def load_base64_key(base64_key: str) -> Optional[ECC.EccKey]:
    try:
        private_key_bytes = base64.b64decode(base64_key)
        key = ECC.import_key(private_key_bytes)
        if is_key_ed25519(key):
            return key
    except Exception:
        pass

def is_key_ed25519(key: ECC.EccKey) -> bool:
    return key.curve == 'Ed25519'
