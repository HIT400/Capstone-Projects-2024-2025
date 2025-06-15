from pydantic import BaseModel, EmailStr, field_validator, Field
from typing import Optional, List


# ---/register endpoint---
# Input model
class DoctorRegistration(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr 
    password: str = Field(..., min_length=8, max_length=50, description="Password must be at least 8 characters long")

    @field_validator('email')
    def validate_email(cls, email):
        # Custom validation: Ensure the email ends with '@gmail.com'
        if not email.endswith('@gmail.com'):
            raise ValueError('Please enter a valid Gmail address')
        return email
        
# Response model
class DoctorRegistrationResponse(BaseModel):
    success: bool
    doctor_email: EmailStr
    

# ---/login endpoint---
# Input model
class LoginRequest(BaseModel):
    username: str
    password: str

# Response model
class LoginResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'


# ---/predict endpoint---
# response model
class PredictResponse(BaseModel):
    id: int
    result: str
    confidence: float
    patient: dict

    class Config:
        orm_mode = True  # Allows conversion from ORM model


# ---/history endpoint---
# Input model
class HistoryQueryParams(BaseModel):
    patient_name: Optional[str] = None
    patient_gender: Optional[str] = None
    result: Optional[str] = None

# Response model structure
class HistoryViewResponseModel(BaseModel):
    id: int
    patient_name: str
    patient_age: int
    patient_gender: str
    result: str
    confidence: float
    created_at: str   
    image_path: str 
    doctor: Optional[str] = None

    class Config:
        orm_mode = True  # Allows conversion from ORM model

# Response model
class HistoryListResponse(BaseModel):
    history: list[HistoryViewResponseModel]

    class Config:
        orm_mode = True

