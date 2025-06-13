from sqlalchemy.orm import Session
from datetime import datetime
from uuid import uuid4
from fastapi import HTTPException, status
from app.schemas.db_config import TenderViolation, Tender
from app.models.violations import ViolationCreate, ViolationResponse

def create_violation_service(violation: ViolationCreate, db: Session) -> ViolationResponse:
    tender = db.query(Tender).filter(Tender.id == violation.tender).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tender with ID {violation.tender} not found"
        )

    valid_statuses = ["low", "medium", "high"]
    if violation.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status must be one of: {', '.join(valid_statuses)}"
        )

    new_violation = TenderViolation(
        id=str(uuid4()),
        tender_id=violation.tender,
        title=violation.title,
        description=violation.description,
        status=violation.status,
        date_detected=violation.date,
        reported_at=datetime.now()
    )

    db.add(new_violation)
    db.commit()
    db.refresh(new_violation)

    return ViolationResponse(
        id=new_violation.id,
        tender=new_violation.tender_id,
        title=new_violation.title,
        description=new_violation.description,
        status=new_violation.status,
        date=new_violation.date_detected,
        reported_at=new_violation.reported_at
    )