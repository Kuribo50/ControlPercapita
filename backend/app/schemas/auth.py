from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional
from uuid import UUID

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)
    role_names: List[str] = ["PERCAPITA"]  # Rol por defecto
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password debe tener al menos 6 caracteres')
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    role_names: Optional[List[str]] = None

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    roles: List[str] = []
    created_at: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class RoleBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = None
    permissions: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class RoleResponse(RoleBase):
    id: UUID
    created_at: str

    class Config:
        from_attributes = True