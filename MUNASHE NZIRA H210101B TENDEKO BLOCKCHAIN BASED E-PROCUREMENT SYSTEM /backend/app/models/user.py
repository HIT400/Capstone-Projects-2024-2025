# app/models/user.py

from pydantic import BaseModel
from enum import Enum

class UserStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    LOCKED = "locked"

class UserLogin(BaseModel):
    username: str
    password: str


    class Config:
        from_attributes = True



