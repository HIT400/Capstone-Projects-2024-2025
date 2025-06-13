from pydantic import BaseModel
from typing import List, Optional

class ProcurementSubcategoryBase(BaseModel):
    name: str
    category_id: int

class ProcurementSubcategoryCreate(ProcurementSubcategoryBase):
    pass

class ProcurementSubcategoryResponse(ProcurementSubcategoryBase):
    id: int

    class Config:
        from_attributes = True

class ProcurementCategoryBase(BaseModel):
    name: str

class ProcurementCategoryCreate(ProcurementCategoryBase):
    pass

class ProcurementCategoryResponse(ProcurementCategoryBase):
    id: int
    name: str
    subcategories: List[ProcurementSubcategoryResponse] = []

    class Config:
        from_attributes = True
