from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.db_config import PaymentStatus

class PaymentCreate(BaseModel):
    amount: float = Field(..., gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    contract_id: str = Field(..., min_length=1)
    tender_id: str = Field(..., min_length=1)
    description: Optional[str] = Field(default="Payment for services")

class PaymentResponse(BaseModel):
    id: str
    user_id: str
    amount: float
    currency: str
    contract_id: str
    description: Optional[str]
    payment_method: str
    status: PaymentStatus
    payer_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True