from fastapi import APIRouter, Depends, Form, File, UploadFile, status
from sqlalchemy.orm import Session

# modules from the app package
from .. import schemas
from ..services import upload_service
from ..database import get_db
from ..utils import oauth2_scheme


# Initialize APIRouter
router = APIRouter(tags=["Model"])

# Route to classify an image
@router.post("/predict", response_model=schemas.PredictResponse, status_code=status.HTTP_201_CREATED)
async def predict(
    patient_name: str = Form(...), patient_age: int = Form(...), 
    patient_gender: str = Form(...), file: UploadFile = File(...), 
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
    ) -> dict:
        return await upload_service.predict(patient_name, patient_age, patient_gender, file, token, db)

# Route to retrieve patient history
@router.post("/history", response_model=schemas.HistoryListResponse, status_code=status.HTTP_200_OK)
async def get_history(
    query: schemas.HistoryQueryParams = Depends(),  
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
    ) -> dict:
        return await upload_service.get_history(query, token, db)