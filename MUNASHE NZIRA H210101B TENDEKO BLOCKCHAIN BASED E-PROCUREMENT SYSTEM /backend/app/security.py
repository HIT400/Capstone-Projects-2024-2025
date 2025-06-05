import jwt
import bcrypt
import os
from datetime import datetime, timedelta
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend

ACCESS_TOKEN_EXPIRE_MINUTES = 3 * 60  # 3 hours
REFRESH_TOKEN_EXPIRE_DAYS = 30
ALGORITHM = "RS256" 

PRIVATE_KEY_PATH = "private_key.pem"
PUBLIC_KEY_PATH = "public_key.pem"

def generate_key_pair():
    """Generate RSA key pair if not already present"""
    if not os.path.exists(PRIVATE_KEY_PATH) or not os.path.exists(PUBLIC_KEY_PATH):
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        
        with open(PRIVATE_KEY_PATH, "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))
        
        public_key = private_key.public_key()
        with open(PUBLIC_KEY_PATH, "wb") as f:
            f.write(public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            ))


def load_private_key():
    """Load the private key for signing tokens"""
    with open(PRIVATE_KEY_PATH, "rb") as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None,
            backend=default_backend()
        )
    return private_key


def load_public_key():
    """Load the public key for verifying tokens"""
    with open(PUBLIC_KEY_PATH, "rb") as key_file:
        public_key = serialization.load_pem_public_key(
            key_file.read(),
            backend=default_backend()
        )
    return public_key

def hash_password(password: str) -> str:
    """Hash a password for storing"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a stored password against a provided password"""
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str, role: str):
    """Create a new access token"""
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": expire,
        "type": "access"
    }
    private_key = load_private_key()
    return jwt.encode(payload, private_key, algorithm=ALGORITHM)


def create_refresh_token(user_id: str):
    """Create a new refresh token with longer expiration"""
    expire = datetime.now() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": user_id,
        "exp": expire,
        "type": "refresh"
    }
    private_key = load_private_key()
    return jwt.encode(payload, private_key, algorithm=ALGORITHM)


def verify_token(token: str):
    """Verify and decode a token"""
    try:
        public_key = load_public_key()
        payload = jwt.decode(token, public_key, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")


def refresh_access_token(refresh_token: str, email: str, role: str):
    """Generate a new access token using a valid refresh token"""
    try:
        payload = verify_token(refresh_token)
        
        if payload.get("type") != "refresh":
            raise ValueError("Not a refresh token")
        
        return create_access_token(payload["sub"], email, role)
    except Exception as e:
        raise ValueError(f"Failed to refresh token: {str(e)}")

#TODO 
def generate_reset_token(email: str):
    pass

generate_key_pair()