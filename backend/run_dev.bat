@echo off
echo 🚀 Iniciando API Sistema Percápita...
echo.

call venv\Scripts\activate

echo 🌐 Servidor: http://127.0.0.1:8000
echo 📚 Docs: http://127.0.0.1:8000/docs
echo 🧪 Test: http://127.0.0.1:8000/api/v1/test
echo.

uvicorn app.main:app --reload