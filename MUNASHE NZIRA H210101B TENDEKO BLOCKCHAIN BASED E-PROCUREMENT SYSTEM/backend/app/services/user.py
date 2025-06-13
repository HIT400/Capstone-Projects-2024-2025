from sqlalchemy.orm import Session, joinedload
from app.schemas.db_config import User, UserRole
from app.security import hash_password 
import uuid

def create_user(db: Session, email: str, password: str, role: UserRole , address_street: str, name: str, address_region: str, address_postal_code: str, address_country: str):

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise ValueError(f"Email {email} is already taken.")
    
    hashed_pw = hash_password(password)
    user_id = str(uuid.uuid4())
    new_user = User (
        id=user_id,
        email=email, 
        password=hashed_pw, 
        role=role.value , 
        address_region=address_region, 
        address_street=address_street,
        address_postal_code=address_postal_code,
        address_country=address_country, 
        name=name
     )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user, user_id

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id).first()

def get_procurer_from_user(db: Session, user_id: int):
    """
    Retrieve the procuring entity associated with a given user.
    """
    user = db.query(User).options(joinedload(User.procuring_entity)).filter(User.id == user_id).first()

    if not user:
        return None 
    
    print("User:", user)
    print("Procuring Entity:", user.procuring_entity)
    return user.procuring_entity

def get_supplier_from_user(db: Session, user_id: int):
    """
    Retrieve the supplier associated with a given user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None 
    return user.supplier