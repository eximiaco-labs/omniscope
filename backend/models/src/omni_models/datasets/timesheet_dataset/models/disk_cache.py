import pickle
import base64
from pathlib import Path
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

class TimesheetDiskCache:
    def __init__(self, cache_dir: str, api_key: str):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.fernet = self._get_encryption_key(api_key)

    def _get_encryption_key(self, api_key: str) -> Fernet:
        salt = b'omni_salt'
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(api_key.encode()))
        return Fernet(key)

    def save(self, dataset, filename: str) -> None:
        """Save an encrypted timesheet dataset to file"""
        if dataset is None:
            return

        filepath = self.cache_dir / f"{filename}.timesheet"
        
        # Serialize and encrypt the dataset
        serialized = pickle.dumps(dataset)
        encrypted = self.fernet.encrypt(serialized)
        
        # Save to file
        with open(filepath, "wb") as file:
            file.write(encrypted)

    def load(self, filename: str):
        """Load an encrypted timesheet dataset from file"""
        try:
            filepath = self.cache_dir / f"{filename}.timesheet"
            
            # Read encrypted data
            with open(filepath, "rb") as file:
                encrypted = file.read()
                
            # Decrypt and deserialize
            decrypted = self.fernet.decrypt(encrypted)
            return pickle.loads(decrypted)
        except:
            return None
    
    