from pydantic import BaseModel
from datetime import date, datetime

class ViolationCreate(BaseModel):
    tender: str  # Tender ID
    title: str
    description: str
    status: str  # 'low', 'medium', or 'high'
    date: date

class ViolationResponse(BaseModel):
    id: str
    tender: str
    title: str
    description: str
    status: str
    date: date
    reported_at: datetime
    
    class Config:
        from_attributes = True