from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from ..models.user import User, Role
from ..schemas.auth import UserCreate, UserUpdate
from ..core.auth import AuthHandler
import logging

logger = logging.getLogger(__name__)

class UserService:
    
    @staticmethod
    async def create_user(user_data: UserCreate, session: AsyncSession) -> User:
        """Crear nuevo usuario"""
        try:
            # Verificar que el usuario no exista
            existing_user = await UserService.get_user_by_username(user_data.username, session)
            if existing_user:
                raise ValueError("Username already exists")
            
            existing_email = await UserService.get_user_by_email(user_data.email, session)
            if existing_email:
                raise ValueError("Email already exists")
            
            # Hash password
            hashed_password = AuthHandler.get_password_hash(user_data.password)
            
            # Crear usuario
            user = User(
                username=user_data.username,
                email=user_data.email,
                full_name=user_data.full_name,
                hashed_password=hashed_password
            )
            
            # Asignar roles
            if user_data.role_names:
                roles = await UserService.get_roles_by_names(user_data.role_names, session)
                user.roles = roles
            
            session.add(user)
            await session.commit()
            await session.refresh(user)
            
            logger.info(f"Usuario creado: {user.username}")
            return user
            
        except Exception as e:
            await session.rollback()
            logger.error(f"Error creando usuario: {str(e)}")
            raise
    
    @staticmethod
    async def get_user_by_username(username: str, session: AsyncSession) -> Optional[User]:
        """Obtener usuario por username"""
        query = select(User).options(selectinload(User.roles)).where(
            User.username == username
        )
        result = await session.execute(query)
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_user_by_email(email: str, session: AsyncSession) -> Optional[User]:
        """Obtener usuario por email"""
        query = select(User).where(User.email == email)
        result = await session.execute(query)
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_roles_by_names(role_names: List[str], session: AsyncSession) -> List[Role]:
        """Obtener roles por nombres"""
        query = select(Role).where(Role.name.in_(role_names))
        result = await session.execute(query)
        return list(result.scalars().all())
    
    @staticmethod
    async def update_user(
        user_id: str, 
        user_data: UserUpdate, 
        session: AsyncSession
    ) -> Optional[User]:
        """Actualizar usuario"""
        try:
            query = select(User).options(selectinload(User.roles)).where(
                User.id == user_id
            )
            result = await session.execute(query)
            user = result.scalar_one_or_none()
            
            if not user:
                return None
            
            # Actualizar campos
            if user_data.email is not None:
                user.email = user_data.email
            if user_data.full_name is not None:
                user.full_name = user_data.full_name
            if user_data.is_active is not None:
                user.is_active = user_data.is_active
            
            # Actualizar roles
            if user_data.role_names is not None:
                roles = await UserService.get_roles_by_names(user_data.role_names, session)
                user.roles = roles
            
            await session.commit()
            await session.refresh(user)
            
            return user
            
        except Exception as e:
            await session.rollback()
            logger.error(f"Error actualizando usuario: {str(e)}")
            raise
    
    @staticmethod
    async def get_all_users(session: AsyncSession) -> List[User]:
        """Obtener todos los usuarios"""
        query = select(User).options(selectinload(User.roles)).where(
            User.is_active == True
        )
        result = await session.execute(query)
        return list(result.scalars().all())
    
    @staticmethod
    async def create_default_roles(session: AsyncSession):
        """Crear roles por defecto del sistema"""
        default_roles = [
            {
                "name": "ADMINISTRADOR",
                "description": "Acceso completo al sistema",
                "permissions": "all"
            },
            {
                "name": "PERCAPITA", 
                "description": "Usuario de percápita con acceso limitado",
                "permissions": "read_dashboard,create_users,read_files,upload_files"
            }
        ]
        
        for role_data in default_roles:
            # Verificar si el rol ya existe
            query = select(Role).where(Role.name == role_data["name"])
            result = await session.execute(query)
            existing_role = result.scalar_one_or_none()
            
            if not existing_role:
                role = Role(**role_data)
                session.add(role)
        
        await session.commit()
        logger.info("Roles por defecto creados")
    
    @staticmethod
    async def create_admin_user(session: AsyncSession):
        """Crear usuario administrador por defecto"""
        admin_username = "admin"
        
        # Verificar si ya existe
        existing_admin = await UserService.get_user_by_username(admin_username, session)
        if existing_admin:
            return existing_admin
        
        # Obtener rol de administrador
        query = select(Role).where(Role.name == "ADMINISTRADOR")
        result = await session.execute(query)
        admin_role = result.scalar_one_or_none()
        
        if not admin_role:
            await UserService.create_default_roles(session)
            result = await session.execute(query)
            admin_role = result.scalar_one_or_none()
        
        # Crear admin
        admin_user = User(
            username=admin_username,
            email="admin@percapita.com",
            full_name="Administrador Sistema",
            hashed_password=AuthHandler.get_password_hash("admin123"),
            roles=[admin_role] if admin_role else []
        )
        
        session.add(admin_user)
        await session.commit()
        
        logger.info("Usuario administrador creado")
        return admin_user