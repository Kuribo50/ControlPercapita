import re
from typing import Tuple

def clean_run(run: str) -> str:
    """Limpia el RUN removiendo puntos y guiones"""
    return re.sub(r'[.-]', '', run.strip().upper())

def validate_run(run: str) -> Tuple[bool, str]:
    """Valida RUN chileno"""
    if not run:
        return False, "RUN es requerido"
    
    # Limpiar RUN
    clean = clean_run(run)
    
    if len(clean) < 8 or len(clean) > 9:
        return False, "RUN debe tener entre 8 y 9 caracteres"
    
    # Separar número y dígito verificador
    number = clean[:-1]
    dv = clean[-1]
    
    # Validar que el número sea numérico
    if not number.isdigit():
        return False, "Número de RUN debe ser numérico"
    
    # Calcular dígito verificador
    calculated_dv = calculate_dv(number)
    
    if dv != calculated_dv:
        return False, f"Dígito verificador incorrecto. Debería ser {calculated_dv}"
    
    return True, "RUN válido"

def calculate_dv(number: str) -> str:
    """Calcula el dígito verificador"""
    multipliers = [2, 3, 4, 5, 6, 7]
    total = 0
    
    for i, digit in enumerate(reversed(number)):
        multiplier = multipliers[i % 6]
        total += int(digit) * multiplier
    
    remainder = total % 11
    
    if remainder == 0:
        return '0'
    elif remainder == 1:
        return 'K'
    else:
        return str(11 - remainder)

def format_run(run: str) -> str:
    """Formatea RUN con puntos y guión"""
    clean = clean_run(run)
    if len(clean) < 8:
        return clean
    
    number = clean[:-1]
    dv = clean[-1]
    
    # Agregar puntos cada 3 dígitos
    formatted_number = ""
    for i, digit in enumerate(reversed(number)):
        if i > 0 and i % 3 == 0:
            formatted_number = "." + formatted_number
        formatted_number = digit + formatted_number
    
    return f"{formatted_number}-{dv}"