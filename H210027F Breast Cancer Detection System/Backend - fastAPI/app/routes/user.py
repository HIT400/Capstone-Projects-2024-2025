from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# modules from the app package
from .. import schemas
from ..services import user_service
from ..database import get_db


# Initialize APIRouter
router = APIRouter(tags=["Authentication"])

# Route to create a new user (Doctor)
@router.post("/register", response_model=schemas.DoctorRegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_doctor(doctor_data: schemas.DoctorRegistration, db: Session = Depends(get_db)) -> dict:
    return await user_service.register_doctor(doctor_data, db)

# Route to login / authenticate a user (Doctor)
@router.post("/login", response_model=schemas.LoginResponse, status_code=status.HTTP_200_OK)
async def login(data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> dict:
    return await user_service.login(data, db)