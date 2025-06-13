from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Dict
from app.services.contracts import  get_contracts, get_contract_by_id, get_contract_by_tender_id
from app.dependencies import get_db , authorize_role

router = APIRouter()


@router.get("/")
async def get_contractss():
    return get_contracts()

@router.get("/{contract_id}")
async def get_contract(contract_id: str, db: Session = Depends(get_db)):
    return get_contract_by_id(db, contract_id)

@router.get("/tender/{tender_id}")
async def get_tender_contract(tender_id: str, db: Session = Depends(get_db)):
    return get_contract_by_tender_id(db, tender_id)