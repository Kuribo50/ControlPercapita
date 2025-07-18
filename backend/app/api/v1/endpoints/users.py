from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ....core.database import get_async_session
from ....core.auth import get_current_user, get_admin_user
from ....models.user import User
from ....schemas.auth import UserResponse, UserCreate, UserUpdate
from ....services.user_service import UserService

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
async def get_users(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_admin_user)
):
    """Obtener todos los usuarios"""
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

@router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_admin_user)
):
    """Crear nuevo usuario"""
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

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Obtener usuario por ID"""
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    
    query = select(User).options(selectinload(User.roles)).where(User.id == user_id)
    result = await session.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Solo admins o el mismo usuario pueden ver la info
    if not current_user.has_role("ADMINISTRADOR") and current_user.id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver este usuario"
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

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_admin_user)
):
    """Actualizar usuario"""
    user = await UserService.update_user(user_id, user_data, session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
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

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_admin_user)
):
    """Desactivar usuario (soft delete)"""
    from sqlalchemy import select
    
    query = select(User).where(User.id == user_id)
    result = await session.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    user.is_active = False
    await session.commit()
    
    return {"message": "Usuario desactivado correctamente"}