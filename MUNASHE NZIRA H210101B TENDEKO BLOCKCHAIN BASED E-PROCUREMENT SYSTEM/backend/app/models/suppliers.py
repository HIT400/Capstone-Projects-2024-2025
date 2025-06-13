from pydantic import BaseModel
from typing import List, Optional

class SupplierBase(BaseModel):
    name: Optional[str] = None
    identifier_scheme: Optional[str] = None
    identifier_id: Optional[str] = None
    legal_name: Optional[str] = None
    address_street: Optional[str] = None
    address_region: Optional[str] = None
    address_postal_code: Optional[str] = None
    address_country: Optional[str] = None
    scale: Optional[str] = None

class SupplierCreate(SupplierBase):
    email: str 
    password: str 

class SupplierUpdate(SupplierBase):
    pass

class Supplier(SupplierBase):
    id: str
    class Config:
        from_attributes = True
