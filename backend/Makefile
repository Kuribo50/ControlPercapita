.PHONY: help install dev test clean lint format migration migrate init

help:
	@echo "🚀 Sistema Control Percápita - Backend"
	@echo ""
	@echo "Comandos disponibles:"
	@echo "  install     - Instalar dependencias"
	@echo "  dev         - Ejecutar servidor de desarrollo"
	@echo "  test        - Ejecutar tests"
	@echo "  lint        - Verificar código con flake8"
	@echo "  format      - Formatear código con black"
	@echo "  migration   - Crear nueva migración"
	@echo "  migrate     - Aplicar migraciones"
	@echo "  init        - Inicializar base de datos"
	@echo "  clean       - Limpiar archivos temporales"

install:
	@echo "📦 Instalando dependencias..."
	pip install -r requirements.txt

dev:
	@echo "🚀 Ejecutando servidor de desarrollo..."
	python main.py

test:
	@echo "🧪 Ejecutando tests..."
	pytest -v

lint:
	@echo "🔍 Verificando código..."
	flake8 app/ --max-line-length=100

format:
	@echo "🎨 Formateando código..."
	black app/ --line-length=100

migration:
	@echo "📝 Creando migración..."
	@read -p "Mensaje de la migración: " msg; \
	alembic revision --autogenerate -m "$$msg"

migrate:
	@echo "🔄 Aplicando migraciones..."
	alembic upgrade head

init:
	@echo "🎯 Inicializando base de datos..."
	python init_db.py

clean:
	@echo "🧹 Limpiando archivos temporales..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.coverage" -delete
	rm -rf .pytest_cache/