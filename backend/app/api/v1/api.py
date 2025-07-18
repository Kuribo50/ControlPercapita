from fastapi import APIRouter
from .endpoints import auth, percapita, users

api_router = APIRouter()

# Incluir endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(percapita.router, prefix="/percapita", tags=["percapita"])
api_router.include_router(users.router, prefix="/users", tags=["users"])