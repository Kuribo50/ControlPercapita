from typing import Any, Dict, List
from datetime import datetime, date
import json

def serialize_datetime(obj: Any) -> Any:
    """Serializa objetos datetime a string"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

def safe_json_loads(json_str: str, default: Any = None) -> Any:
    """Carga JSON de forma segura"""
    try:
        return json.loads(json_str)
    except (json.JSONDecodeError, TypeError):
        return default

def format_file_size(size_bytes: int) -> str:
    """Formatea tamaño de archivo"""
    if size_bytes == 0:
        return "0B"
    
    size_names = ["B", "KB", "MB", "GB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f}{size_names[i]}"

def extract_run_number(run: str) -> str:
    """Extrae solo el número del RUN sin DV"""
    import re
    clean = re.sub(r'[.-]', '', run.strip())
    return clean[:-1] if len(clean) > 1 else clean

def paginate_results(
    items: List[Any], 
    page: int = 1, 
    size: int = 50
) -> Dict[str, Any]:
    """Pagina resultados"""
    total = len(items)
    start = (page - 1) * size
    end = start + size
    
    return {
        "items": items[start:end],
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size
    }