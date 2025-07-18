# Sistema Control Percápita - Backend

API REST desarrollada con FastAPI para el sistema de control de percápita comunal.

## 🚀 Características

- **FastAPI** con documentación automática
- **SQLAlchemy 2.0** con soporte async
- **PostgreSQL** como base de datos principal
- **Redis** para caché y tareas en segundo plano
- **JWT** para autenticación
- **Alembic** para migraciones
- **Procesamiento de archivos** CSV/Excel con Pandas/Polars
- **Sistema de roles** y permisos
- **Validación de RUN** chileno
- **Docker** para contenedorización

## 📋 Requisitos

- Python 3.12+
- PostgreSQL 15+
- Redis 7+

## 🛠️ Instalación

### Desarrollo Local

```bash
# Clonar repositorio
git clone <repo-url>
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones
alembic upgrade head

# Inicializar datos
python init_db.py

# Ejecutar servidor
python main.py