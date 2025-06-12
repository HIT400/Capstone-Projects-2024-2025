from fastapi import UploadFile
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi.encoders import jsonable_encoder
import datetime
import uuid

from app.models.tender import TenderCreate, TenderUpdate , TenderFilter
from app.schemas.db_config import Tender, Item, ProcuringEntity, User, Document, Award, Supplier, Contract, TenderViolation
from app.services.user import get_procurer_from_user 
from app.utils.helpers import generate_tender_hash, verify_tender_integrity, to_dict
from app.services.s3_service import handle_files 
from app.web3 import TendekoBlockchainService
from app.services.violations import create_violation_service
from app.models.violations import ViolationCreate

def create_tender(db: Session, tender_in: TenderCreate, user: User, documents: List[UploadFile]) -> Tender:
    """
    Create a new tender record in the database.
    """

    # uploaded_files = handle_files(db, documents)

    uploaded_files=[]

    procurer_object = get_procurer_from_user(db, user.id)
    procurer = to_dict(procurer_object[0])

    tender_id = str(uuid.uuid4())

    new_tender = Tender(
        id=tender_id,
        title=tender_in.title,
        description=tender_in.description,
        procurement_method=tender_in.procurement_method,
        procurement_method_type=tender_in.procurement_method_type,
        value_amount=tender_in.expected_value,
        value_currency=tender_in.currency,
        value_added_tax_included=tender_in.value_added_tax_included,
        status=tender_in.status,
        closing_date=tender_in.closing_date,
        category_id=tender_in.procurement_category_id,
        subcategory_id=tender_in.procurement_subcategory_id,
        procuring_entity_id=procurer["id"],
    )
    
    db.add(new_tender)
    db.flush()

    for item in tender_in.items:
        new_item = Item(
            id=str(uuid.uuid4()),
            description=item.description,
            unit_name=item.unit.name,
            unit_code=item.unit.code,
            quantity=item.quantity,
            classification_description=item.classification.description,
            classification_scheme=item.classification.scheme,
            classification_id=item.classification.id,
            delivery_address_street=item.delivery_address.street_address,
            delivery_address_region=item.delivery_address.region,
            delivery_address_country=item.delivery_address.country_name,
            delivery_date_end=item.delivery_date.end_date,
            tender_id=tender_id
        )
        db.add(new_item)

    for document in uploaded_files:
        new_document = Document(
            title=document.original_name,
            url=document.url,
            hash=document.hash,
            document_type=document.document_type,
            tender_id=tender_id

        )
        db.add(new_document)

    db.commit()
    db.refresh(new_tender)

    service = TendekoBlockchainService()

    receipt = service.create_tender(
        tender_id=tender_id,
        title=new_tender.title,
        closing_date_days=30,  # TODO: fIX THIS
        value_amount=new_tender.value_amount,
        value_currency=new_tender.value_currency,
        hash_of_details=generate_tender_hash(new_tender)
    )

    return tender_id


def get_tender(db: Session, tender_id: str, user_id: str) -> Optional[Tender]:
    """
    Retrieve a tender by its primary key (id), along with its related entities.
    """

    user_fields = [
        User.email,
        User.name,
        User.address_postal_code,
        User.role,
        User.is_active,
        User.id,
        User.address_street,
        User.address_region,
        User.address_country
    ]

    tender = db.query(Tender).options(
        joinedload(Tender.category),
        joinedload(Tender.subcategory),
        joinedload(Tender.documents),
        joinedload(Tender.procuring_entity).joinedload(ProcuringEntity.user).load_only(*user_fields),
        joinedload(Tender.awards).joinedload(Award.supplier).joinedload(Supplier.user).load_only(*user_fields),
        joinedload(Tender.contracts).joinedload(Contract.payments),
        joinedload(Tender.bids),
        joinedload(Tender.items)
    ).filter(Tender.id == tender_id).first()

    if not tender:
        return None
    
    try: 
        service = TendekoBlockchainService()
        onchain_tender = service.get_tender_details(tender.id)
        integrity_verified = verify_tender_integrity(tender, onchain_tender['hashOfDetails'])
    except:
        integrity_verified = False

    
    if not integrity_verified:

        violation = db.query(TenderViolation).filter(TenderViolation.tender_id == tender.id, TenderViolation.title == "Potential Temper").first()

        if not violation:

            create_violation_service(
            ViolationCreate(
                tender=tender.id,
                title="Potential Temper",
                description="The tender failed the block validation process and needs resolution",
                status="high",
                date=datetime.datetime.now().date() 
            ),
                db
            )

    try:
        for_requesting_entity = tender.procuring_entity.user.id == user_id
    except:
        for_requesting_entity = False

    return jsonable_encoder(tender), integrity_verified , for_requesting_entity


# def get_tenders(db: Session, skip: int = 0, limit: int = 100, filters: TenderFilter = None) -> List[Tender]:
#     """
#     Retrieve a list of tenders with pagination and filtering.
#     """
#     query = db.query(Tender)
    
#     if filters:
#         if filters.title:
#             query = query.filter(Tender.title.ilike(f"%{filters.title}%"))
        
#         if filters.procurement_method:
#             query = query.filter(Tender.procurement_method == filters.procurement_method)
            
#         if filters.procurement_method_type:
#             query = query.filter(Tender.procurement_method_type == filters.procurement_method_type)
            
#         if filters.status:
#             query = query.filter(Tender.status == filters.status)
            
#         if filters.category_id:
#             query = query.filter(Tender.category_id == filters.category_id)
            
#         if filters.subcategory_id:
#             query = query.filter(Tender.subcategory_id == filters.subcategory_id)
            
#         if filters.min_value is not None:
#             query = query.filter(Tender.value_amount >= filters.min_value)
            
#         if filters.max_value is not None:
#             query = query.filter(Tender.value_amount <= filters.max_value)
            
#         if filters.date_from:
#             query = query.filter(Tender.date >= filters.date_from)
            
#         if filters.date_to:
#             query = query.filter(Tender.date <= filters.date_to)
            
#         if filters.value_currency:
#             query = query.filter(Tender.value_currency == filters.value_currency)
    
#     return query.offset(skip).limit(limit).all()


def get_tenders(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    filters: Optional[TenderFilter] = None
) -> List[Tender]:
    """
    Retrieve a list of tenders with pagination, filtering, and eager loading of related data.
    """

    user_fields = [
        User.email,
        User.name,
        User.address_postal_code,
        User.role,
        User.is_active,
        User.id,
        User.address_street,
        User.address_region,
        User.address_country
    ]

    query = db.query(Tender).options(
        joinedload(Tender.category),
        joinedload(Tender.subcategory),
        joinedload(Tender.documents),
        joinedload(Tender.procuring_entity)
            .joinedload(ProcuringEntity.user)
            .load_only(*user_fields),
        joinedload(Tender.awards)
            .joinedload(Award.supplier)
            .joinedload(Supplier.user)
            .load_only(*user_fields),
        joinedload(Tender.contracts)
            .joinedload(Contract.payments),
        joinedload(Tender.bids),
        joinedload(Tender.items)
    )

    if filters:
        if filters.title:
            query = query.filter(Tender.title.ilike(f"%{filters.title}%"))

        if filters.procurement_method:
            query = query.filter(Tender.procurement_method == filters.procurement_method)

        if filters.procurement_method_type:
            query = query.filter(Tender.procurement_method_type == filters.procurement_method_type)

        if filters.status:
            query = query.filter(Tender.status == filters.status)

        if filters.category_id:
            query = query.filter(Tender.category_id == filters.category_id)

        if filters.subcategory_id:
            query = query.filter(Tender.subcategory_id == filters.subcategory_id)

        if filters.min_value is not None:
            query = query.filter(Tender.value_amount >= filters.min_value)

        if filters.max_value is not None:
            query = query.filter(Tender.value_amount <= filters.max_value)

        if filters.date_from:
            query = query.filter(Tender.date >= filters.date_from)

        if filters.date_to:
            query = query.filter(Tender.date <= filters.date_to)

        if filters.value_currency:
            query = query.filter(Tender.value_currency == filters.value_currency)

    return query.offset(skip).limit(limit).all()


def update_tender(db: Session, tender_id: str, tender_in: TenderUpdate) -> Optional[Tender]:
    """
    Update an existing tender record.
    """
    tender = get_tender(db, tender_id)
    if not tender:
        return None

    # Loop over each field in the update schema and update the model instance.
    update_data = tender_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tender, field, value)
    tender.date_modified = datetime.datetime.now()  # update modified timestamp
    db.commit()
    db.refresh(tender)
    return tender

def delete_tender(db: Session, tender_id: str) -> Optional[Tender]:
    """
    Delete a tender record.
    """
    tender = get_tender(db, tender_id)
    if not tender:
        return None
    db.delete(tender)
    db.commit()
    return tender

