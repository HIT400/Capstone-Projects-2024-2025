from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from datetime import timezone, datetime
from .database import engine

Base = declarative_base()

class Doctor(Base):
    __tablename__ = 'doctors'
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    uploads = relationship('Upload', back_populates='doctor')


class Upload(Base):
    __tablename__ = 'uploads'
    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String)
    upload_timestamp = Column(DateTime, default=datetime.now(timezone.utc)) 
    result = Column(String)  # Cancer or No-Cancer
    confidence = Column(Float)
    patient_name = Column(String)
    patient_age = Column(Integer, nullable=True)
    patient_gender = Column(String, nullable=True)
    doctor_id = Column(Integer, ForeignKey('doctors.id'))
    doctor = relationship('Doctor', back_populates='uploads')

Base.metadata.create_all(bind=engine)