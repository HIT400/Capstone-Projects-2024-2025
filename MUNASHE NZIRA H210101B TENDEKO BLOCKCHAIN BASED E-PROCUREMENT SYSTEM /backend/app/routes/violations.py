from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from uuid import UUID, uuid4
from app.models.violations import ViolationCreate, ViolationResponse

from app.dependencies import get_db, get_current_user
from app.schemas.db_config import User, TenderViolation, Tender
from app.services.violations import create_violation_service

router = APIRouter()

@router.post("/", response_model=ViolationResponse, status_code=status.HTTP_201_CREATED)
async def create_violation(
    violation: ViolationCreate,
    db: Session = Depends(get_db)
):
    return create_violation_service(violation, db)

# Get all violations
# @router.get("/", response_model=List[ViolationResponse])
# async def get_violations(
#     status: str = None,
#     tender_id: str = None,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     query = db.query(TenderViolation)
    
#     # Apply filters if provided
#     if status:
#         query = query.filter(TenderViolation.status == status)
#     if tender_id:
#         query = query.filter(TenderViolation.tender_id == tender_id)
    
#     violations = query.order_by(TenderViolation.reported_at.desc()).all()
    
#     result = []
#     for v in violations:
#         user = db.query(User).filter(User.id == v.reported_by).first()
#         reporter_email = user.email if user else "unknown"
        
#         result.append(
#             ViolationResponse(
#                 id=v.id,
#                 tender=v.tender_id,
#                 title=v.title,
#                 description=v.description,
#                 status=v.status,
#                 date=v.date_detected,
#                 reported_by=reporter_email,
#                 reported_at=v.reported_at
#             )
#         )
    
#     return result

# # Get violation by ID
# @router.get("/{violation_id}", response_model=ViolationResponse)
# async def get_violation(
#     violation_id: str,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     violation = db.query(TenderViolation).filter(TenderViolation.id == violation_id).first()
    
#     if not violation:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail=f"Violation with ID {violation_id} not found"
#         )
    
#     user = db.query(User).filter(User.id == violation.reported_by).first()
#     reporter_email = user.email if user else "unknown"
    
#     return ViolationResponse(
#         id=violation.id,
#         tender=violation.tender_id,
#         title=violation.title,
#         description=violation.description,
#         status=violation.status,
#         date=violation.date_detected,
#         reported_by=reporter_email,
#         reported_at=violation.reported_at
#     )

@router.get("/")
def get_violations(db: Session = Depends(get_db)):
    violations = db.query(TenderViolation).all()
    return violations

@router.get("/{violation_id}")
def get_violation(violation_id: str, db: Session = Depends(get_db)):
    violation = db.query(TenderViolation).filter(TenderViolation.id == violation_id).first()
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    return violation


@router.delete("/{violation_id}")
def delete_violation(violation_id: str, db: Session = Depends(get_db)):
    violation = db.query(TenderViolation).filter(TenderViolation.id == violation_id).first()
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    db.delete(violation)
    db.commit()
    return {"message": "Violation deleted successfully"}