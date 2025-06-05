from sqlalchemy.orm import class_mapper
import hashlib
import json
from app.schemas.db_config import Tender
from datetime import datetime
from enum import Enum

def to_dict(obj):
    result = {c.key: getattr(obj, c.key) for c in class_mapper(obj.__class__).columns}
    for key, value in result.items():
        if isinstance(value, Enum):
            result[key] = value.value
        elif isinstance(value, datetime):
            result[key] = value.isoformat() 
    return result

def generate_tender_hash(tender: Tender) -> str:
    """
    Generate a SHA256 hash of key tender fields to ensure integrity.
    """
    tender_data = {
        "id": tender.id,
        "title": tender.title,
        "description": tender.description,
        "value_amount": float(tender.value_amount) if tender.value_amount else 0,
        "value_currency": tender.value_currency,
        "closing_date": tender.closing_date.isoformat() if tender.closing_date else None,
        "procuring_entity_id": tender.procuring_entity_id
    }
    tender_json = json.dumps(tender_data, sort_keys=True)
    return hashlib.sha256(tender_json.encode('utf-8')).hexdigest()


def verify_tender_integrity(tender: Tender, expected_hash: str) -> bool:
    """
    Verify tender data integrity by comparing generated hash with expected hash.
    """
    calculated_hash = generate_tender_hash(tender)
    return calculated_hash == expected_hash

    """
    Generate a SHA256 hash of key tender fields to ensure integrity.
    """
    tender_data = {
        "id": tender["tenderID"],
        "title": tender["title"],
        "description": tender["description"],
        "value_amount": float(tender["valueAmount"]) if tender["valueAmount"] else 0,
        "value_currency": tender["valueCurrency"],
        "closing_date": tender["closingDate"].isoformat() if tender["closingDate"] else None,
        "procuring_entity_id": tender["procuringEntity"]
    }
    tender_json = json.dumps(tender_data, sort_keys=True)
    return hashlib.sha256(tender_json.encode('utf-8')).hexdigest()