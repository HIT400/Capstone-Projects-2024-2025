from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# modules from the app package
from .. import schemas, models
from ..utils import Hash, create_access_token


# register a new doctor
async def register_doctor(doctor_data: schemas.DoctorRegistration, db: Session) -> dict:
    # Ensure doctor_data.password is not None
    if not doctor_data.password:
        raise ValueError("Password cannot be empty")

    # Check if doctor with the email already exists
    doctor = db.query(models.Doctor).filter(models.Doctor.email == doctor_data.email).first()
    if doctor:
        raise HTTPException(
            status_code=400,
            detail="Doctor with this email already registered"
        )
    
    hashed_password = Hash().bcrypt(password=doctor_data.password)
    db_doctor = models.Doctor(email=doctor_data.email, hashed_password=hashed_password)
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return {"success": True, "doctor_email": doctor_data.email}


# login a doctor
async def login(data: OAuth2PasswordRequestForm, db: Session) -> dict:
    doctor = db.query(models.Doctor).filter(models.Doctor.email == data.username).first()
    if not doctor:
        raise HTTPException(status_code=401, detail="doctor not found")
    if not Hash().verify(data.password, doctor.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    access_token = create_access_token(data={"sub": doctor.email})
    return {"access_token": access_token, "token_type": "bearer"}
