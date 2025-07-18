FROM python:3.12-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primero para cache de Docker
COPY requirements.txt .

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Crear directorio de uploads
RUN mkdir -p uploads

# Exponer puerto
EXPOSE 8000

# Comando por defecto
CMD ["python", "main.py"]