from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class EvolucionMensual(BaseModel):
    mes: str
    poblacion: int

class DashboardResponse(BaseModel):
    total_usuarios: int
    casos_pendientes: int
    usuarios_nuevos: int
    evolucion: List[EvolucionMensual]
    
    class Config:
        from_attributes = True

class EstadoInicial(BaseModel):
    tiene_corte_activo: bool
    archivos_procesados: int
    usuarios_nuevos: int
    casos_pendientes: int
    ultimo_archivo: Optional[Dict[str, Any]] = None