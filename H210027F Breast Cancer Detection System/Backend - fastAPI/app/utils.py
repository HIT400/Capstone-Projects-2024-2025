import os
from fastapi import HTTPException, Depends, status
from tensorflow.keras.models import load_model
from fastapi.security import OAuth2PasswordBearer
from datetime import timedelta, datetime, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from typing import Optional


# Configurations
SECRET_KEY = "throughout+heaven+and+earth+I+alone+am+the+Honored+One"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440
REFRESH_TOKEN_EXPIRE_MINUTES = 1440  # Refresh token expiration time (e.g., 1 day)
UPLOAD_FOLDER = "uploads"

# OAuth2 setup for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'breast_cancer_classifier.h5')
try:
    model = load_model(MODEL_PATH)
except Exception as e:
    raise HTTPException(status_code=500, detail=f"Model loading failed: {str(e)}")



# Function to create an access token for authentication
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# create a refresh token
def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Dependency to get the current user based on access token
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


# Hashing class
class Hash():
    def bcrypt(self, password):
        return pwd_context.hash(password)

    def verify(self, plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)