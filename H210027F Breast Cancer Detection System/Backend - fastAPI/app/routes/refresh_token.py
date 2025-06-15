from fastapi import APIRouter, HTTPException, status
from jose import JWTError, jwt
from ..utils import create_access_token, SECRET_KEY, ALGORITHM

router = APIRouter(tags=["Refresh Token"])

# Endpoint to refresh the access token
@router.post("/refresh-token")
async def refresh_token(refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        # Validate the refresh token (e.g., check if it exists in the database)
        user_data = {"sub": payload.get("sub")}  # Get user identifier from payload
        
        # Create a new access token using the user data from the refresh token
        new_access_token = create_access_token(data=user_data)
        return {"access_token": new_access_token, "token_type": "bearer"}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
