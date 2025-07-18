from datetime import timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from ....core.database import get_async_session
from ....core.auth import AuthHandler, get_current_user, get_admin_user
from ....schemas.auth import (
    Token, UserCreate, UserResponse, UserUpdate, 
    LoginRequest, RoleResponse
)
from ....services.user_service import UserService
from ....core.config import settings

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_async_session)
):
    """Login de usuario"""
    user = await AuthHandler.authenticate_user(
        form_data.username, 
        form_data.password, 
        session
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthHandler.create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
            roles=[role.name for role in user.roles],
            created_at=user.created_at.isoformat()
        )
    }

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    session: AsyncSession = Depends(get_async_session),
    current_user = Depends(get_admin_user)  # Solo admins pueden crear usuarios
):
    """Registrar nuevo usuario"""
    try:
        user = await UserService.create_user(user_data, session)
        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
            roles=[role.name for role in user.roles],
            created_at=user.created_at.isoformat()
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user = Depends(get_current_user)
):
    """Obtener información del usuario actual"""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        roles=[role.name for role in current_user.roles],
        created_at=current_user.created_at.isoformat()
    )

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    session: AsyncSession = Depends(get_async_session),
    current_user = Depends(get_admin_user)
):
    """Obtener todos los usuarios (solo admins)"""
    users = await UserService.get_all_users(session)
    return [
        UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
            roles=[role.name for role in user.roles],
            created_at=user.created_at.isoformat()
        )
        for user in users
    ]

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    session: AsyncSession = Depends(get_async_session),
    current_user = Depends(get_admin_user)
):
    """Actualizar usuario (solo admins)"""
    user = await UserService.update_user(user_id, user_data, session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        roles=[role.name for role in user.roles],
        created_at=user.created_at.isoformat()
    )

@router.post("/setup")
async def setup_initial_data(
    session: AsyncSession = Depends(get_async_session)
):
    """Configurar datos iniciales del sistema"""
    try:
        # Crear roles por defecto
        await UserService.create_default_roles(session)
        
        # Crear usuario admin por defecto
        admin_user = await UserService.create_admin_user(session)
        
        return {
            "message": "Setup completed successfully",
            "admin_user": admin_user.username,
            "default_password": "admin123"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Setup failed: {str(e)}"
        )