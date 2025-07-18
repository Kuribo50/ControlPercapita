#!/bin/bash
# Script para ejecutar en modo desarrollo

echo "🚀 Iniciando servidor de desarrollo..."

# Verificar variables de entorno
if [ ! -f .env ]; then
    echo "⚠️  Archivo .env no encontrado. Creando desde .env.example..."
    cp .env.example .env
fi

# Instalar dependencias si es necesario
if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual..."
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
alembic upgrade head

# Inicializar datos
echo "🎯 Inicializando datos..."
python init_db.py

# Ejecutar servidor
echo "🌐 Ejecutando servidor en http://localhost:8000"
python main.py