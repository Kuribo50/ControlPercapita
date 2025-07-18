#!/usr/bin/env python3
"""Script para inicializar la base de datos"""

import asyncio
import logging
from app.core.database import async_engine
from app.models.base import Base
from app.services.user_service import UserService
from app.core.database import get_async_session

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db():
    """Inicializar base de datos con datos por defecto"""
    
    # Crear todas las tablas
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Tablas creadas")
    
    # Crear datos iniciales
    async for session in get_async_session():
        try:
            # Crear roles
            await UserService.create_default_roles(session)
            logger.info("Roles creados")
            
            # Crear usuario admin
            admin_user = await UserService.create_admin_user(session)
            logger.info(f"Usuario admin creado: {admin_user.username}")
            
            break
        except Exception as e:
            logger.error(f"Error creando datos iniciales: {e}")
    
    logger.info("Base de datos inicializada correctamente")

if __name__ == "__main__":
    asyncio.run(init_db())