from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from app.schemas.db_config import ProcurementMethod, TenderStatus, DocumentType, Confidentiality, AwardStatus, ContractStatus, UserRole
class EnumOption(BaseModel):
    value: str
    label: str

router = APIRouter()

@router.get("/document-type", response_model=List[EnumOption])
async def get_document_type():
    return [{"value": document_type.value, "label": document_type.value.replace("_", " ").title()} for document_type in DocumentType]

# Endpoint to get Tender Status options
@router.get("/tender-status", response_model=List[EnumOption])
async def get_tender_status():
    return [{"value": status.value, "label": status.value.replace("_", " ").title()} for status in TenderStatus]

# Endpoint to get Lot Type options
@router.get("/confidentiality", response_model=List[EnumOption])
async def get_confidentiality():
    return [{"value": confidentiality.value, "label": confidentiality.value.replace("_", " ").title()} for confidentiality in Confidentiality]

# Endpoint to get Procurement Method options
@router.get("/procurement-method", response_model=List[EnumOption])
async def get_procurement_method():
    return [{"value": method.value, "label": method.value.replace("_", " ").title()} for method in ProcurementMethod]

# Endpoint to get Class of Procurement options
@router.get("/award_status", response_model=List[EnumOption])
async def get_award_status():
    return [{"value": award_status.value, "label": award_status.value.replace("_", " ").title()} for award_status in AwardStatus]

# Endpoint to get Funding Source options
@router.get("/contract_status", response_model=List[EnumOption])
async def get_contract_status():
    return [{"value": contract_status.value, "label": contract_status.value.replace("_", " ").title()} for contract_status in ContractStatus]

# Endpoint to get Role options
@router.get("/user-role", response_model=List[EnumOption])
async def get_user_role():
    return [{"value": role.value, "label": role.value.replace("_", " ").title()} for role in UserRole]
