from pydantic import BaseModel
from typing import Optional

class ProcuringEntityBase(BaseModel):
    name: str
    address_street: str
    address_region: str
    address_postal_code: str
    address_country: str
    contact_name: str
    contact_email: str
    contact_telephone: str

class ProcuringEntityCreate(ProcuringEntityBase):
    email: str 
    password: str 
    
class ProcuringEntityUpdate(ProcuringEntityBase):
    name: Optional[str] = None
    address_street: Optional[str] = None
    address_region: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_telephone: Optional[str] = None

class ProcuringEntity(ProcuringEntityBase):
    id: int

    class Config:
        from_attributes = True
