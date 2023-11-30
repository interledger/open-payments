import unittest
from Crypto.PublicKey import ECC
from jwk import generate_jwk

class TestGenerateJWKFunction(unittest.TestCase):
    def test_generate_jwk(self):
        jwk = generate_jwk(key_id='keyid')
        print(jwk)
        self.assertEqual(jwk.alg, "EdDSA")
        self.assertEqual(jwk.kid, "keyid")
        self.assertEqual(jwk.kty, "OKP")
        self.assertEqual(jwk.crv, "Ed25519")
        self.assertIsInstance(jwk.x, str)

    def test_generate_jwk_with_defined_private_key(self):
        private_key = ECC.generate(curve='Ed25519')
        jwk = generate_jwk(key_id='keyid', private_key=private_key)
        self.assertEqual(jwk.alg, "EdDSA")
        self.assertEqual(jwk.kid, "keyid")
        self.assertEqual(jwk.kty, "OKP")
        self.assertEqual(jwk.crv, "Ed25519")
        self.assertIsInstance(jwk.x, str)

    def test_throws_if_empty_key_id(self):
        with self.assertRaises(ValueError) as context:
            generate_jwk(key_id='')
        self.assertEqual(str(context.exception), 'KeyId cannot be empty')

    def test_throws_if_provided_key_not_ed25519(self):
        private_key = ECC.generate(curve='Ed448')
        with self.assertRaises(ValueError) as context:
            generate_jwk(key_id='keyid', private_key=private_key)
        self.assertEqual(str(context.exception), 'Key is not EdDSA-Ed25519')

if __name__ == '__main__':
    unittest.main()