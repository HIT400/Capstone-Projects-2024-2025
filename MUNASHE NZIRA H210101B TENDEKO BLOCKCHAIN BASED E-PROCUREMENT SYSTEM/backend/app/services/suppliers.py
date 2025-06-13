from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.suppliers import SupplierCreate, SupplierUpdate
from app.services.user import create_user
from app.services.user import get_supplier_from_user 
from app.schemas.db_config import  UserRole, Supplier, SupplierCategory, ProcurementCategory, User, BankAccount
from app.utils.helpers import to_dict
import uuid


def create_supplier(db: Session, supplier: SupplierCreate):

    user, user_id = create_user(
        db=db, 
        email=supplier.email, 
        password=supplier.password , 
        role= UserRole.SUPPLIER,  
        address_street=supplier.address_street, 
        name=supplier.name, 
        address_region=supplier.address_region,
        address_postal_code=supplier.address_postal_code,
        address_country=supplier.address_country,
        )

    db_supplier = Supplier(
        id=str(uuid.uuid4()),
        user_id=user_id,  
        identifier_scheme=supplier.identifier_scheme,
        identifier_id=supplier.identifier_id,
        legal_name=supplier.legal_name,
        scale=supplier.scale
    )

    # db_supplier.bank_accounts = [
    #     BankAccount(
    #         owner_id=supplier.id,
    #         owner_type="supplier",
    #         bank_name="Bank A",
    #         account_number="ACC123",
    #         swift_code="SWIFT123",
    #         account_holder_name="Acme Corp"
    #     ),
    #     BankAccount(
    #         owner_id=supplier.id,
    #         owner_type="supplier",
    #         bank_name="Bank B",
    #         account_number="ACC456",
    #         swift_code="SWIFT456",
    #         account_holder_name="Acme Corp"
    #     )
    # ]

    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)

    return db_supplier 

def get_supplier(db: Session, supplier_id: str):
    return db.query(Supplier).filter(Supplier.id == supplier_id).first()

def get_allowed_categories_service(db: Session, user: User):
    """
    Fetch allowed procurement categories for a given supplier.

    :param supplier_id: ID of the supplier
    :param db: Database session
    :return: List of ProcurementCategory objects
    """

    supplier_object = get_supplier_from_user(db, user.id)
    supplier = to_dict(supplier_object[0])
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    categories = (
        db.query(ProcurementCategory)
        .join(SupplierCategory, SupplierCategory.category_id == ProcurementCategory.id)
        .filter(SupplierCategory.supplier_id == supplier["id"])
        .all()
    )

    return categories

def update_supplier(db: Session, supplier_id: str, supplier: SupplierUpdate):
    db_supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if db_supplier:
        for key, value in supplier.dict(exclude_unset=True).items():
            setattr(db_supplier, key, value)
        db.commit()
        db.refresh(db_supplier)
    return db_supplier

def delete_supplier(db: Session, supplier_id: str):
    db_supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if db_supplier:
        db.delete(db_supplier)
        db.commit()
    return db_supplier
