# backend/app/schemas/archivo.py (actualizar)
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import date, datetime

class ArchivoPreview(BaseModel):
    filename: str
    formato: str
    total_registros: int
    columnas_detectadas: List[str]
    fecha_corte_detectada: Optional[str]
    establecimientos_detectados: Optional[Dict[str, Any]]
    casos_detectados: Optional[Dict[str, Any]]
    estadisticas: Optional[Dict[str, Any]]
    preview_data: Optional[List[Dict[str, Any]]]
    is_fonasa_format: bool
    validacion_ok: bool
    duplicado_detectado: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class ArchivoResponse(BaseModel):
    id: str
    filename: str
    formato: str
    fecha_corte: date
    fecha_procesamiento: datetime
    total_registros: int
    nuevos_inscritos: int
    rechazos_previsionales: int
    traslados_negativos: int
    estado_procesamiento: str
    establecimiento: Optional[str]
    codigo_establecimiento: Optional[str]

    class Config:
        from_attributes = True

class UploadResponse(BaseModel):
    success: bool
    archivo_id: str
    filename: str
    fecha_corte: str
    establecimiento: Optional[str]
    total_registros: int
    nuevos_inscritos: int
    rechazos_previsionales: int
    traslados_negativos: int
    casos_detectados: Optional[Dict[str, Any]]
    estadisticas: Optional[Dict[str, Any]]