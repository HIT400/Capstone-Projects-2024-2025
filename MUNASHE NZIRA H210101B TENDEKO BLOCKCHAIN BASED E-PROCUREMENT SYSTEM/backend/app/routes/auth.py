from fastapi import APIRouter, HTTPException, Depends, Response, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.services.user import get_user_by_email, get_user_by_id
from app.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
)
from app.dependencies import get_db
from pydantic import BaseModel
from enum import Enum
from typing import Optional
import jwt

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

class UserRole(str, Enum):
    SUPPLIER = "supplier"
    PROCURING_ENTITY = "procuring_entity"
    BOTH = "both"

class UserCreate(BaseModel):
    email: str
    password: str
    role: UserRole

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    role: str

@router.post("/login", response_model=TokenResponse)
def login(user: UserLogin, response: Response, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, user.email)
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    access_token = create_access_token(
        user_id=str(db_user.id),
        email=db_user.email,
        role=db_user.role.value
    )
    refresh_token = create_refresh_token(user_id=str(db_user.id))
    
    response.set_cookie(
        key="p_at",
        value=access_token,
        httponly=False,
        secure=True,
        samesite="strict",
        max_age=3 * 60 * 60 
    )
    response.set_cookie(
        key="p_rt",
        value=refresh_token,
        httponly=False,
        secure=True,
        samesite="strict",
        max_age=30 * 24 * 60 * 60  
    )
    
    
    response.set_cookie(
        key="p_ur",
        value=db_user.role.value,
        httponly=False,
        secure=True,
        samesite="strict",
        max_age=3 * 60 * 60  
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": db_user.role.value
    }

@router.post("/refresh", response_model=TokenResponse)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("p_rt")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing refresh token"
        )
    
    try:
        payload = verify_token(refresh_token)
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        user_id = payload.get("sub")
        db_user = get_user_by_id(db, user_id)
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        new_access_token = create_access_token(
            user_id=str(db_user.id),
            email=db_user.email,
            role=db_user.role.value
        )
        new_refresh_token = create_refresh_token(user_id=str(db_user.id))
        
        response.set_cookie(
            key="p_at",
            value=new_access_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=3 * 60 * 60 
        )
        response.set_cookie(
            key="p_rt",
            value=new_refresh_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=30 * 24 * 60 * 60  
        )
        response.set_cookie(
            key="p_ur",
            value=db_user.role.value,
            httponly=False,
            secure=True,
            samesite="strict",
            max_age=3 * 60 * 60  
        )
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "role": db_user.role.value
        }
        
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
        response.delete_cookie("p_at")
        response.delete_cookie("p_rt")
        response.delete_cookie("p_ur")
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid refresh token: {str(e)}"
        )

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("p_at")
    response.delete_cookie("p_rt")
    response.delete_cookie("p_ur")
    
    return {"message": "Successfully logged out"}
