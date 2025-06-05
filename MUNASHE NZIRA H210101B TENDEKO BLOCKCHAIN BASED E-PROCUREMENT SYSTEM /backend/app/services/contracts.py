from app.schemas.db_config import Contract, Supplier, ProcuringEntity, Tender, Award, User
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload, load_only 


def get_contract_by_id(db: Session, contract_id: str) -> Optional[Contract]:
    """
    Retrieve a contract by its primary key (id), along with its related entities
    including procuring entity and supplier details.
    
    Args:
        db: Database session
        contract_id: The unique identifier of the contract
        
    Returns:
        Contract object with all related data or None if not found
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

    return ( db.query(Contract)
        .options(
            joinedload(Contract.supplier).joinedload(Supplier.user)
            .load_only(*user_fields),

            

            joinedload(Contract.tender)
                .joinedload(Tender.procuring_entity)
                .joinedload(ProcuringEntity.user).load_only(*user_fields),

            joinedload(Contract.payments),
                
            joinedload(Contract.award)
                .joinedload(Award.bid),
                
            joinedload(Contract.tender)
                .joinedload(Tender.items),

            joinedload(Contract.tender)
                .joinedload(Tender.category),
            joinedload(Contract.tender)
                .joinedload(Tender.subcategory)
        )
        .filter(Contract.id == contract_id)
        .first()
    )


def get_contract_by_tender_id(db: Session, tender_id: str) -> Optional[Contract]:
    """
    Retrieve a contract by tender_id, along with its related entities
    including procuring entity and supplier details.
    
    Args:
        db: Database session
        tender_id: The unique identifier of the contract
        
    Returns:
        Contract object with all related data or None if not found
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

    return ( db.query(Contract)
        .options(
            joinedload(Contract.supplier).joinedload(Supplier.user)
            .load_only(*user_fields),
            

            joinedload(Contract.tender)
                .joinedload(Tender.procuring_entity)
                .joinedload(ProcuringEntity.user)
                .load_only(*user_fields),
                
            joinedload(Contract.award)
                .joinedload(Award.bid),
                
            joinedload(Contract.tender)
                .joinedload(Tender.items),

            joinedload(Contract.tender)
                .joinedload(Tender.category),
            joinedload(Contract.tender)
                .joinedload(Tender.subcategory)
        )
        .filter(Contract.tender_id == tender_id)
        .first()
    )


def get_contracts(db: Session) -> List[Contract]:
    """
    Retrieve all contracts from the database.
    """
    return db.query(Contract).all()