from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, Float, Boolean, Enum, Text, JSON
from sqlalchemy.orm import relationship, declarative_base, sessionmaker
from passlib.context import CryptContext
import datetime 
import enum
import uuid

Base = declarative_base()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class ProcurementMethod(enum.Enum):
    OPEN = "open"
    SELECTIVE = "selective"
    LIMITED = "limited"

class ProcurementMethodType(enum.Enum):
    INTERNATIONAL = "international"
    NATIONAL = "national"
    DIRECT = "direct"
    
class TenderStatus(enum.Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    AWARDED = "awarded"
    CLOSED = "closed"
    COMPLETED = "completed"
    PENDING = "pending"
    ON_HOLD= "onhold"


class DocumentType(enum.Enum):
    TENDER_NOTICE = "tender_notice"
    CONTRACT = "contract"
    BID_DOCUMENT = "bid_document"
    REPORT = "report"

class Confidentiality(enum.Enum):
    PUBLIC = "public"
    PRIVATE = "private"
    INTERNAL = "internal"

class AwardStatus(enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    CANCELLED = "cancelled"

class ContractStatus(enum.Enum):
    ACTIVE = "active"
    TERMINATED = "terminated"
    COMPLETED = "completed"

class UserRole(enum.Enum):
    SUPPLIER = "supplier"
    PROCURING_ENTITY = "procuring_entity"
    BOTH = "both"
    REGULATOR = "regulator"

class ProcurementCategory(Base):
    __tablename__ = 'procurement_categories'
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)

    # Relationship with ProcurementSubcategory
    subcategories = relationship('ProcurementSubcategory', back_populates='category')
    suppliers = relationship("SupplierCategory", back_populates="category")

    def __repr__(self):
        return f"<ProcurementCategory(name={self.name})>"

class ProcurementSubcategory(Base):
    __tablename__ = 'procurement_subcategories'
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    category_id = Column(Integer, ForeignKey('procurement_categories.id'), nullable=False)

    # Relationship back to ProcurementCategory
    category = relationship('ProcurementCategory', back_populates='subcategories')

    def __repr__(self):
        return f"<ProcurementSubcategory(name={self.name}, category_id={self.category_id})>"

class Tender(Base):
    __tablename__ = 'tenders'
    
    id = Column(String(255), primary_key=True)
    title = Column(String(255))
    description = Column(String(255))
    closing_date = Column(DateTime)
    date_modified = Column(DateTime, default=datetime.datetime.now)
    date_created = Column(DateTime, default=datetime.datetime.now)
    procurement_method = Column(String(255))
    procurement_method_type = Column(String(255))
    value_amount = Column(Float)
    value_currency = Column(String(255))
    value_added_tax_included = Column(Boolean)
    status = Column(Enum(TenderStatus))
    evaluated = Column(Boolean, default=False)

    # Category relationship (Many-to-One)
    category_id = Column(Integer, ForeignKey('procurement_categories.id'), nullable=False)
    category = relationship("ProcurementCategory")

    # Subcategory relationship (Many-to-One)
    subcategory_id = Column(Integer, ForeignKey('procurement_subcategories.id'), nullable=False)
    subcategory = relationship("ProcurementSubcategory")

    documents = relationship("Document", back_populates="tender")
    procuring_entity_id = Column(String(255), ForeignKey('procuring_entities.id'))
    procuring_entity = relationship("ProcuringEntity", back_populates="tenders")
    awards = relationship("Award", back_populates="tender")
    bids = relationship("Bid", back_populates="tender") 
    contracts = relationship("Contract", back_populates="tender")
    items = relationship("Item", back_populates="tender", cascade="all, delete-orphan")
    violations = relationship("TenderViolation", back_populates="tender")

class Document(Base):
    __tablename__ = 'documents'
    
    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255))
    document_type = Column(String(255))
    date_published = Column(DateTime, default=datetime.datetime.now)
    hash = Column(String(255))
    url = Column(String(255))
  
    tender_id = Column(String(255), ForeignKey('tenders.id'))
    tender = relationship("Tender", back_populates="documents")

class Item(Base):
    __tablename__ = 'items'
    
    id = Column(String(255), primary_key=True)
    description = Column(String(255))
    quantity = Column(Float)
    unit_name = Column(String(255))
    unit_code = Column(String(255))
    classification_description = Column(String(255))
    classification_scheme = Column(String(255))
    classification_id = Column(String(255))
    delivery_date_end = Column(DateTime)
    delivery_address_street = Column(String(255))
    delivery_address_region = Column(String(255))
    delivery_address_postal_code = Column(String(255))
    delivery_address_country = Column(String(255))
    
    tender_id = Column(String(255), ForeignKey("tenders.id"), nullable=False)
    tender = relationship("Tender", back_populates="items")


class BankAccount(Base):
    __tablename__ = 'bank_accounts'

    id = Column(String(255), primary_key=True)
    owner_id = Column(String(255), nullable=False)  # No ForeignKey (polymorphic)
    owner_type = Column(String(50), nullable=False)  # e.g., 'supplier', 'user'
    
    # Banking fields
    bank_name = Column(String(255))
    account_number = Column(String(255), unique=True)  # Ensure uniqueness
    swift_code = Column(String(50))
    routing_number = Column(String(50))
    account_type = Column(String(50))
    account_holder_name = Column(String(255))

class User(Base):
    __tablename__ = "users"

    id = Column(String(255), primary_key=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    address_street = Column(String(255))
    name = Column(String(255))
    address_region = Column(String(255))
    address_postal_code = Column(String(255))
    address_country = Column(String(255))
    role = Column(
        Enum(UserRole, values_callable=lambda enum_cls: [e.value for e in enum_cls]),
        default=UserRole.SUPPLIER
    )
    is_active = Column(Boolean, default=True)

    procuring_entity = relationship("ProcuringEntity", back_populates="user")
    supplier = relationship("Supplier", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password, self.password)

    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)
    
class Supplier(Base):
    __tablename__ = 'suppliers'
        
    id = Column(String(255), primary_key=True)
    user_id = Column(String(255), ForeignKey("users.id"), unique=True, nullable=False)
    legal_name = Column(String(255))
    vendor_number = Column(String(255))
    tax_clearance_number = Column(String(255))

    # bank_accounts = relationship(
    #     "BankAccount",
    #     primaryjoin=lambda: and_(
    #         BankAccount.owner_id == Supplier.id,
    #         BankAccount.owner_type == 'supplier'  
    #     ),
    #     backref="supplier",  
    #     cascade="all, delete-orphan" 
    # )    

    user = relationship("User", back_populates="supplier")
    awards = relationship("Award", back_populates="supplier")  
    bids = relationship("Bid", back_populates="supplier")
    allowed_categories = relationship("SupplierCategory", back_populates="supplier", cascade="all, delete-orphan")

class SupplierCategory(Base):
    __tablename__ = 'supplier_categories'
    
    supplier_id = Column(String(255), ForeignKey("suppliers.id"), primary_key=True)
    category_id = Column(Integer, ForeignKey("procurement_categories.id"), primary_key=True)

    supplier = relationship("Supplier", back_populates="allowed_categories")
    category = relationship("ProcurementCategory", back_populates="suppliers")

class Bid(Base):
    __tablename__ = 'bids'
    
    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    tender_id = Column(String(255), ForeignKey("tenders.id"), nullable=False)
    supplier_id = Column(String(255), ForeignKey("suppliers.id"), nullable=False)
    bid_amount = Column(Float)
    created_at = Column(DateTime, default=datetime.datetime.now)
    is_winning_bid = Column(Boolean, default=False)

    tender = relationship("Tender", back_populates="bids")
    supplier = relationship("Supplier", back_populates="bids")
    documents = relationship("BidDocument", back_populates="bid")
    bid_items = relationship("BidItem", back_populates="bid")
    evaluation = relationship("BidEvaluation", back_populates="bid", uselist=False)

class BidEvaluation(Base):
    __tablename__ = 'bid_evaluations'

    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    bid_id = Column(String(255), ForeignKey("bids.id"), nullable=False)
    total_score = Column(Float, nullable=False)
    price_score = Column(Float, nullable=False)
    technical_score = Column(Float, nullable=False)
    compliance_score = Column(Float, nullable=False)
    evaluation_summary = Column(Text, nullable=False)
    flags = Column(JSON, nullable=False, default=list)
    evaluation_date = Column(DateTime, default=datetime.datetime.now, nullable=False)

    bid = relationship("Bid", back_populates="evaluation")

    def __repr__(self):
        return f"<BidEvaluation(bid_id={self.bid_id}, total_score={self.total_score}, evaluation_date={self.evaluation_date})>"

class BidItem(Base):
    __tablename__ = 'bid_items'
    
    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    bid_id = Column(String(255), ForeignKey("bids.id"), nullable=False)
    item_id = Column(String(255))  
    description = Column(String(255))
    quantity = Column(Integer)
    unit_name = Column(String(255))
    unit_price = Column(Float)
    total_price = Column(Float)

    bid = relationship("Bid", back_populates="bid_items")

class BidDocument(Base):
    __tablename__ = 'bid_documents'
    
    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    bid_id = Column(String(255), ForeignKey("bids.id"), nullable=False)
    title = Column(String(255))
    document_type = Column(String(255))
    date_published = Column(DateTime, default=datetime.datetime.now)
    hash = Column(String(255))
    url = Column(String(255))

    bid = relationship("Bid", back_populates="documents")


class ProcuringEntity(Base):
    __tablename__ = 'procuring_entities'
    
    id = Column(String(255), primary_key=True)
    user_id = Column(String(255), ForeignKey("users.id"), unique=True, nullable=False)
    contact_name = Column(String(255))
    contact_email = Column(String(255))
    contact_telephone = Column(String(255))
    
    # bank_name = Column(String(255))
    # bank_branch = Column(String(255))
    # bank_account_number = Column(String(255))
    # bank_swift_code = Column(String(50))
    # bank_routing_number = Column(String(50))
    # bank_account_type = Column(String(50))
    # bank_account_holder_name = Column(String(255))

    user = relationship("User", back_populates="procuring_entity")
    tenders = relationship("Tender", back_populates="procuring_entity")

class Award(Base):
    __tablename__ = 'awards'
    
    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    tender_id = Column(String(255), ForeignKey("tenders.id"), nullable=False)
    bid_id = Column(String(255), ForeignKey("bids.id"), nullable=False)
    supplier_id = Column(String(255), ForeignKey("suppliers.id"), nullable=False)
    award_date = Column(DateTime, default=datetime.datetime.now)

    tender = relationship("Tender", back_populates="awards")
    supplier = relationship("Supplier", back_populates="awards")
    bid = relationship("Bid")

class Contract(Base):
    __tablename__ = 'contracts'
    
    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    tender_id = Column(String(255), ForeignKey("tenders.id"), nullable=False)
    award_id = Column(String(255), ForeignKey("awards.id"), nullable=False)
    supplier_id = Column(String(255), ForeignKey("suppliers.id"), nullable=False)
    contract_date = Column(DateTime, default=datetime.datetime.now)
    contract_value = Column(Float)
    contract_text = Column(Text)
    # status = Column(Enum(ContractStatus))
    status = Column(String(50), default="active")  

    tender = relationship("Tender", back_populates="contracts")
    award = relationship("Award")
    supplier = relationship("Supplier")
    payments = relationship("Payment", back_populates="contract")

class Configuration(Base):
    __tablename__ = 'configurations'
    
    id = Column(String(255), primary_key=True)
    has_auction = Column(Boolean)
    has_awarding_order = Column(Boolean)
    has_value_restriction = Column(Boolean)
    value_currency_equality = Column(Boolean)
    has_prequalification = Column(Boolean)
    min_bids_number = Column(Integer)
    has_pre_selection_agreement = Column(Boolean)
    has_tender_complaints = Column(Boolean)
    has_award_complaints = Column(Boolean)
    has_cancellation_complaints = Column(Boolean)
    has_value_estimation = Column(Boolean)
    has_qualification_complaints = Column(Boolean)
    tender_complain_regulation = Column(Integer)
    qualification_complain_duration = Column(Integer)
    award_complain_duration = Column(Integer)
    cancellation_complain_duration = Column(Integer)
    clarification_until_duration = Column(Integer)
    qualification_duration = Column(Integer)
    restricted = Column(Boolean)

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(String(255), primary_key=True)
    user_id = Column(String(255), ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(255), default="USD")
    contract_id = Column(String(255), ForeignKey("contracts.id"), nullable=False)
    description = Column(String(255))
    payment_method = Column(String(255), default="paypal")
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    payer_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.now)
    updated_at = Column(DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now)

    contract = relationship("Contract", back_populates="payments")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "amount": self.amount,
            "currency": self.currency,
            "contract_id": self.contract_id,
            "description": self.description,
            "payment_method": self.payment_method,
            "status": self.status.value if self.status else None,  # make sure to handle None
            "payer_id": self.payer_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }   
    

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String(255), primary_key=True)
    title = Column(String(255))
    message = Column(String(255))
    read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(String(255), ForeignKey("users.id"))
    
    # Relationships
    user = relationship("User", back_populates="notifications")


class TenderViolation(Base):
    __tablename__ = "tender_violations"
    
    id = Column(String(255), primary_key=True)
    tender_id = Column(String(255), ForeignKey("tenders.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(255), nullable=False)  # 'low', 'medium', 'high'
    date_detected = Column(DateTime, nullable=False)
    reported_at = Column(DateTime, nullable=False)
    assigned_to = Column(String(255), ForeignKey("users.id"), nullable=True)
    resolution_status = Column(String(255), default="pending")  # 'pending', 'investigating', 'resolved', 'dismissed'
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    tender = relationship("Tender", back_populates="violations")
    assignee = relationship("User", foreign_keys=[assigned_to])

DATABASE_URL = 'mysql+mysqlconnector://root:@localhost:3306/eprocurement'

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = SessionLocal()

Base.metadata.create_all(engine)

# def add_procurement_data():
#     # Create categories
#     categories = [
#         'Construction', 'Medicine', 'Furniture', 'Computer equipment',
#         'Office and household goods', 'Transport and spare parts', 'Energy, oil products and fuel',
#         'Metals', 'Utility and consumer services', 'Education and consulting',
#         'Real estate', 'Agriculture', 'Clothing, footwear and textile',
#         'Industrial equipment and instruments', 'Food', 'Printing',
#         'Research and development works', 'Various services and products'
#     ]
    
#     # Add categories to the session
#     category_objects = []
#     for category in categories:
#         category_obj = ProcurementCategory(name=category)
#         category_objects.append(category_obj)
#     session.add_all(category_objects)
#     session.commit()

#     # Define subcategories for each category
#     subcategories = {
#         'Construction': [
#             'Oil and coal refined products', 'Sand, clay and stone', 'Precious and semi-precious stones, abrasives',
#             'Structures and construction materials', 'Construction works and services', 'Varnishes, paints and mastics'
#         ],
#         'Medicine': [
#             'Medical equipment, furniture and materials', 'Pharmaceutical products', 'Healthcare services'
#         ],
#         'Furniture': [
#             'Chairs, tables and cabinets', 'Office furniture', 'Home furniture', 'Different furniture', 'School furniture',
#             'Store and warehouse furniture', 'Laboratory furniture'
#         ],
#         'Office and household goods': [
#             'Printing forms and inks', 'Notebooks, journals and other paper stationery', 'Office supplies and stationery',
#             'Household goods and cleaning products', 'Needlework and fine arts accessories'
#         ],
#         'Transport and spare parts': [
#             'Agricultural and heavy machinery', 'Cars', 'Trucks and vehicles for the transportation of 10 or more people',
#             'Trailers and bodies', 'Engines and spare parts', 'Motorcycles and bicycles', 'Water transportation',
#             'Railway transportation', 'Air and space aircraft and their parts', 'Military vehicles', 'Transport maintenance services',
#             'Transport services'
#         ],
#         'Energy, oil products and fuel': [
#             'Fuelwood', 'Solid fuel', 'Gas', 'Oil, coal and distillates', 'Electric, thermal, solar and nuclear energy',
#             'Mineral raw materials for the chemical and fertilizer industries', 'Chemical products'
#         ],
#         'Metals': [
#             'Metal ores and alloys', 'Base metals', 'Metal products (rolled products, pipes, cables, wires)'
#         ],
#         'Utility and consumer services': [
#             'Landscaping and crop production', 'Sewerage and drainage', 'Garbage disposal', 'Cleaning services', 'Utilities'
#         ],
#         'Education and consulting': [
#             'Business and management consulting', 'Education and training services', 'Professional training services',
#             'Defense and security training'
#         ],
#         'Real estate': [
#             'Real estate purchase and sale', 'Real estate rent', 'Property management services'
#         ],
#         'Agriculture': [
#             'Crop production', 'Livestock and animal products', 'Plants', 'Animal feed', 'Agricultural services'
#         ],
#         'Clothing, footwear and textile': [
#             'Clothing', 'Footwear', 'Bags', 'Leather goods', 'Textile and related products', 'Yarns and textile threads'
#         ],
#         'Industrial equipment and instruments': [
#             'Solar energy', 'Agricultural equipment', 'Electrical equipment, machinery and materials', 'Equipment for transport',
#             'Security, firefighting, police equipment', 'Navigation and meteorological instruments', 'Household equipment',
#             'Industrial machinery', 'Construction and mining equipment'
#         ],
#         'Food': [
#             'Meat and meat products', 'Fish and seafood', 'Fruits, vegetables and related products', 'Animal and vegetable fats and oils',
#             'Dairy products', 'Cereals and flour', 'Other food products', 'Alcoholic beverages and tobacco', 'Soft drinks', 'Catering services'
#         ],
#         'Printing': [
#             'Books, brochures and prospectuses', 'Periodicals', 'Various printed materials', 'Printing and publishing services'
#         ],
#         'Research and development works': [
#             'Research and development works'
#         ],
#         'Various services and products': [
#             'Wood and related products', 'Jewelry and watches', 'Rubber and plastic materials', 'Various materials, equipment and products',
#             'Installation, repair and maintenance services', 'Hotel and related services', 'Transportation and storage services',
#             'Business, legal and financial services', 'Services for oil and gas industry', 'Various services', 'Leisure goods'
#         ],
#         'Computer equipment': [
#             'Office equipment', 'Servers, computers and equipment', 'TV, radio and telecommunication equipment', 'Control systems',
#             'Software', 'Computer systems maintenance services'
#         ]
#     }

#     # Add subcategories for each category
#     for category_name, subcategory_list in subcategories.items():
#         category = session.query(ProcurementCategory).filter_by(name=category_name).first()
#         for subcategory in subcategory_list:
#             subcategory_obj = ProcurementSubcategory(name=subcategory, category_id=category.id)
#             session.add(subcategory_obj)
#     session.commit()

# # Run the function to add data
# add_procurement_data()

# Close the session
# session.close()

