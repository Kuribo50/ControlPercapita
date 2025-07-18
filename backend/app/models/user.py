from sqlalchemy import Column, String, Boolean, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import BaseModel

# Tabla de relación muchos a muchos para usuarios y roles
user_roles = Table(
    'user_roles',
    BaseModel.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True),
    Column('role_id', UUID(as_uuid=True), ForeignKey('roles.id'), primary_key=True)
)

class Role(BaseModel):
    __tablename__ = "roles"
    
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    permissions = Column(String(500), nullable=True)  # JSON string de permisos
    
    # Relación con usuarios
    users = relationship("User", secondary=user_roles, back_populates="roles")
    
    def __repr__(self):
        return f"<Role {self.name}>"

class User(BaseModel):
    __tablename__ = "users"
    
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Relación con roles
    roles = relationship("Role", secondary=user_roles, back_populates="users")
    
    def has_role(self, role_name: str) -> bool:
        """Verifica si el usuario tiene un rol específico"""
        return any(role.name == role_name for role in self.roles)
    
    def has_permission(self, permission: str) -> bool:
        """Verifica si el usuario tiene un permiso específico"""
        for role in self.roles:
            if role.permissions and permission in role.permissions:
                return True
        return False
    
    def __repr__(self):
        return f"<User {self.username}>"