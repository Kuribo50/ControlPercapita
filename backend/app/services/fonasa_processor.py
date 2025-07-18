# backend/app/services/fonasa_processor.py
import pandas as pd
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, date
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from ..models.registro_fonasa import RegistroFonasa
from ..models.archivo import Archivo

logger = logging.getLogger(__name__)

class FonasaProcessor:
    
    # Establecimientos conocidos en la comuna
    ESTABLECIMIENTOS_CONOCIDOS = {
        'CESAFAM DR. ALBERTO REYES': ['102010', '10201', 'CESFAM', 'CESAFAM'],
        'POSTA RURAL DICHATO': ['102011', '10201-1', 'DICHATO'],
        'POSTA RURAL PINGUERAL': ['102012', '10201-2', 'PINGUERAL'],
        'CONSULTORIO TOME': ['102013', '10201-3', 'TOME'],
    }
    
    EXPECTED_COLUMNS = [
        "RUN", "DV", "NOMBRES", "APELLIDO_PATERNO", "APELLIDO_MATERNO",
        "FECHA_NACIMIENTO", "GENERO", "TRAMO", "FECHA_CORTE", "COD_CENTRO",
        "NOMBRE_CENTRO", "CODIGO_CENTRO_PROCEDENCIA", "NOMBRE_CENTRO_PROCEDENCIA",
        "CODIGO_COMUNA_PROCEDENCIA", "NOMBRE_COMUNA_PROCEDENCIA",
        "CODIGO_CENTRO_DESTINO", "NOMBRE_CENTRO_DESTINO",
        "CODIGO_COMUNA_DESTINO", "NOMBRE_COMUNA_DESTINO",
        "TRASLADO_POSITIVO", "TRASLADO_NEGATIVO", "NUEVO_INSCRITO",
        "EXBLOQUEADO", "RECHAZADO_PREVISIONAL", "RECHAZADO_FALLECIDO",
        "AUTORIZADO", "ACEPTADO_RECHAZADO", "MOTIVO"
    ]
    
    @staticmethod
    def validate_fonasa_format(file_path: str) -> Tuple[bool, str]:
        """Valida que el archivo tenga el formato correcto de FONASA"""
        try:
            # Leer solo las primeras filas para verificar
            if Path(file_path).suffix.lower() in ['.csv', '.txt']:
                df = pd.read_csv(file_path, nrows=5, encoding='utf-8')
            else:
                df = pd.read_excel(file_path, nrows=5)
            
            # Limpiar nombres de columnas
            df.columns = [col.strip().upper() for col in df.columns]
            
            # Verificar columnas esenciales
            columnas_esenciales = ['RUN', 'NOMBRES', 'FECHA_CORTE', 'COD_CENTRO']
            columnas_faltantes = [col for col in columnas_esenciales if col not in df.columns]
            
            if columnas_faltantes:
                return False, f"Faltan columnas esenciales: {', '.join(columnas_faltantes)}"
            
            # Verificar que hay datos
            if len(df) == 0:
                return False, "El archivo está vacío"
            
            return True, "Formato válido"
            
        except Exception as e:
            return False, f"Error validando formato: {str(e)}"
    
    @staticmethod
    def preview_fonasa_file(file_path: str) -> Dict[str, Any]:
        """Analiza archivo FONASA y retorna información completa de preview"""
        try:
            # Validar formato
            is_valid, message = FonasaProcessor.validate_fonasa_format(file_path)
            if not is_valid:
                raise ValueError(message)
            
            # Leer archivo completo para análisis
            if Path(file_path).suffix.lower() in ['.csv', '.txt']:
                df = pd.read_csv(file_path, encoding='utf-8')
            else:
                df = pd.read_excel(file_path)
            
            # Limpiar nombres de columnas
            df.columns = [col.strip().upper() for col in df.columns]
            
            # Información básica
            total_registros = len(df)
            columnas_detectadas = list(df.columns)
            
            # Detectar fecha de corte
            fecha_corte_detectada = FonasaProcessor._detect_fecha_corte(df)
            
            # Detectar establecimientos
            establecimientos_detectados = FonasaProcessor._detect_establecimientos(df)
            
            # Detectar casos problemáticos
            casos_detectados = FonasaProcessor._detect_casos_problematicos(df)
            
            # Estadísticas del archivo
            estadisticas = FonasaProcessor._calcular_estadisticas(df)
            
            # Preview de datos
            preview_data = df.head(5).fillna('').to_dict('records')
            
            return {
                'filename': Path(file_path).name,
                'formato': FonasaProcessor._detect_file_format(file_path),
                'total_registros': total_registros,
                'columnas_detectadas': columnas_detectadas,
                'fecha_corte_detectada': fecha_corte_detectada,
                'establecimientos_detectados': establecimientos_detectados,
                'casos_detectados': casos_detectados,
                'estadisticas': estadisticas,
                'preview_data': preview_data,
                'is_fonasa_format': True,
                'validacion_ok': True
            }
            
        except Exception as e:
            logger.error(f"Error procesando archivo FONASA {file_path}: {str(e)}")
            return {
                'filename': Path(file_path).name,
                'error': str(e),
                'is_fonasa_format': False,
                'validacion_ok': False
            }
    
    @staticmethod
    def _detect_fecha_corte(df: pd.DataFrame) -> Optional[str]:
        """Detecta la fecha de corte del archivo"""
        try:
            if 'FECHA_CORTE' in df.columns:
                # Tomar la fecha más común
                fechas = pd.to_datetime(df['FECHA_CORTE'].dropna(), errors='coerce')
                fecha_mas_comun = fechas.mode()
                
                if not fecha_mas_comun.empty:
                    return fecha_mas_comun.iloc[0].strftime('%Y-%m-%d')
            
            # Intentar detectar desde el nombre del archivo
            filename_lower = Path(df.attrs.get('filename', '')).stem.lower()
            
            # Buscar patrones de fecha en el nombre
            import re
            patterns = [
                r'(\d{4})[-_](\d{1,2})[-_](\d{1,2})',  # YYYY-MM-DD o YYYY_MM_DD
                r'(\d{1,2})[-_](\d{4})',              # MM-YYYY o MM_YYYY
                r'(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)[-_](\d{4})'
            ]
            
            for pattern in patterns:
                match = re.search(pattern, filename_lower)
                if match:
                    # Procesar según el patrón encontrado
                    if len(match.groups()) == 3:
                        year, month, day = match.groups()
                        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
            
            return None
            
        except Exception as e:
            logger.warning(f"Error detectando fecha de corte: {str(e)}")
            return None
    
    @staticmethod
    def _detect_establecimientos(df: pd.DataFrame) -> Dict[str, Any]:
        """Detecta los establecimientos presentes en el archivo"""
        establecimientos_info = {
            'total_establecimientos': 0,
            'establecimientos': [],
            'establecimiento_principal': None,
            'cobertura_por_establecimiento': {}
        }
        
        try:
            if 'COD_CENTRO' in df.columns and 'NOMBRE_CENTRO' in df.columns:
                # Agrupar por establecimiento
                centros = df.groupby(['COD_CENTRO', 'NOMBRE_CENTRO']).size().reset_index(name='cantidad')
                centros = centros.sort_values('cantidad', ascending=False)
                
                establecimientos_info['total_establecimientos'] = len(centros)
                
                for _, row in centros.iterrows():
                    cod_centro = str(row['COD_CENTRO']).strip()
                    nombre_centro = str(row['NOMBRE_CENTRO']).strip()
                    cantidad = int(row['cantidad'])
                    porcentaje = (cantidad / len(df)) * 100
                    
                    # Identificar el establecimiento conocido
                    establecimiento_identificado = None
                    for est_nombre, codigos in FonasaProcessor.ESTABLECIMIENTOS_CONOCIDOS.items():
                        if any(codigo in cod_centro for codigo in codigos) or \
                           any(alias.upper() in nombre_centro.upper() for alias in codigos):
                            establecimiento_identificado = est_nombre
                            break
                    
                    est_info = {
                        'codigo': cod_centro,
                        'nombre': nombre_centro,
                        'nombre_identificado': establecimiento_identificado,
                        'cantidad_registros': cantidad,
                        'porcentaje': round(porcentaje, 2)
                    }
                    
                    establecimientos_info['establecimientos'].append(est_info)
                
                # Establecimiento principal (mayor cantidad de registros)
                if not centros.empty:
                    principal = centros.iloc[0]
                    cod_principal = str(principal['COD_CENTRO']).strip()
                    nombre_principal = str(principal['NOMBRE_CENTRO']).strip()
                    
                    # Identificar establecimiento principal
                    establecimiento_principal_identificado = None
                    for est_nombre, codigos in FonasaProcessor.ESTABLECIMIENTOS_CONOCIDOS.items():
                        if any(codigo in cod_principal for codigo in codigos) or \
                           any(alias.upper() in nombre_principal.upper() for alias in codigos):
                            establecimiento_principal_identificado = est_nombre
                            break
                    
                    establecimientos_info['establecimiento_principal'] = {
                        'codigo': cod_principal,
                        'nombre': nombre_principal,
                        'nombre_identificado': establecimiento_principal_identificado or nombre_principal,
                        'cantidad_registros': int(principal['cantidad']),
                        'porcentaje': round((int(principal['cantidad']) / len(df)) * 100, 2)
                    }
                        
        except Exception as e:
            logger.warning(f"Error detectando establecimientos: {str(e)}")
        
        return establecimientos_info
    
    @staticmethod
    def _detect_casos_problematicos(df: pd.DataFrame) -> Dict[str, Any]:
        """Detecta casos que requieren revisión"""
        casos = {
            'total_casos_detectados': 0,
            'tipos_casos': {},
            'casos_criticos': [],
            'resumen': {}
        }
        
        try:
            total_registros = len(df)
            
            # 1. RUNs duplicados
            if 'RUN' in df.columns:
                runs_duplicados = df['RUN'].duplicated().sum()
                if runs_duplicados > 0:
                    casos['tipos_casos']['runs_duplicados'] = {
                        'cantidad': int(runs_duplicados),
                        'descripcion': 'RUNs duplicados encontrados',
                        'porcentaje': round((runs_duplicados / total_registros) * 100, 2)
                    }
            
            # 2. Registros con datos faltantes críticos
            columnas_criticas = ['RUN', 'NOMBRES', 'FECHA_NACIMIENTO']
            registros_incompletos = 0
            for col in columnas_criticas:
                if col in df.columns:
                    registros_incompletos += df[col].isna().sum()
            
            if registros_incompletos > 0:
                casos['tipos_casos']['datos_faltantes'] = {
                    'cantidad': int(registros_incompletos),
                    'descripcion': 'Registros con datos críticos faltantes',
                    'porcentaje': round((registros_incompletos / total_registros) * 100, 2)
                }
            
            # 3. Traslados negativos
            if 'TRASLADO_NEGATIVO' in df.columns:
                traslados_negativos = df['TRASLADO_NEGATIVO'].fillna(False).sum()
                if traslados_negativos > 0:
                    casos['tipos_casos']['traslados_negativos'] = {
                        'cantidad': int(traslados_negativos),
                        'descripcion': 'Traslados negativos detectados',
                        'porcentaje': round((traslados_negativos / total_registros) * 100, 2)
                    }
            
            # 4. Rechazos previsionales
            if 'RECHAZADO_PREVISIONAL' in df.columns:
                rechazos = df['RECHAZADO_PREVISIONAL'].fillna(False).sum()
                if rechazos > 0:
                    casos['tipos_casos']['rechazos_previsionales'] = {
                        'cantidad': int(rechazos),
                        'descripcion': 'Rechazos previsionales detectados',
                        'porcentaje': round((rechazos / total_registros) * 100, 2)
                    }
            
            # 5. Nuevos inscritos
            if 'NUEVO_INSCRITO' in df.columns:
                nuevos_inscritos = df['NUEVO_INSCRITO'].fillna(False).sum()
                if nuevos_inscritos > 0:
                    casos['tipos_casos']['nuevos_inscritos'] = {
                        'cantidad': int(nuevos_inscritos),
                        'descripcion': 'Nuevos inscritos detectados',
                        'porcentaje': round((nuevos_inscritos / total_registros) * 100, 2),
                        'es_positivo': True
                    }
            
            casos['total_casos_detectados'] = len(casos['tipos_casos'])
            
            # Resumen
            casos['resumen'] = {
                'total_registros': total_registros,
                'registros_con_problemas': sum([
                    caso['cantidad'] for caso in casos['tipos_casos'].values() 
                    if not caso.get('es_positivo', False)
                ]),
                'porcentaje_problemas': round((sum([
                    caso['cantidad'] for caso in casos['tipos_casos'].values() 
                    if not caso.get('es_positivo', False)
                ]) / total_registros) * 100, 2) if total_registros > 0 else 0
            }
                        
        except Exception as e:
            logger.warning(f"Error detectando casos problemáticos: {str(e)}")
        
        return casos
    
    @staticmethod
    def _calcular_estadisticas(df: pd.DataFrame) -> Dict[str, Any]:
        """Calcula estadísticas generales del archivo"""
        stats = {
            'total_registros': len(df),
            'distribucion_genero': {},
            'distribucion_tramos': {},
            'rango_edades': {},
            'calidad_datos': {}
        }
        
        try:
            # Distribución por género
            if 'GENERO' in df.columns:
                genero_dist = df['GENERO'].value_counts().to_dict()
                stats['distribucion_genero'] = {k: int(v) for k, v in genero_dist.items()}
            
            # Distribución por tramos
            if 'TRAMO' in df.columns:
                tramo_dist = df['TRAMO'].value_counts().to_dict()
                stats['distribucion_tramos'] = {k: int(v) for k, v in tramo_dist.items()}
            
            # Calidad de datos
            total_campos = len(df.columns) * len(df)
            campos_vacios = df.isna().sum().sum()
            stats['calidad_datos'] = {
                'completitud': round(((total_campos - campos_vacios) / total_campos) * 100, 2),
                'campos_vacios': int(campos_vacios),
                'total_campos': int(total_campos)
            }
            
        except Exception as e:
            logger.warning(f"Error calculando estadísticas: {str(e)}")
        
        return stats
    
    @staticmethod
    def _detect_file_format(file_path: str) -> str:
        """Detecta formato del archivo"""
        suffix = Path(file_path).suffix.lower()
        format_map = {
            '.csv': 'CSV',
            '.txt': 'TXT',
            '.xls': 'Excel 97',
            '.xlsx': 'Excel'
        }
        return format_map.get(suffix, 'Desconocido')
    
    @staticmethod
    async def check_duplicate_corte(
        session: AsyncSession, 
        fecha_corte: str, 
        establecimiento_codigo: str = None
    ) -> Optional[Dict[str, Any]]:
        """Verifica si ya existe un corte para la fecha y establecimiento"""
        try:
            query = select(Archivo).where(
                and_(
                    Archivo.fecha_corte == date.fromisoformat(fecha_corte),
                    Archivo.is_active == True
                )
            )
            
            if establecimiento_codigo:
                # Buscar por código de establecimiento en metadatos
                query = query.where(
                    Archivo.metadata.like(f'%{establecimiento_codigo}%')
                )
            
            result = await session.execute(query)
            archivo_existente = result.scalar_one_or_none()
            
            if archivo_existente:
                return {
                    'existe_duplicado': True,
                    'archivo_id': str(archivo_existente.id),
                    'filename': archivo_existente.filename,
                    'fecha_procesamiento': archivo_existente.created_at.isoformat(),
                    'total_registros': archivo_existente.total_registros,
                    'fecha_corte': archivo_existente.fecha_corte.isoformat()
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error verificando duplicados: {str(e)}")
            return None