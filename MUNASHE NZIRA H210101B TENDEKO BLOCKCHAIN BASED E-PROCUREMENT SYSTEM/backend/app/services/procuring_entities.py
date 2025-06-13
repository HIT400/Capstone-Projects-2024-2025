from sqlalchemy.orm import Session
from app.schemas.db_config import ProcuringEntity, UserRole
from app.services.user import create_user
import uuid
from app.models.procuring_entities import ProcuringEntityCreate, ProcuringEntityUpdate

# Create
def create_procuring_entity(db: Session, procuring_entity: ProcuringEntityCreate):

    user, user_id = create_user(db=db, 
                                email=procuring_entity.email, 
                                password=procuring_entity.password, 
                                role= UserRole.PROCURING_ENTITY,  
                                address_street=procuring_entity.address_street, 
                                name=procuring_entity.name, 
                                address_region=procuring_entity.address_region , 
                                address_postal_code=procuring_entity.address_postal_code,
                                address_country=procuring_entity.address_country,
                            )

    db_procuring_entity = ProcuringEntity(
        id=str(uuid.uuid4()),
        user_id=user_id, 
        contact_name = procuring_entity.contact_name,
        contact_email = procuring_entity.contact_email, 
        contact_telephone = procuring_entity.contact_telephone
    )

    db.add(db_procuring_entity)
    db.commit()
    db.refresh(db_procuring_entity)
    return db_procuring_entity

# Read
def get_procuring_entity(db: Session, procuring_entity_id: int):
    return db.query(ProcuringEntity).filter(ProcuringEntity.id == procuring_entity_id).first()

# Update
def update_procuring_entity(db: Session, procuring_entity_id: int, procuring_entity: ProcuringEntityUpdate):
    db_procuring_entity = db.query(ProcuringEntity).filter(ProcuringEntity.id == procuring_entity_id).first()
    if db_procuring_entity:
        for key, value in procuring_entity.dict(exclude_unset=True).items():
            setattr(db_procuring_entity, key, value)
        db.commit()
        db.refresh(db_procuring_entity)
    return db_procuring_entity

# Delete
def delete_procuring_entity(db: Session, procuring_entity_id: int):
    db_procuring_entity = db.query(ProcuringEntity).filter(ProcuringEntity.id == procuring_entity_id).first()
    if db_procuring_entity:
        db.delete(db_procuring_entity)
        db.commit()
    return db_procuring_entity
