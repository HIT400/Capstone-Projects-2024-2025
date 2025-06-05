from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models.categories import ProcurementCategoryCreate, ProcurementCategoryResponse, ProcurementSubcategoryCreate, ProcurementSubcategoryResponse
from app.services.categories import create_category, get_categories, delete_category, create_subcategory, get_subcategories_by_category, delete_subcategory, add_supplier_to_category

router = APIRouter()

@router.post("/", response_model=ProcurementCategoryResponse)
def create_procurement_category(category: ProcurementCategoryCreate, db: Session = Depends(get_db)):
    return create_category(db, category)


@router.get("/", response_model=list[ProcurementCategoryResponse])
def get_procurement_categories(db: Session = Depends(get_db)):
    return get_categories(db)

@router.delete("/{category_id}/")
def remove_category(category_id: int, db: Session = Depends(get_db)):
    if not delete_category(db, category_id):
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}

@router.post("/subcategories/", response_model=ProcurementSubcategoryResponse)
def create_procurement_subcategory(subcategory: ProcurementSubcategoryCreate, db: Session = Depends(get_db)):
    return create_subcategory(db, subcategory)

@router.get("/{category_id}/subcategories/", response_model=list[ProcurementSubcategoryResponse])
def get_category_subcategories(category_id: int, db: Session = Depends(get_db)):
    return get_subcategories_by_category(db, category_id)

@router.delete("/subcategories/{subcategory_id}/")
def remove_subcategory(subcategory_id: int, db: Session = Depends(get_db)):
    if not delete_subcategory(db, subcategory_id):
        raise HTTPException(status_code=404, detail="Subcategory not found")
    return {"message": "Subcategory deleted successfully"}

@router.post("/{category_id}/{supplier_id}/")
def supplier_to_category(supplier_id: str, category_id: int, db: Session = Depends(get_db)):
    response = add_supplier_to_category(
        db=db,
        supplier_id=supplier_id,
        category_id=category_id
    )
    if not response:
        raise HTTPException( status_code=401 ,detail="Could not add category to suppliers allowed list")

    return {"message": "Category successfully added to suppliers allowed list"}