# app/schemas/tender.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.db_config import TenderStatus 
from typing import List

class Unit(BaseModel):
    name: str
    code: str

class Classification(BaseModel):
    description: str
    scheme: str
    id: str

class DeliveryDate(BaseModel):
    end_date: datetime

class DeliveryAddress(BaseModel):
    street_address: str
    region: str
    country_name: str

class Item(BaseModel):
    description: str
    unit: Unit
    quantity: float
    classification: Classification
    delivery_date: DeliveryDate
    delivery_address: DeliveryAddress

class TenderBase(BaseModel):
    title: str
    expected_value: Optional[float] = None  
    description: Optional[str] = None
    currency: str = "USD"
    procurement_method: Optional[str] = None
    delivery_date: Optional[datetime] = None
    classifier_code: Optional[str] = None
    tender_status: Optional[str] = None
    confidentiality: Optional[str] = None
    items: List[Item] = []  

class TenderCreate(BaseModel):
    title:  Optional[str] = None
    expected_value:  Optional[float] = None
    description:  Optional[str] = None
    currency: str = "USD"
    procurement_method:  Optional[str] = None
    procurement_category_id:  Optional[int] = None
    procurement_subcategory_id:  Optional[int] = None 
    procurement_method_type: Optional[str] = None
    value_added_tax_included: Optional[bool] = False
    tender_start_date: Optional[datetime] = None
    status: Optional[str] = "active"
    closing_date: Optional[datetime] = None
    delivery_date: Optional[datetime] = None
    tender_status: Optional[str] = None
    confidentiality: Optional[str] = None
    items: List[Item] = [] 


class TenderUpdate(TenderBase):
    # All fields are optional for update
    pass

class TenderOut(TenderBase):
    id: str
    date: datetime
    date_modified: datetime
    date_created: datetime

    class Config:
        from_attributes = True


class TenderFilter(BaseModel):
    title: Optional[str] = None
    procurement_method: Optional[str] = None
    procurement_method_type: Optional[str] = None
    status: Optional[str] = None
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    value_currency: Optional[str] = None

