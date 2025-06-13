from pydantic import BaseModel
from typing import List, Optional

class BidItemSchema(BaseModel):
    id: str
    description: str
    quantity: int   
    unit_price: float
    unit_name: str
    total_price: float

class BidDocumentSchema(BaseModel):
    name: str

class BidCreateSchema(BaseModel):
    tender_id: str
    bid_amount: float
    bid_items: List[BidItemSchema]
    documents: Optional[List[BidDocumentSchema]] = []

class BidResponseSchema(BaseModel):
    id: str
    tender_id: str
    supplier_id: str
    bid_amount: float
    created_at: str
