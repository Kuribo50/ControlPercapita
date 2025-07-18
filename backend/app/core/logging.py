import logging
import sys
from typing import Dict, Any
from pathlib import Path

def setup_logging(log_level: str = "INFO") -> None:
    """Configurar logging para la aplicación"""
    
    # Crear directorio de logs
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Configuración de logging
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Logger principal
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_dir / "app.log"),
        ]
    )
    
    # Logger específico para errores
    error_logger = logging.getLogger("error")
    error_handler = logging.FileHandler(log_dir / "error.log")
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(logging.Formatter(log_format))
    error_logger.addHandler(error_handler)
    
    # Reducir verbosidad de librerías externas
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)