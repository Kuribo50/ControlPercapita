from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Información básica
    PROJECT_NAME: str = "Sistema Control Percápita"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Base de datos (agregamos estas para que no den error)
    DATABASE_URL: str = "sqlite:///./percapita.db"
    DATABASE_URL_SYNC: str = "sqlite:///./percapita.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Seguridad
    SECRET_KEY: str = "tu-clave-secreta-muy-segura-para-desarrollo"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000", 
        "http://localhost:4321",
        "http://127.0.0.1:3000"
    ]
    
    # Archivos
    MAX_FILE_SIZE: int = 52428800  # 50MB
    UPLOAD_FOLDER: str = "uploads"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"  # Esto ignora variables extra
    }

settings = Settings()