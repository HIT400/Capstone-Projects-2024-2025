from fastapi import Depends, HTTPException, status, Request , WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session
from app.schemas.db_config import User, UserRole, SessionLocal
from app.services.user import get_user_by_id
from app.security import ALGORITHM, verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = verify_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
        
        user = get_user_by_id(db, user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user
    
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}"
        )


def authorize_role(required_role: UserRole):
    def role_checker(user: User = Depends(get_current_user)):
        if user.role != required_role and user.role != UserRole.BOTH:
            raise HTTPException(
                status_code=403, 
                detail=f"Access forbidden: Requires {required_role.value} role"
            )
        return user
    return role_checker


async def get_token_from_query(websocket: WebSocket):
    # Get token from query parameters
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return None
    return token


async def get_websocket_user(websocket: WebSocket, db: Session = Depends(get_db)):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return None

    try:
        payload = verify_token(token)  # Now using RS256 with public key
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return None

        user = get_user_by_id(db, user_id)
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return None

        return user

    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return None