import os
import unittest
import base64
import shutil
from Crypto.PublicKey import ECC
from Crypto.Random import get_random_bytes
from key import load_or_generate_key, load_key, generate_key, load_base64_key

class TestKeyMethods(unittest.TestCase):
    TMP_DIR = './tmp'

    @classmethod
    def setUp(self):
        os.makedirs(self.TMP_DIR, exist_ok=True)

    @classmethod
    def tearDown(self):
        shutil.rmtree(self.TMP_DIR)

    def test_load_or_generate_key_generates_and_saves(self):
        key = load_or_generate_key(generate_key_args={'directory': self.TMP_DIR})
        self.assertTrue(key.has_private())
        self.assertEqual(key.curve, 'Ed25519')

    def test_load_or_generate_key_generates_new_key_on_parsing_error(self):
        key = load_or_generate_key(key_file_path='/some/wrong/file', generate_key_args={'directory': self.TMP_DIR})
        self.assertTrue(key.has_private())
        self.assertEqual(key.curve, 'Ed25519')

    def test_load_or_generate_key_parses_existing_key(self):
        key_pair = ECC.generate(curve='Ed25519')
        key_file = os.path.join(self.TMP_DIR, 'test-private-key.pem')
        with open(key_file, 'wt') as f:
            f.write(key_pair.export_key(format='PEM'))

        key = load_or_generate_key(key_file_path=key_file)
        self.assertTrue(key.has_private())
        self.assertEqual(key.curve, 'Ed25519')

    def test_load_key_parses_existing_key(self):
        key_pair = ECC.generate(curve='Ed25519')
        key_file = os.path.join(self.TMP_DIR, 'test-private-key.pem')
        with open(key_file, 'wt') as f:
            f.write(key_pair.export_key(format='PEM'))

        key = load_key(key_file_path=key_file)
        self.assertTrue(key.has_private())
        self.assertEqual(key.curve, 'Ed25519')

    def test_load_key_throws_on_nonexistent_file(self):
        with self.assertRaises(FileNotFoundError) as context:
            load_key(key_file_path='/nonexistent/file')
        self.assertEqual(str(context.exception), 'Could not load file: /nonexistent/file')

    def test_load_key_throws_on_invalid_file(self):
        key_file = os.path.join(self.TMP_DIR, 'test-private-key.pem')
        with open(key_file, 'w') as f:
            f.write('not a private key')

        with self.assertRaises(ValueError) as context:
            load_key(key_file_path=key_file)
        self.assertEqual(str(context.exception), 'File was loaded, but private key was invalid')

    def test_load_key_throws_on_wrong_curve(self):
        key_pair = ECC.generate(curve='Ed448')
        key_file = os.path.join(self.TMP_DIR, 'test-private-key.pem')
        with open(key_file, 'wt') as f:
            f.write(key_pair.export_key(format='PEM'))

        with self.assertRaises(ValueError) as context:
            load_key(key_file_path=key_file)
        self.assertEqual(str(context.exception), 'Private key did not have Ed25519 curve')

    def test_generate_key_generates_key(self):
        key = generate_key()
        self.assertTrue(key.has_private())
        self.assertEqual(key.curve, 'Ed25519')

    def test_generate_key_generates_and_saves(self):
        key = generate_key(directory=self.TMP_DIR)
        self.assertTrue(key.has_private())
        self.assertEqual(key.curve, 'Ed25519')
        key_files = os.listdir(self.TMP_DIR)
        self.assertEqual(len(key_files), 1)
        with open(os.path.join(self.TMP_DIR, key_files[0]), 'r') as key_file:
            self.assertEqual(key_file.read(), key.export_key(format='PEM'))

    def test_generate_key_generates_and_saves_with_custom_filename(self):
        key = generate_key(directory=self.TMP_DIR, file_name='custom-key.pem')
        self.assertTrue(key.has_private())
        self.assertEqual(key.curve, 'Ed25519')
        key_files = os.listdir(self.TMP_DIR)
        self.assertEqual(len(key_files), 1)
        self.assertEqual(key_files[0], 'custom-key.pem')
        with open(os.path.join(self.TMP_DIR, key_files[0]), 'r') as key_file:
            self.assertEqual(key_file.read(), key.export_key(format='PEM'))

    def test_load_base64_key_loads_encoded_key(self):
        key = generate_key(directory=self.TMP_DIR, file_name='base-test-key.pem')
        base64_key = base64.b64encode(key.export_key(format='PEM').encode()).decode('utf-8')
        loaded_key = load_base64_key(base64_key)
        self.assertTrue(loaded_key.has_private())
        self.assertEqual(loaded_key.curve, 'Ed25519')

    def test_load_base64_key_returns_none_on_non_ed25519_key(self):
        rsa_key = get_random_bytes(2048)
        base64_rsa_key = base64.b64encode(rsa_key).decode('utf-8')
        loaded_key = load_base64_key(base64_rsa_key)
        self.assertIsNone(loaded_key)

if __name__ == '__main__':
    unittest.main()
