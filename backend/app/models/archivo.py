# backend/app/models/archivo.py (actualizar)
from sqlalchemy import Column, String, Integer, Date, DateTime, Boolean, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from ..core.database import Base

class Archivo(Base):
    __tablename__ = "archivos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(255), nullable=False)
    unique_filename = Column(String(255), nullable=False)  # Nombre único en servidor
    formato = Column(String(50), nullable=False)
    fecha_corte = Column(Date, nullable=False, index=True)
    total_registros = Column(Integer, default=0)
    path_archivo = Column(String(500), nullable=False)
    
    # Nuevos campos para mejorar la funcionalidad
    metadata = Column(JSON, nullable=True)  # Metadatos del archivo (establecimientos, estadísticas, etc.)
    estado_procesamiento = Column(String(50), default='pendiente')  # pendiente, procesando, completado, error
    
    # Estadísticas del procesamiento
    nuevos_inscritos = Column(Integer, default=0)
    rechazos_previsionales = Column(Integer, default=0)
    traslados_negativos = Column(Integer, default=0)
    traslados_positivos = Column(Integer, default=0)
    
    # Control
    is_active = Column(Boolean, default=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=True)  # Usuario que subió el archivo
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    registros = relationship("RegistroFonasa", back_populates="archivo", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Archivo(id={self.id}, filename={self.filename}, fecha_corte={self.fecha_corte})>"