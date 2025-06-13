from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload
from app.schemas.db_config import Bid, BidItem, Tender, Supplier, BidDocument, User, TenderStatus
from app.models.bid import BidCreateSchema, BidResponseSchema
from app.services.user import get_supplier_from_user, get_procurer_from_user
from app.utils.helpers import to_dict
from sqlalchemy import and_

from datetime import datetime
import uuid

def submit_bid_service(bid_data: BidCreateSchema, db: Session, user: User):
    """Handles the bidding logic"""
    
    supplier_object = get_supplier_from_user(db=db, user_id=user.id)
    supplier = to_dict(supplier_object[0])

    tender = db.query(Tender).filter(Tender.id == bid_data.tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    
    if tender.status != TenderStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Tender is not active")

    if datetime.now() > tender.closing_date:
        raise HTTPException(status_code=400, detail="Bidding is closed for this tender")

    bid_id = str(uuid.uuid4())
    bid = Bid(
        id=bid_id,
        tender_id=bid_data.tender_id,
        supplier_id=supplier["id"],
        bid_amount=bid_data.bid_amount
    )

    db.add(bid)

    for item in bid_data.bid_items:
        bid_item = BidItem(
            id=str(uuid.uuid4()),
            bid_id=bid_id,
            item_id=item.id,
            description=item.description,
            quantity=item.quantity,
            unit_name=item.unit_name,
            unit_price=item.unit_price,
            total_price=item.total_price,
        )
        db.add(bid_item)

    for doc in bid_data.documents:
        bid_doc = BidDocument(
            id=str(uuid.uuid4()),
            bid_id=bid_id,
            name=doc.name,
        )
        db.add(bid_doc)

    db.commit()
    db.refresh(bid)
    
    return bid


def get_bid(bid_id: int, db: Session, user: User):

    supplier_object = get_supplier_from_user(db=db, user_id=user.id)
    supplier = to_dict(supplier_object[0])
    
    return db.query(Bid).options(joinedload(Bid.bid_items), joinedload(Bid.documents)).filter(
        and_(
            Bid.id == bid_id,
            Bid.supplier_id == supplier["id"]
        )).first()

def get_bid_by_tender(tender_id: int, db: Session, user: User):

    supplier_object = get_supplier_from_user(db=db, user_id=user.id)
    supplier = to_dict(supplier_object[0])
    
    return db.query(Bid).options(joinedload(Bid.bid_items), joinedload(Bid.documents)).filter(
        and_(
            Bid.tender_id == tender_id,
            Bid.supplier_id == supplier["id"]
        )).first()

def get_all_bids_by_tender(tender_id: int, db: Session):
    
    return db.query(Bid).options(joinedload(Bid.bid_items), joinedload(Bid.documents)).filter(
        and_(
            Bid.tender_id == tender_id,
        )).all()

# Read all bids
def get_all_bids(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Bid).offset(skip).limit(limit).all()

# Update an existing bid
# def update_bid(bid_id: int, bid_data: BidUpdate, db: Session):
#     db_bid = db.query(Bid).filter(Bid.id == bid_id).first()
#     if db_bid:
#         for key, value in bid_data.dict().items():
#             setattr(db_bid, key, value)
#         db.commit()
#         db.refresh(db_bid)
#         return db_bid
#     return None


# Delete a bid
def delete_bid(bid_id: int, db: Session):
    db_bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if db_bid:
        db.delete(db_bid)
        db.commit()
        return db_bid
    return None