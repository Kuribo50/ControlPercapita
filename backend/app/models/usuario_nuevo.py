from sqlalchemy import Column, String, Date, Text, JSON, Index
from .base import BaseModel

class UsuarioNuevo(BaseModel):
    __tablename__ = "usuarios_nuevos"
    
    # Información básica
    fecha = Column(Date, nullable=False)
    run = Column(String(12), nullable=False)  # Formato: 12345678-9
    nombre_usuario = Column(String(255), nullable=False)
    
    # Información demográfica
    nacionalidad = Column(String(100), nullable=True)
    etnia = Column(String(100), nullable=True)
    
    # Información territorial
    sector = Column(String(100), nullable=True)
    subsector = Column(String(100), nullable=True)
    
    # Información administrativa
    cod_percapita = Column(String(50), nullable=False)
    validado_en_siis = Column(String(3), nullable=False)  # SI/NO
    establecimiento = Column(String(255), nullable=True)
    observacion = Column(Text, nullable=True)
    
    # Estado de validación contra corte FONASA
    estado_validacion = Column(JSON, nullable=True)
    
    # Índices para búsquedas rápidas
    __table_args__ = (
        Index('idx_usuario_run', 'run'),
        Index('idx_usuario_fecha', 'fecha'),
        Index('idx_usuario_validado', 'validado_en_siis'),
        {'comment': 'Usuarios nuevos registrados manualmente'}
    )
    
    @property
    def run_sin_dv(self):
        """Extrae solo el número del RUN sin DV"""
        return self.run.split('-')[0] if '-' in self.run else self.run.replace('.', '')
    
    def __repr__(self):
        return f"<UsuarioNuevo {self.run} - {self.nombre_usuario}>"