from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime

from app.dependencies import get_db , authorize_role, get_current_user
from app.schemas.db_config import UserRole, User 
from app.models.tender import TenderCreate, TenderUpdate, TenderFilter
from app.services.tender import create_tender, get_tender, get_tenders, update_tender, delete_tender
from app.services.bidevaluation import BidEvaluationService


router = APIRouter()

@router.post("/")
def create_new_tender(   
    tender_in: str = Form(...),
    documents: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    user=Depends(authorize_role(UserRole.PROCURING_ENTITY))
):
    tender_in = TenderCreate.parse_raw(tender_in) 
    tender_id = create_tender(db, tender_in, user, documents)

    return JSONResponse(
        status_code=201,
        content={
            "tender_id": tender_id,
            "success": True
        }
    )

@router.get("/{tender_id}")
def read_tender(tender_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tender, verified, for_requesting_entity = get_tender(db, tender_id, user.id)
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    
    return JSONResponse(
        status_code=200,
        content={
            "tender": tender,
            "verified": verified,
            "for_requesting_entity": for_requesting_entity,
            "success": True
        }
    )

@router.get("/")
def read_tenders(
    db: Session = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    title: Optional[str] = None,
    procurement_method: Optional[str] = None,
    procurement_method_type: Optional[str] = None,
    status: Optional[str] = None,
    category_id: Optional[int] = None,
    subcategory_id: Optional[int] = None,
    min_value: Optional[float] = None,
    max_value: Optional[float] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    value_currency: Optional[str] = None,
):
    """
    Retrieve a list of tenders with pagination and filtering options.
    
    Parameters:
    - skip: Number of records to skip (offset)
    - limit: Maximum number of records to return
    - title: Filter by tender title (partial match)
    - procurement_method: Filter by procurement method
    - procurement_method_type: Filter by procurement method type
    - status: Filter by tender status
    - category_id: Filter by category ID
    - subcategory_id: Filter by subcategory ID
    - min_value: Filter by minimum value amount
    - max_value: Filter by maximum value amount
    - date_from: Filter by start date
    - date_to: Filter by end date
    - value_currency: Filter by currency
    """
    return get_tenders(
        db,
        skip=skip,
        limit=limit,
        filters=TenderFilter(
            title=title,
            procurement_method=procurement_method,
            procurement_method_type=procurement_method_type,
            status=status,
            category_id=category_id,
            subcategory_id=subcategory_id,
            min_value=min_value,
            max_value=max_value,
            date_from=date_from,
            date_to=date_to,
            value_currency=value_currency,
        )
    )


@router.put("/{tender_id}")
def update_existing_tender(tender_id: str, tender_in: TenderUpdate, db: Session = Depends(get_db)):
    tender = update_tender(db, tender_id, tender_in)
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    return tender

@router.delete("/{tender_id}")
def delete_existing_tender(tender_id: str, db: Session = Depends(get_db)):
    tender = delete_tender(db, tender_id)
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    return tender

@router.get("/evaluate/bids/{tender_id}")
def evaluate_bid(    
    tender_id: str,
    db: Session = Depends(get_db)
):
    
    evaluator = BidEvaluationService(db)

    return evaluator.evaluate_bids_for_tender(tender_id=tender_id)