from Crypto.PublicKey import ECC
from typing import Optional


class JWK:
    def __init__(self, kid, alg, key_type, crv, x):
        self.kid = kid
        self.alg = alg
        self.kty = key_type
        self.crv = crv
        self.x = x

def generate_jwk(key_id: str, private_key: Optional[ECC.EccKey] = None) -> JWK:

    if not key_id.strip():
        raise ValueError('KeyId cannot be empty')
    
    key_pair = private_key if private_key else ECC.generate(curve='Ed25519')
    public_key = key_pair.public_key()

    if public_key.__class__ is not ECC.EccKey:
        raise ValueError('Failed to derive public key')
    
    if public_key.curve != 'Ed25519' or not public_key.pointQ.x:
        raise ValueError('Key is not EdDSA-Ed25519')
    
    return JWK(alg='EdDSA', kid=key_id, key_type='OKP', crv=public_key.curve, x=str(public_key.pointQ.x))