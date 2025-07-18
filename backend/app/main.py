from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear aplicación
app = FastAPI(
    title="Sistema Control Percápita",
    version="1.0.0",
    description="API para gestión de percápita comunal",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS simple
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En desarrollo permitir todo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoints básicos
@app.get("/")
async def root():
    return {
        "message": "Sistema Control Percápita API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check básico"""
    return {
        "status": "ok",
        "message": "API funcionando correctamente",
        "environment": "development"
    }

# API de percápita
@app.get("/api/v1/percapita/dashboard")
async def get_dashboard():
    """Dashboard con datos simulados"""
    return {
        "total_usuarios": 15789,
        "casos_pendientes": 23,
        "evolucion": [
            {"mes": "Feb", "poblacion": 15420},
            {"mes": "Mar", "poblacion": 15638}, 
            {"mes": "Abr", "poblacion": 15789}
        ]
    }

@app.post("/api/v1/percapita/preview-csv")
async def preview_csv():
    """Preview de archivo CSV simulado"""
    return {
        "filename": "archivo_fonasa.csv",
        "file_format": "CSV",
        "total_registros": 1500,
        "columnas_detectadas": 29,
        "fecha_corte_detectada": "2025-04-30",
        "casos_detectados": {
            "nuevos_inscritos": 45,
            "rechazos_previsionales": 12,
            "traslados_negativos": 8,
            "sin_centro": 3
        },
        "is_fonasa_format": True
    }

@app.get("/api/v1/percapita/usuarios-nuevos")
async def get_usuarios_nuevos():
    """Lista de usuarios nuevos simulada"""
    return {
        "usuarios": [
            {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "fecha": "2025-07-17",
                "run": "12345678-9",
                "nombre": "Juan Pérez González",
                "nacionalidad": "Chile",
                "sector": "A1 - OTROS C. MANHS",
                "cod_percapita": "12345",
                "validado_en_siis": "SI",
                "created_at": "2025-07-17T10:00:00"
            },
            {
                "id": "550e8400-e29b-41d4-a716-446655440001",
                "fecha": "2025-07-16",
                "run": "98765432-1",
                "nombre": "María González Silva",
                "nacionalidad": "Chile", 
                "sector": "R5 - LOS LAGOS",
                "cod_percapita": "67890",
                "validado_en_siis": "NO",
                "created_at": "2025-07-16T14:30:00"
            }
        ]
    }

@app.get("/api/v1/percapita/archivos-procesados")
async def get_archivos_procesados():
    """Lista de archivos procesados simulada"""
    return {
        "archivos": [
            {
                "id": "archivo-001",
                "filename": "corte_abril_2025.csv",
                "formato": "CSV",
                "fecha_corte": "2025-04-30",
                "total_registros": 15789,
                "nuevos_inscritos": 450,
                "rechazos_previsionales": 67,
                "traslados_negativos": 23,
                "created_at": "2025-05-01T09:00:00"
            }
        ]
    }

@app.post("/api/v1/percapita/usuarios-nuevos")
async def create_usuario_nuevo():
    """Crear usuario nuevo simulado"""
    return {
        "message": "Usuario creado exitosamente",
        "id": "nuevo-usuario-123",
        "success": True
    }

@app.get("/api/v1/test")
async def test_api():
    """Endpoint de prueba completo"""
    return {
        "message": "API funcionando correctamente ✅",
        "timestamp": "2025-07-17T21:53:37",
        "server": "FastAPI",
        "available_endpoints": [
            "GET /",
            "GET /health",
            "GET /docs",
            "GET /api/v1/percapita/dashboard",
            "GET /api/v1/percapita/usuarios-nuevos",
            "GET /api/v1/percapita/archivos-procesados",
            "POST /api/v1/percapita/preview-csv",
            "POST /api/v1/percapita/usuarios-nuevos",
            "GET /api/v1/test"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)