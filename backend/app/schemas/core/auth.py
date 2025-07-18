from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..models.user import User, Role
from ..core.config import settings
from ..core.database import get_async_session

# Configuración de encriptación
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

class AuthHandler:
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verifica password"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash de password"""
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Crea token JWT"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    async def verify_token(token: str, session: AsyncSession) -> Optional[User]:
        """Verifica y decodifica token"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            username: str = payload.get("sub")
            if username is None:
                return None
        except JWTError:
            return None
        
        # Buscar usuario en BD
        query = select(User).options(selectinload(User.roles)).where(
            User.username == username,
            User.is_active == True
        )
        result = await session.execute(query)
        user = result.scalar_one_or_none()
        return user
    
    @staticmethod
    async def authenticate_user(username: str, password: str, session: AsyncSession) -> Optional[User]:
        """Autentica usuario"""
        query = select(User).options(selectinload(User.roles)).where(
            User.username == username,
            User.is_active == True
        )
        result = await session.execute(query)
        user = result.scalar_one_or_none()
        
        if not user or not AuthHandler.verify_password(password, user.hashed_password):
            return None
        return user

# Dependencies
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_async_session)
) -> User:
    """Dependency para obtener usuario actual"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not credentials:
        raise credentials_exception
    
    user = await AuthHandler.verify_token(credentials.credentials, session)
    if user is None:
        raise credentials_exception
    return user

async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Dependency para verificar que el usuario es admin"""
    if not current_user.has_role("ADMINISTRADOR"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

def require_permissions(required_permissions: List[str]):
    """Decorator para requerir permisos específicos"""
    def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        for permission in required_permissions:
            if not current_user.has_permission(permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission required: {permission}"
                )
        return current_user
    return permission_checker