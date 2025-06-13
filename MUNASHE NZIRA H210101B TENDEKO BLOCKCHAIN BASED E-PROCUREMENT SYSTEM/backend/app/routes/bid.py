from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db, authorize_role
from app.schemas.db_config import UserRole 
from app.models.bid import BidCreateSchema
from app.services.bid import submit_bid_service, get_bid, delete_bid, get_all_bids, get_bid_by_tender, get_all_bids_by_tender
from app.dependencies import get_db , authorize_role
from app.schemas.db_config import UserRole 

router = APIRouter()

@router.post("/")
def submit_bid(bid_data: BidCreateSchema, db: Session = Depends(get_db), user =Depends(authorize_role(UserRole.SUPPLIER))):
    return submit_bid_service(
        bid_data=bid_data, 
        db=db,
        user=user    
    )

@router.get("/{bid_id}")    
async def get_bid_route(bid_id: str, db: Session = Depends(get_db), user=Depends(authorize_role(UserRole.SUPPLIER)) ):
    db_bid = get_bid(
        bid_id=bid_id, 
        db=db, 
        user=user)
    if db_bid is None:
        raise HTTPException(status_code=404, detail="Bid not found")
    return db_bid

@router.get("/tender/{tender_id}")    
async def get_bid_for_tender_by_supplier(tender_id: str, db: Session = Depends(get_db), user=Depends(authorize_role(UserRole.SUPPLIER)) ):
    db_bid = get_bid_by_tender(
        tender_id=tender_id, 
        db=db, 
        user=user)
    if db_bid is None:
        raise HTTPException(status_code=404, detail="Bid not found")
    return db_bid

@router.get("/tender/all/{tender_id}")    
async def get_all_bids_for_tender(tender_id: str, db: Session = Depends(get_db), user=Depends(authorize_role(UserRole.PROCURING_ENTITY)) ):
    db_bid = get_all_bids_by_tender(
        tender_id=tender_id, 
        db=db)
    if db_bid is None:
        raise HTTPException(status_code=404, detail="Bid not found")
    return db_bid


@router.get("/")
async def get_all_bids_route(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_all_bids(db, skip, limit)


# Route to update a bid
# @router.put("/{bid_id}")
# async def update_bid_route(bid_id: int, bid_data: BidUpdate, db: Session = Depends(get_db)):
#     db_bid = update_bid(bid_id, bid_data, db)
#     if db_bid is None:
#         raise HTTPException(status_code=404, detail="Bid not found")
#     return db_bid

@router.delete("/{bid_id}")
async def delete_bid_route(bid_id: int, db: Session = Depends(get_db)):
    db_bid = delete_bid(bid_id, db)
    if db_bid is None:
        raise HTTPException(status_code=404, detail="Bid not found")
    return db_bid