from fastapi import UploadFile, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from io import BytesIO
from PIL import Image
import os
import numpy as np
from datetime import datetime, timezone
from typing import Optional

# modules from the app package
from .. import models, schemas
from ..database import get_db
from ..utils import oauth2_scheme, SECRET_KEY, ALGORITHM, model, UPLOAD_FOLDER


# ---Service Functions--- #
# image preprocessing
def preprocess_image(image: Image.Image, target_size=(128, 128)) -> np.ndarray:
    image = image.convert("RGB").resize(target_size)
    image_array = np.array(image) / 255.0
    return np.expand_dims(image_array, axis=0)

# uploads data to the database.
def create_upload(db: Session, doctor_id: int, patient_name: str, patient_age: int, patient_gender: str, image_path: str, result: str, confidence: float):
    db_upload = models.Upload(doctor_id=doctor_id, patient_name=patient_name, patient_age=patient_age, patient_gender=patient_gender, image_path=image_path, result=result, confidence=confidence)
    db.add(db_upload)
    db.commit()
    db.refresh(db_upload)
    return db_upload

# retrieves an Upload instance from the database based on the upload_id.
def get_upload_history(db: Session, patient_name: Optional[str] = None, patient_gender: Optional[str] = None, result: Optional[str] = None) -> list:
    query = db.query(models.Upload)
    if patient_name:
        query = query.filter(models.Upload.patient_name.like(f"%{patient_name}%"))
    if result:
        query = query.filter(models.Upload.result == result)
    if patient_gender:
        query = query.filter(models.Upload.patient_gender.like(f"%{patient_gender}%"))
    return query.all()


# ---Path Handler Functions--- #
# Prediction Function
async def predict(patient_name: str, patient_age: int, patient_gender: str, file: UploadFile, token: str, db: Session) -> dict:
    # Decode the token to get the doctor's email
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        doctor_email = payload.get("sub")
        if doctor_email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Get doctor info
    doctor = db.query(models.Doctor).filter(models.Doctor.email == doctor_email).first()
    if not doctor:
        raise HTTPException(status_code=401, detail="Doctor not found")

    # Validate image and preprocess
    try:
        image_data = await file.read()
        image = Image.open(BytesIO(image_data))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file format")
    preprocessed_image = preprocess_image(image)

    # Perform prediction
    try:
        prediction = model.predict(preprocessed_image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

    # Results
    result = "Cancer" if prediction[0][0] > 0.5 else "Non-Cancer"
    confidence = float(prediction[0][0]) if result == "Cancer" else 1 - float(prediction[0][0])

    # Save image file
    image_filename = f"{datetime.now(timezone.utc).isoformat()}_{file.filename}"
    image_path = os.path.join(UPLOAD_FOLDER, image_filename)
    with open(image_path, "wb") as buffer:
        buffer.write(image_data)

    # Save prediction to database
    upload = create_upload(db=db, doctor_id=doctor.id, patient_name=patient_name, patient_age=patient_age, patient_gender=patient_gender, image_path=image_path, result=result, confidence=confidence)

    return {
        'id': upload.id,
        "result": result,
        "confidence": confidence,
        "patient": {
            "name": patient_name,
            "age": patient_age,
            "gender": patient_gender,
        },
    }


# View History Function
async def get_history(
    query: schemas.HistoryQueryParams = Depends(),
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> dict:
    # Decode and validate the token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        doctor_email = payload.get("sub")
        if doctor_email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Fetch all history, without filtering by doctor
    history = get_upload_history(
        db, patient_name=query.patient_name, patient_gender=query.patient_gender, result=query.result
    )

    # Manually convert the SQLAlchemy object to Pydantic models
    history_items = [
        schemas.HistoryViewResponseModel(
            id=item.id,
            patient_name=item.patient_name,
            patient_age=item.patient_age,
            patient_gender=item.patient_gender,
            result=item.result,
            confidence=item.confidence,
            created_at=item.upload_timestamp.isoformat(),
            image_path=item.image_path,
            doctor=item.doctor.last_name if item.doctor else None,
        )
        for item in history
    ]

    # Return an empty list if no records are found
    return {"history": history_items} if history_items else {"history": []}
