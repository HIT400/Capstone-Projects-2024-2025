from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models.procuring_entities import ProcuringEntityCreate, ProcuringEntityUpdate
from app.services.procuring_entities import get_procuring_entity, create_procuring_entity, delete_procuring_entity, update_procuring_entity

router = APIRouter()

@router.post("/")
def create_procuring_entity_endpoint(procuring_entity: ProcuringEntityCreate, db: Session = Depends(get_db)):
    return create_procuring_entity(db=db, procuring_entity=procuring_entity)

@router.get("/{procuring_entity_id}")
def get_procuring_entity_endpoint(procuring_entity_id: int, db: Session = Depends(get_db)):
    db_procuring_entity = get_procuring_entity(db=db, procuring_entity_id=procuring_entity_id)
    if db_procuring_entity is None:
        raise HTTPException(status_code=404, detail="Procuring Entity not found")
    return db_procuring_entity

@router.put("/{procuring_entity_id}")
def update_procuring_entity_endpoint(procuring_entity_id: int, procuring_entity: ProcuringEntityUpdate, db: Session = Depends(get_db)):
    db_procuring_entity = update_procuring_entity(db=db, procuring_entity_id=procuring_entity_id, procuring_entity=procuring_entity)
    if db_procuring_entity is None:
        raise HTTPException(status_code=404, detail="Procuring Entity not found")
    return db_procuring_entity

@router.delete("/{procuring_entity_id}")
def delete_procuring_entity_endpoint(procuring_entity_id: int, db: Session = Depends(get_db)):
    db_procuring_entity = delete_procuring_entity(db=db, procuring_entity_id=procuring_entity_id)
    if db_procuring_entity is None:
        raise HTTPException(status_code=404, detail="Procuring Entity not found")
    return db_procuring_entity
