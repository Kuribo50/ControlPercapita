from sqlalchemy import Column, String, Integer, Date, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import BaseModel

class RegistroFonasa(BaseModel):
    __tablename__ = "registros_fonasa"
    
    # Relación con archivo
    archivo_id = Column(UUID(as_uuid=True), ForeignKey("archivos.id"), nullable=False)
    
    # Datos de identificación
    run = Column(String(8), nullable=False)  # Sin DV
    dv = Column(String(1), nullable=False)
    nombres = Column(String(255), nullable=False)
    apellido_paterno = Column(String(100), nullable=False)
    apellido_materno = Column(String(100), nullable=True)
    fecha_nacimiento = Column(Date, nullable=False)
    genero = Column(String(1), nullable=False)  # M/F
    
    # Datos del corte
    tramo = Column(String(10), nullable=True)
    fecha_corte = Column(Date, nullable=False)
    
    # Centro actual
    cod_centro = Column(String(10), nullable=False)
    nombre_centro = Column(String(255), nullable=False)
    
    # Centro procedencia
    codigo_centro_procedencia = Column(String(10), nullable=True)
    nombre_centro_procedencia = Column(String(255), nullable=True)
    codigo_comuna_procedencia = Column(String(10), nullable=True)
    nombre_comuna_procedencia = Column(String(255), nullable=True)
    
    # Centro destino
    codigo_centro_destino = Column(String(10), nullable=True)
    nombre_centro_destino = Column(String(255), nullable=True)
    codigo_comuna_destino = Column(String(10), nullable=True)
    nombre_comuna_destino = Column(String(255), nullable=True)
    
    # Estados (flags booleanos)
    traslado_positivo = Column(Boolean, default=False)
    traslado_negativo = Column(Boolean, default=False)
    nuevo_inscrito = Column(Boolean, default=False)
    exbloqueado = Column(Boolean, default=False)
    rechazado_previsional = Column(Boolean, default=False)
    rechazado_fallecido = Column(Boolean, default=False)
    autorizado = Column(Boolean, default=False)
    aceptado_rechazado = Column(String(50), nullable=True)
    motivo = Column(Text, nullable=True)
    
    # Índices compuestos para búsquedas rápidas
    __table_args__ = (
        {'comment': 'Registros individuales del corte FONASA'}
    )

    @property
    def run_completo(self):
        """Retorna RUN completo con DV"""
        return f"{self.run}-{self.dv}"
    
    @property
    def nombre_completo(self):
        """Retorna nombre completo"""
        if self.apellido_materno:
            return f"{self.nombres} {self.apellido_paterno} {self.apellido_materno}"
        return f"{self.nombres} {self.apellido_paterno}"
    
    def __repr__(self):
        return f"<RegistroFonasa {self.run_completo} - {self.nombre_completo}>"