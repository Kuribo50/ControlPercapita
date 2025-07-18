from pydantic import BaseModel
from typing import Optional, Any, Dict

class ResponseMessage(BaseModel):
    message: str
    success: bool = True
    data: Optional[Any] = None

class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
    
class PaginationParams(BaseModel):
    page: int = 1
    size: int = 50
    
class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    size: int
    pages: int