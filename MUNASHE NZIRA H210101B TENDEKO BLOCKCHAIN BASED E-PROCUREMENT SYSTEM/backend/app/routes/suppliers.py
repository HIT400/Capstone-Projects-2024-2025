from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.suppliers import create_supplier, get_supplier, delete_supplier, update_supplier, get_allowed_categories_service
from app.models.suppliers import SupplierCreate, SupplierUpdate, Supplier
from app.dependencies import get_db, authorize_role
from app.schemas.db_config import UserRole 

router = APIRouter()

@router.post("/")
def create_supplier_endpoint(supplier: SupplierCreate, db: Session = Depends(get_db)):
    return create_supplier(db=db, supplier=supplier)

@router.get("/{supplier_id}")
def get_supplier_endpoint(supplier_id: str, db: Session = Depends(get_db)):
    db_supplier = get_supplier(db=db, supplier_id=supplier_id)
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return db_supplier

@router.get("/categories/allowed")
def get_allowed_categories(db: Session = Depends(get_db), user=Depends(authorize_role(UserRole.SUPPLIER)) ):
    """
    API endpoint to get allowed procurement categories for a supplier.
    
    :param db: Database session
    :param user: Current user retrieved from access token
    :return: List of allowed procurement categories
    """
    db_categories = get_allowed_categories_service(db=db , user=user)
    if db_categories is None:
        raise HTTPException(status_code=404, detail="Categories not found for supplier")
    return db_categories


@router.put("/{supplier_id}")
def update_supplier_endpoint(supplier_id: str, supplier: SupplierUpdate, db: Session = Depends(get_db)):
    db_supplier = update_supplier(db=db, supplier_id=supplier_id, supplier=supplier)
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return db_supplier

@router.delete("/{supplier_id}")
def delete_supplier_endpoint(supplier_id: str, db: Session = Depends(get_db)):
    db_supplier = delete_supplier(db=db, supplier_id=supplier_id)
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return db_supplier
