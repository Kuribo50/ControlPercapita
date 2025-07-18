# backend/routers/percapita.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Body, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import pandas as pd
import io
import os
from datetime import datetime, timedelta
import json
from enum import Enum

router = APIRouter()

# Enums para estados
class EstadoInscripcion(str, Enum):
    MANTIENE_INSCRIPCION = "MANTIENE INSCRIPCIÓN"
    MIGRADOS_FONASA = "MIGRADOS A FONASA"
    NUEVO_INSCRITO = "NUEVO INSCRITO"
    RECHAZADO_FALLECIDO = "RECHAZADO FALLECIDO"
    RECHAZADO_PREVISIONAL = "RECHAZADO PREVISIONAL"
    TRASLADO_NEGATIVO = "TRASLADO NEGATIVO"
    TRASLADO_POSITIVO = "TRASLADO POSITIVO"

class TipoRevision(str, Enum):
    CORREGIR_NUMERO_FAMILIA = "Corregir número de familia"
    SIN_NUMERO_FAMILIA = "No tiene número de familia"
    SIN_DIRECCION = "Sin dirección"
    SIN_RUT = "Sin RUT"
    SIN_NOMBRE = "Sin nombre"
    SIN_APELLIDO_PATERNO = "Sin apellido paterno"
    SIN_FECHA_NACIMIENTO = "Sin fecha de nacimiento"
    SIN_GENERO = "Sin género"
    SIN_CENTRO = "Sin centro asignado"
    CENTRO_INVALIDO = "Centro inválido"
    FECHA_INVALIDA = "Fecha inválida"
    RUN_DUPLICADO = "RUN duplicado"

# Modelos
class UsuarioNuevo(BaseModel):
    fecha: str
    run: str
    nombre: str
    nacionalidad: Optional[str] = ""
    etnia: Optional[str] = ""
    sector: Optional[str] = ""
    subsector: Optional[str] = ""
    cod: str
    validado: str
    establecimiento: Optional[str] = ""
    observacion: Optional[str] = ""

class ValidacionHistorial(BaseModel):
    fecha: str
    estado: EstadoInscripcion
    encontrado: bool
    datos_corte: Optional[Dict] = None

# Base de datos simulada - EMPEZAR VACÍA
archivos_procesados = []
usuarios_nuevos = []
datos_corte_actual = []
historial_validaciones = {}  # {run: [ValidacionHistorial]}

def detectar_campos_faltantes(registro: Dict) -> List[str]:
    """Detecta qué campos específicos faltan en un registro"""
    campos_faltantes = []
    
    # Verificar campos obligatorios
    if not registro.get('RUN') or str(registro.get('RUN')).strip() in ['', 'nan', 'None']:
        campos_faltantes.append(TipoRevision.SIN_RUT.value)
    
    if not registro.get('NOMBRES') or str(registro.get('NOMBRES')).strip() in ['', 'nan', 'None']:
        campos_faltantes.append(TipoRevision.SIN_NOMBRE.value)
    
    if not registro.get('APELLIDO_PATERNO') or str(registro.get('APELLIDO_PATERNO')).strip() in ['', 'nan', 'None']:
        campos_faltantes.append(TipoRevision.SIN_APELLIDO_PATERNO.value)
    
    if not registro.get('FECHA_NACIMIENTO') or str(registro.get('FECHA_NACIMIENTO')).strip() in ['', 'nan', 'None']:
        campos_faltantes.append(TipoRevision.SIN_FECHA_NACIMIENTO.value)
    
    if not registro.get('GENERO') or str(registro.get('GENERO')).strip() in ['', 'nan', 'None']:
        campos_faltantes.append(TipoRevision.SIN_GENERO.value)
    
    if not registro.get('COD_CENTRO') or str(registro.get('COD_CENTRO')).strip() in ['', 'nan', 'None']:
        campos_faltantes.append(TipoRevision.SIN_CENTRO.value)
    
    # Verificar número de familia si existe la columna
    if 'NUMERO_FAMILIA' in registro:
        if not registro.get('NUMERO_FAMILIA') or str(registro.get('NUMERO_FAMILIA')).strip() in ['', 'nan', 'None']:
            campos_faltantes.append(TipoRevision.SIN_NUMERO_FAMILIA.value)
    
    # Verificar dirección si existe la columna
    if 'DIRECCION' in registro:
        if not registro.get('DIRECCION') or str(registro.get('DIRECCION')).strip() in ['', 'nan', 'None']:
            campos_faltantes.append(TipoRevision.SIN_DIRECCION.value)
    
    return campos_faltantes

def clasificar_por_estado_inscripcion(registro: Dict) -> EstadoInscripcion:
    """Clasifica un registro según su estado de inscripción"""
    
    # Verificar cada estado específico
    if str(registro.get('RECHAZADO_FALLECIDO', '')).upper().strip() == 'X':
        return EstadoInscripcion.RECHAZADO_FALLECIDO
    
    if str(registro.get('RECHAZADO_PREVISIONAL', '')).upper().strip() == 'X':
        return EstadoInscripcion.RECHAZADO_PREVISIONAL
    
    if str(registro.get('TRASLADO_NEGATIVO', '')).upper().strip() == 'X':
        return EstadoInscripcion.TRASLADO_NEGATIVO
    
    if str(registro.get('TRASLADO_POSITIVO', '')).upper().strip() == 'X':
        return EstadoInscripcion.TRASLADO_POSITIVO
    
    if str(registro.get('NUEVO_INSCRITO', '')).upper().strip() == 'X':
        return EstadoInscripcion.NUEVO_INSCRITO
    
    # Verificar si migró a FONASA (puedes agregar lógica específica)
    if 'MIGRADO_FONASA' in registro and str(registro.get('MIGRADO_FONASA', '')).upper().strip() == 'X':
        return EstadoInscripcion.MIGRADOS_FONASA
    
    # Por defecto, mantiene inscripción
    return EstadoInscripcion.MANTIENE_INSCRIPCION

def analizar_corte(df: pd.DataFrame) -> Dict:
    """Analiza el corte y clasifica todos los registros"""
    analisis = {
        "total_registros": len(df),
        "por_estado": {},
        "casos_revision": [],
        "estadisticas": {
            "con_datos_completos": 0,
            "con_campos_faltantes": 0,
            "duplicados": 0
        }
    }
    
    # Inicializar contadores por estado
    for estado in EstadoInscripcion:
        analisis["por_estado"][estado.value] = 0
    
    # Detectar duplicados por RUN
    runs_vistos = set()
    runs_duplicados = set()
    
    for _, registro in df.iterrows():
        registro_dict = registro.fillna("").to_dict()
        
        # Verificar duplicados
        run = str(registro_dict.get('RUN', '')).strip()
        if run and run != 'nan':
            if run in runs_vistos:
                runs_duplicados.add(run)
            runs_vistos.add(run)
        
        # Clasificar por estado
        estado = clasificar_por_estado_inscripcion(registro_dict)
        analisis["por_estado"][estado.value] += 1
        
        # Detectar campos faltantes
        campos_faltantes = detectar_campos_faltantes(registro_dict)
        
        if campos_faltantes:
            analisis["estadisticas"]["con_campos_faltantes"] += 1
            
            # Agregar a casos de revisión
            caso_revision = {
                "run": run,
                "nombre": f"{registro_dict.get('NOMBRES', '')} {registro_dict.get('APELLIDO_PATERNO', '')} {registro_dict.get('APELLIDO_MATERNO', '')}".strip(),
                "estado_inscripcion": estado.value,
                "motivos_revision": campos_faltantes,
                "centro_codigo": registro_dict.get('COD_CENTRO', ''),
                "centro_nombre": registro_dict.get('NOMBRE_CENTRO', ''),
                "datos_completos": registro_dict
            }
            analisis["casos_revision"].append(caso_revision)
        else:
            analisis["estadisticas"]["con_datos_completos"] += 1
        
        # Agregar duplicados a revisión
        if run in runs_duplicados:
            caso_duplicado = {
                "run": run,
                "nombre": f"{registro_dict.get('NOMBRES', '')} {registro_dict.get('APELLIDO_PATERNO', '')} {registro_dict.get('APELLIDO_MATERNO', '')}".strip(),
                "estado_inscripcion": estado.value,
                "motivos_revision": [TipoRevision.RUN_DUPLICADO.value],
                "centro_codigo": registro_dict.get('COD_CENTRO', ''),
                "centro_nombre": registro_dict.get('NOMBRE_CENTRO', ''),
                "datos_completos": registro_dict
            }
            if caso_duplicado not in analisis["casos_revision"]:
                analisis["casos_revision"].append(caso_duplicado)
    
    analisis["estadisticas"]["duplicados"] = len(runs_duplicados)
    
    return analisis

def validar_usuario_contra_corte(run: str) -> Dict:
    """Valida un usuario nuevo contra el corte actual y su historial"""
    resultado = {
        "encontrado_en_corte_actual": False,
        "estado_actual": None,
        "fecha_ultimo_corte": None,
        "historial_validaciones": [],
        "cambio_estado": False,
        "estado_anterior": None
    }
    
    run_limpio = run.replace('.', '').replace('-', '').upper()
    
    # Buscar en corte actual
    if datos_corte_actual:
        for registro in datos_corte_actual:
            run_corte = str(registro.get('RUN', '')).replace('.', '').replace('-', '').upper()
            if run_corte == run_limpio:
                resultado["encontrado_en_corte_actual"] = True
                resultado["estado_actual"] = clasificar_por_estado_inscripcion(registro).value
                resultado["fecha_ultimo_corte"] = datetime.now().strftime('%Y-%m-%d')
                break
    
    # Verificar historial
    if run_limpio in historial_validaciones:
        resultado["historial_validaciones"] = historial_validaciones[run_limpio]
        
        # Verificar si cambió el estado
        if resultado["historial_validaciones"]:
            ultimo_estado = resultado["historial_validaciones"][-1]["estado"]
            if resultado["estado_actual"] and ultimo_estado != resultado["estado_actual"]:
                resultado["cambio_estado"] = True
                resultado["estado_anterior"] = ultimo_estado
    
    return resultado

def actualizar_historial_validacion(run: str, estado: str, encontrado: bool, datos_corte: Dict = None):
    """Actualiza el historial de validaciones de un usuario"""
    run_limpio = run.replace('.', '').replace('-', '').upper()
    
    if run_limpio not in historial_validaciones:
        historial_validaciones[run_limpio] = []
    
    nueva_validacion = {
        "fecha": datetime.now().isoformat(),
        "estado": estado,
        "encontrado": encontrado,
        "datos_corte": datos_corte
    }
    
    historial_validaciones[run_limpio].append(nueva_validacion)

@router.get("/estado-inicial")
async def obtener_estado_inicial():
    """Obtener estado inicial del sistema (todo vacío)"""
    return {
        "archivos_procesados": 0,
        "usuarios_nuevos": 0,
        "datos_corte_actual": 0,
        "tiene_corte_activo": False,
        "mensaje": "Sistema iniciado. Cargue un archivo de corte para comenzar."
    }

@router.post("/preview-csv")
async def preview_archivo(file: UploadFile = File(...)):
    """Vista previa del archivo con análisis completo"""
    try:
        # Validar extensión
        filename = file.filename.lower()
        if not any(filename.endswith(ext) for ext in ['.csv', '.txt', '.xls', '.xlsx']):
            raise HTTPException(status_code=400, detail="Formato no soportado")
        
        # Leer archivo
        contents = await file.read()
        
        if filename.endswith('.csv') or filename.endswith('.txt'):
            # Probar diferentes separadores y encodings
            for encoding in ['utf-8', 'latin-1', 'cp1252']:
                for sep in [',', ';', '\t', '|']:
                    try:
                        df = pd.read_csv(io.StringIO(contents.decode(encoding)), sep=sep)
                        if len(df.columns) >= 10:  # Mínimo esperado
                            break
                    except:
                        continue
                if 'df' in locals() and len(df.columns) >= 10:
                    break
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        if 'df' not in locals() or len(df.columns) < 10:
            raise HTTPException(status_code=400, detail="No se pudo procesar el archivo correctamente")
        
        # Verificar estructura obligatoria
        required_columns = ["RUN", "DV", "NOMBRES", "APELLIDO_PATERNO", "FECHA_CORTE"]
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Faltan columnas obligatorias: {missing_columns}. Columnas encontradas: {list(df.columns[:10])}"
            )
        
        # Extraer fecha de corte
        fecha_corte = None
        if 'FECHA_CORTE' in df.columns:
            fechas = df['FECHA_CORTE'].dropna()
            if len(fechas) > 0:
                try:
                    fecha_corte = pd.to_datetime(fechas.iloc[0]).strftime('%Y-%m-%d')
                except:
                    fecha_corte = str(fechas.iloc[0])[:10]
        
        # Análisis completo
        analisis = analizar_corte(df)
        
        return {
            "success": True,
            "filename": file.filename,
            "fecha_corte_detectada": fecha_corte,
            "total_registros": len(df),
            "columnas_detectadas": len(df.columns),
            "analisis": analisis,
            "columnas_disponibles": list(df.columns)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analizando archivo: {str(e)}")

@router.post("/upload-csv")
async def subir_archivo(
    file: UploadFile = File(...),
    fecha_corte: Optional[str] = Form(None),
    sustituir_archivo_id: Optional[int] = Form(None)
):
    """Procesar y cargar archivo de corte"""
    global datos_corte_actual, archivos_procesados
    
    try:
        # Procesar archivo (similar a preview pero guardando datos)
        contents = await file.read()
        filename = file.filename.lower()
        
        if filename.endswith('.csv') or filename.endswith('.txt'):
            for encoding in ['utf-8', 'latin-1', 'cp1252']:
                for sep in [',', ';', '\t', '|']:
                    try:
                        df = pd.read_csv(io.StringIO(contents.decode(encoding)), sep=sep)
                        if len(df.columns) >= 10:
                            break
                    except:
                        continue
                if len(df.columns) >= 10:
                    break
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        # Análisis completo
        analisis = analizar_corte(df)
        
        # Guardar datos del corte
        datos_corte_actual = df.fillna("").to_dict('records')
        
        # Extraer fecha de corte
        fecha_corte_final = fecha_corte
        if not fecha_corte_final and 'FECHA_CORTE' in df.columns:
            fechas = df['FECHA_CORTE'].dropna()
            if len(fechas) > 0:
                try:
                    fecha_corte_final = pd.to_datetime(fechas.iloc[0]).strftime('%Y-%m-%d')
                except:
                    fecha_corte_final = str(fechas.iloc[0])[:10]
        
        if not fecha_corte_final:
            fecha_corte_final = datetime.now().strftime('%Y-%m-%d')
        
        # Manejar sustitución
        if sustituir_archivo_id:
            archivos_procesados = [a for a in archivos_procesados if a["id"] != sustituir_archivo_id]
        
        # Guardar archivo procesado
        nuevo_archivo = {
            "id": max([a["id"] for a in archivos_procesados], default=0) + 1,
            "filename": file.filename,
            "fecha_corte": fecha_corte_final,
            "fecha_procesamiento": datetime.now().isoformat(),
            "formato": "Excel" if filename.endswith(('.xls', '.xlsx')) else "CSV",
            "analisis": analisis,
            "estado": "activo"
        }
        archivos_procesados.append(nuevo_archivo)
        
        # Revalidar usuarios nuevos existentes
        usuarios_revalidados = 0
        for usuario in usuarios_nuevos:
            validacion = validar_usuario_contra_corte(usuario['run'])
            
            # Actualizar historial
            if validacion["encontrado_en_corte_actual"]:
                actualizar_historial_validacion(
                    usuario['run'], 
                    validacion["estado_actual"], 
                    True,
                    next((r for r in datos_corte_actual if str(r.get('RUN', '')).replace('.', '').replace('-', '').upper() == usuario['run'].replace('.', '').replace('-', '').upper()), None)
                )
            
            usuario['ultima_validacion'] = validacion
            usuario['fecha_ultima_validacion'] = datetime.now().isoformat()
            usuarios_revalidados += 1
        
        return {
            "success": True,
            "filename": file.filename,
            "fecha_corte": fecha_corte_final,
            "sustituido": bool(sustituir_archivo_id),
            "analisis": analisis,
            "usuarios_revalidados": usuarios_revalidados
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando archivo: {str(e)}")

@router.get("/archivos-procesados")
async def obtener_archivos_procesados():
    """Obtener archivos procesados"""
    activos = [a for a in archivos_procesados if a.get("estado") == "activo"]
    return {"archivos": activos}

@router.delete("/archivos-procesados/{archivo_id}")
async def eliminar_archivo(archivo_id: int):
    """Eliminar archivo procesado"""
    global datos_corte_actual
    
    archivo = next((a for a in archivos_procesados if a["id"] == archivo_id), None)
    if not archivo:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    archivo["estado"] = "eliminado"
    
    # Si no quedan archivos activos, limpiar corte
    activos = [a for a in archivos_procesados if a.get("estado") == "activo"]
    if not activos:
        datos_corte_actual = []
    
    return {"success": True, "message": "Archivo eliminado"}

@router.post("/usuarios-nuevos")
async def crear_usuario_nuevo(usuario_data: Dict[str, Any] = Body(...)):
    """Crear usuario nuevo"""
    try:
        # Validar campos requeridos
        required = ['fecha', 'run', 'nombre', 'cod', 'validado']
        missing = [f for f in required if not usuario_data.get(f)]
        
        if missing:
            raise HTTPException(status_code=400, detail=f"Faltan campos: {missing}")
        
        # Verificar duplicados
        run_limpio = usuario_data['run'].replace('.', '').replace('-', '').upper()
        if any(u['run'].replace('.', '').replace('-', '').upper() == run_limpio for u in usuarios_nuevos):
            raise HTTPException(status_code=400, detail="Ya existe un usuario con este RUN")
        
        # Validar contra corte actual
        validacion = validar_usuario_contra_corte(usuario_data['run'])
        
        # Crear usuario
        nuevo_usuario = {
            **usuario_data,
            'id': len(usuarios_nuevos) + 1,
            'fecha_creacion': datetime.now().isoformat(),
            'ultima_validacion': validacion,
            'fecha_ultima_validacion': datetime.now().isoformat()
        }
        
        # Actualizar historial si se encontró en corte
        if validacion["encontrado_en_corte_actual"]:
            actualizar_historial_validacion(
                usuario_data['run'],
                validacion["estado_actual"],
                True
            )
        
        usuarios_nuevos.append(nuevo_usuario)
        
        return {
            "success": True,
            "usuario_id": nuevo_usuario['id'],
            "validacion": validacion
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/usuarios-nuevos")
async def obtener_usuarios_nuevos():
    """Obtener usuarios nuevos"""
    return {
        "usuarios": usuarios_nuevos,
        "total": len(usuarios_nuevos),
        "estadisticas": {
            "validados": len([u for u in usuarios_nuevos if u.get('ultima_validacion', {}).get('encontrado_en_corte_actual', False)]),
            "no_validados": len([u for u in usuarios_nuevos if not u.get('ultima_validacion', {}).get('encontrado_en_corte_actual', False)]),
            "con_cambio_estado": len([u for u in usuarios_nuevos if u.get('ultima_validacion', {}).get('cambio_estado', False)])
        }
    }

@router.delete("/usuarios-nuevos/{usuario_id}")
async def eliminar_usuario_nuevo(usuario_id: int):
    """Eliminar usuario nuevo"""
    global usuarios_nuevos
    usuarios_nuevos = [u for u in usuarios_nuevos if u.get('id') != usuario_id]
    return {"success": True}

@router.get("/casos-revision")
async def obtener_casos_revision(
    estado: Optional[str] = Query(None),
    motivo: Optional[str] = Query(None),
    limit: Optional[int] = Query(100)
):
    """Obtener casos que requieren revisión"""
    if not datos_corte_actual:
        return {"casos": [], "total": 0}
    
    # Obtener análisis del último archivo
    ultimo_archivo = archivos_procesados[-1] if archivos_procesados else None
    if not ultimo_archivo:
        return {"casos": [], "total": 0}
    
    casos = ultimo_archivo.get("analisis", {}).get("casos_revision", [])
    
    # Filtrar por estado si se especifica
    if estado:
        casos = [c for c in casos if c.get("estado_inscripcion") == estado]
    
    # Filtrar por motivo si se especifica
    if motivo:
        casos = [c for c in casos if motivo in c.get("motivos_revision", [])]
    
    # Limitar resultados
    if limit:
        casos = casos[:limit]
    
    return {
        "casos": casos,
        "total": len(casos),
        "filtros_aplicados": {"estado": estado, "motivo": motivo}
    }

@router.get("/dashboard")
async def obtener_dashboard():
    """Dashboard principal"""
    try:
        # Si no hay datos, devolver valores en 0
        if not archivos_procesados and not usuarios_nuevos and not datos_corte_actual:
            return {
                "total_usuarios": 0,
                "casos_pendientes": 0,
                "evolucion": [],
                "estado": "vacio"
            }
        
        total_usuarios = len(datos_corte_actual) if datos_corte_actual else 0
        
        # Casos que requieren revisión
        casos_revision = 0
        if archivos_procesados:
            ultimo_archivo = archivos_procesados[-1]
            casos_revision = len(ultimo_archivo.get("analisis", {}).get("casos_revision", []))
        
        return {
            "total_usuarios": total_usuarios,
            "casos_pendientes": casos_revision,
            "evolucion": [
                {"mes": "Actual", "poblacion": total_usuarios}
            ],
            "estado": "activo" if datos_corte_actual else "sin_corte"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/exportar/{tipo}")
async def exportar_datos(
    tipo: str,
    formato: str = Query("csv", regex="^(csv|excel|json)$")
):
    """Exportar datos en diferentes formatos"""
    try:
        if tipo == "corte-completo":
            data = datos_corte_actual
            filename = f"corte_completo_{datetime.now().strftime('%Y%m%d')}"
            
        elif tipo == "casos-revision":
            if not archivos_procesados:
                raise HTTPException(status_code=404, detail="No hay datos para exportar")
            data = archivos_procesados[-1].get("analisis", {}).get("casos_revision", [])
            filename = f"casos_revision_{datetime.now().strftime('%Y%m%d')}"
            
        elif tipo == "usuarios-nuevos":
            data = usuarios_nuevos
            filename = f"usuarios_nuevos_{datetime.now().strftime('%Y%m%d')}"
            
        elif tipo == "estadisticas":
            ultimo_archivo = archivos_procesados[-1] if archivos_procesados else None
            data = {
                "resumen": {
                    "total_registros_corte": len(datos_corte_actual),
                    "total_usuarios_nuevos": len(usuarios_nuevos),
                    "casos_revision": len(ultimo_archivo.get("analisis", {}).get("casos_revision", [])) if ultimo_archivo else 0
                },
                "por_estado": ultimo_archivo.get("analisis", {}).get("por_estado", {}) if ultimo_archivo else {},
                "estadisticas": ultimo_archivo.get("analisis", {}).get("estadisticas", {}) if ultimo_archivo else {}
            }
            filename = f"estadisticas_{datetime.now().strftime('%Y%m%d')}"
            
        else:
            raise HTTPException(status_code=400, detail="Tipo de exportación no válido")
        
        if not data:
            raise HTTPException(status_code=404, detail="No hay datos para exportar")
        
        return {
            "success": True,
            "data": data,
            "filename": f"{filename}.{formato}",
            "total_registros": len(data) if isinstance(data, list) else 1,
            "formato": formato
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/revalidar-usuarios")
async def revalidar_todos_usuarios():
    """Revalidar todos los usuarios nuevos"""
    if not datos_corte_actual:
        raise HTTPException(status_code=400, detail="No hay corte para validar")
    
    revalidados = 0
    for usuario in usuarios_nuevos:
        validacion = validar_usuario_contra_corte(usuario['run'])
        usuario['ultima_validacion'] = validacion
        usuario['fecha_ultima_validacion'] = datetime.now().isoformat()
        revalidados += 1
    
    return {
        "success": True,
        "usuarios_revalidados": revalidados
    }

@router.get("/test")
async def test():
    """Test endpoint"""
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "datos": {
            "archivos": len(archivos_procesados),
            "usuarios": len(usuarios_nuevos),
            "corte": len(datos_corte_actual)
        }
    }