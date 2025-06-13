from sqlalchemy.orm import Session
from app.schemas.db_config import ProcurementCategory, ProcurementSubcategory, Supplier, SupplierCategory
from app.models.categories import ProcurementCategoryCreate, ProcurementSubcategoryCreate

# Create Category
def create_category(db: Session, category: ProcurementCategoryCreate):
    db_category = ProcurementCategory(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# Get All Categories
def get_categories(db: Session):
    return db.query(ProcurementCategory).all()

# Get Category by ID
def get_category(db: Session, category_id: int):
    return db.query(ProcurementCategory).filter(ProcurementCategory.id == category_id).first()

# Delete Category
def delete_category(db: Session, category_id: int):
    category = db.query(ProcurementCategory).filter(ProcurementCategory.id == category_id).first()
    if category:
        db.delete(category)
        db.commit()
        return True
    return False

# Create Subcategory
def create_subcategory(db: Session, subcategory: ProcurementSubcategoryCreate):
    db_subcategory = ProcurementSubcategory(name=subcategory.name, category_id=subcategory.category_id)
    db.add(db_subcategory)
    db.commit()
    db.refresh(db_subcategory)
    return db_subcategory

# Get Subcategories by Category
def get_subcategories_by_category(db: Session, category_id: int):
    return db.query(ProcurementSubcategory).filter(ProcurementSubcategory.category_id == category_id).all()

# Delete Subcategory
def delete_subcategory(db: Session, subcategory_id: int):
    subcategory = db.query(ProcurementSubcategory).filter(ProcurementSubcategory.id == subcategory_id).first()
    if subcategory:
        db.delete(subcategory)
        db.commit()
        return True
    return False

def add_supplier_to_category(db: Session, supplier_id: str, category_id: int):
    """
    Adds a supplier to a procurement category.

    :param session: SQLAlchemy session instance
    :param supplier_id: ID of the supplier
    :param category_id: ID of the procurement category
    """
    supplier = db.query(Supplier).filter_by(id=supplier_id).first()
    category = db.query(ProcurementCategory).filter_by(id=category_id).first()

    if not supplier:
        raise ValueError(f"Supplier with ID {supplier_id} not found")
    if not category:
        raise ValueError(f"Category with ID {category_id} not found")

    # Check if the relationship already exists
    existing_entry = db.query(SupplierCategory).filter_by(supplier_id=supplier_id, category_id=category_id).first()
    if existing_entry:
        print(f"Supplier {supplier_id} is already in category {category_id}")
        return

    # Create and add the relationship
    supplier_category = SupplierCategory(supplier=supplier, category=category)
    db.add(supplier_category)
    db.commit()
    print(f"Supplier {supplier_id} successfully added to category {category_id}")