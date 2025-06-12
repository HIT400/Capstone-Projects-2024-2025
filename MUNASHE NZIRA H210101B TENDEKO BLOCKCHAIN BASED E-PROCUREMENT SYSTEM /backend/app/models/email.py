from pydantic import BaseModel, EmailStr

class EmailSchema(BaseModel):
    email: EmailStr
    subject: str
    body: str