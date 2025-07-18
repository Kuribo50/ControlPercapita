import pandas as pd
import polars as pl
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, date
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.registro_fonasa import RegistroFonasa
from ..models.archivo import Archivo

logger = logging.getLogger(__name__)

class FonasaProcessor:
    
    # Mapeo de columnas esperadas
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
            # Leer solo la primera fila para verificar columnas
            if Path(file_path).suffix.lower() in ['.csv', '.txt']:
                df = pd.read_csv(file_path, nrows=1)
            else:
                df = pd.read_excel(file_path, nrows=1)
            
            # Verificar columnas
            file_columns = [col.strip().upper() for col in df.columns]
            expected_columns = [col.upper() for col in FonasaProcessor.EXPECTED_COLUMNS]
            
            missing_columns = set(expected_columns) - set(file_columns)
            extra_columns = set(file_columns) - set(expected_columns)
            
            if missing_columns:
                return False, f"Faltan columnas requeridas: {', '.join(missing_columns)}"
            
            if len(extra_columns) > 3:  # Permitir algunas columnas extra
                return False, f"Archivo contiene columnas no esperadas: {', '.join(extra_columns)}"
            
            return True, "Formato válido"
            
        except Exception as e:
            return False, f"Error validando formato: {str(e)}"
    
    @staticmethod
    def preview_fonasa_file(file_path: str) -> Dict[str, Any]:
        """Analiza archivo FONASA y retorna información de preview"""
        try:
            # Validar formato
            is_valid, message = FonasaProcessor.validate_fonasa_format(file_path)
            if not is_valid:
                raise ValueError(message)
            
            # Leer archivo
            if Path(file_path).suffix.lower() in ['.csv', '.txt']:
                df = pd.read_csv(file_path)
            else:
                df = pd.read_excel(file_path)
            
            # Limpiar nombres de columnas
            df.columns = [col.strip().upper() for col in df.columns]
            
            # Información básica
            total_registros = len(df)
            columnas_detectadas = len(df.columns)
            
            # Detectar fecha de corte
            fecha_corte_detectada = FonasaProcessor._detect_fecha_corte_fonasa(df)
            
            # Detectar casos problemáticos específicos de FONASA
            casos_detectados = FonasaProcessor._detect_fonasa_cases(df)
            
            # Detectar centros
            centros_detectados = FonasaProcessor._detect_centros(df)
            
            return {
                'filename': Path(file_path).name,
                'file_format': FonasaProcessor._detect_file_format(file_path),
                'total_registros': total_registros,
                'columnas_detectadas': columnas_detectadas,
                'fecha_corte_detectada': fecha_corte_detectada,
                'casos_detectados': casos_detectados,
                'centros_detectados': centros_detectados,
                'preview_data': df.head(3).to_dict('records'),
                'is_fonasa_format': True
            }
            
        except Exception as e:
            logger.error(f"Error procesando archivo FONASA {file_path}: {str(e)}")
            raise ValueError(f"Error procesando archivo: {str(e)}")
    
    @staticmethod
    def _detect_fecha_corte_fonasa(df: pd.DataFrame) -> Optional[date]:
        """Detecta fecha de corte específicamente en archivos FONASA"""
        try:
            if 'FECHA_CORTE' in df.columns:
                # Convertir columna de fecha
                fechas = pd.to_datetime(df['FECHA_CORTE'].dropna(), errors='coerce')
                if not fechas.empty:
                    # Tomar la fecha más común
                    fecha_mas_comun = fechas.mode()
                    if not fecha_mas_comun.empty:
                        return fecha_mas_comun.iloc[0].date()
        except Exception as e:
            logger.warning(f"Error detectando fecha de corte FONASA: {str(e)}")
        
        return None
    
    @staticmethod
    def _detect_fonasa_cases(df: pd.DataFrame) -> Dict[str, int]:
        """Detecta casos específicos en archivos FONASA"""
        casos = {
            'nuevos_inscritos': 0,
            'rechazos_previsionales': 0,
            'rechazos_fallecidos': 0,
            'traslados_positivos': 0,
            'traslados_negativos': 0,
            'exbloqueados': 0,
            'sin_centro': 0,
            'datos_incompletos': 0,
            'runs_duplicados': 0
        }
        
        try:
            # Casos por flags booleanos
            boolean_columns = {
                'nuevos_inscritos': 'NUEVO_INSCRITO',
                'rechazos_previsionales': 'RECHAZADO_PREVISIONAL',
                'rechazos_fallecidos': 'RECHAZADO_FALLECIDO',
                'traslados_positivos': 'TRASLADO_POSITIVO',
                'traslados_negativos': 'TRASLADO_NEGATIVO',
                'exbloqueados': 'EXBLOQUEADO'
            }
            
            for caso, columna in boolean_columns.items():
                if columna in df.columns:
                    # Contar registros que tienen valor 1, '1', 'True', 'SI', etc.
                    casos[caso] = df[columna].astype(str).str.upper().isin(['1', 'TRUE', 'SI', 'S']).sum()
            
            # Casos de datos faltantes
            if 'COD_CENTRO' in df.columns:
                casos['sin_centro'] = df['COD_CENTRO'].isna().sum()
            
            # Datos incompletos (RUN, nombres, apellidos)
            critical_fields = ['RUN', 'NOMBRES', 'APELLIDO_PATERNO']
            for field in critical_fields:
                if field in df.columns:
                    casos['datos_incompletos'] += df[field].isna().sum()
            
            # RUNs duplicados
            if 'RUN' in df.columns:
                casos['runs_duplicados'] = df['RUN'].duplicated().sum()
            
            logger.info(f"Casos FONASA detectados: {casos}")
            
        except Exception as e:
            logger.warning(f"Error detectando casos FONASA: {str(e)}")
        
        return casos
    
    @staticmethod
    def _detect_centros(df: pd.DataFrame) -> Dict[str, Any]:
        """Detecta información de centros en el archivo"""
        centros_info = {
            'centros_unicos': 0,
            'centro_principal': None,
            'lista_centros': []
        }
        
        try:
            if 'COD_CENTRO' in df.columns and 'NOMBRE_CENTRO' in df.columns:
                # Obtener centros únicos
                centros_df = df[['COD_CENTRO', 'NOMBRE_CENTRO']].drop_duplicates()
                centros_df = centros_df.dropna()
                
                centros_info['centros_unicos'] = len(centros_df)
                centros_info['lista_centros'] = centros_df.to_dict('records')
                
                # Centro más frecuente
                if not df['COD_CENTRO'].empty:
                    centro_mas_frecuente = df['COD_CENTRO'].mode()
                    if not centro_mas_frecuente.empty:
                        cod_principal = centro_mas_frecuente.iloc[0]
                        nombre_principal = df[df['COD_CENTRO'] == cod_principal]['NOMBRE_CENTRO'].iloc[0]
                        centros_info['centro_principal'] = {
                            'codigo': cod_principal,
                            'nombre': nombre_principal
                        }
                        
        except Exception as e:
            logger.warning(f"Error detectando centros: {str(e)}")
        
        return centros_info
    
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
    async def process_and_save_fonasa_file(
        file_path: str, 
        archivo_id: str, 
        session: AsyncSession
    ) -> Dict[str, Any]:
        """Procesa completamente el archivo FONASA y guarda en BD"""
        try:
            # Leer archivo completo
            if Path(file_path).suffix.lower() in ['.csv', '.txt']:
                df = pd.read_csv(file_path)
            else:
                df = pd.read_excel(file_path)
            
            # Limpiar nombres de columnas
            df.columns = [col.strip().upper() for col in df.columns]
            
            # Convertir a registros
            registros_procesados = 0
            registros_con_error = 0
            
            for _, row in df.iterrows():
                try:
                    # Crear registro FONASA
                    registro = RegistroFonasa(
                        archivo_id=archivo_id,
                        run=str(row.get('RUN', '')).strip(),
                        dv=str(row.get('DV', '')).strip().upper(),
                        nombres=str(row.get('NOMBRES', '')).strip(),
                        apellido_paterno=str(row.get('APELLIDO_PATERNO', '')).strip(),
                        apellido_materno=str(row.get('APELLIDO_MATERNO', '')).strip() if pd.notna(row.get('APELLIDO_MATERNO')) else None,
                        fecha_nacimiento=pd.to_datetime(row.get('FECHA_NACIMIENTO')).date(),
                        genero=str(row.get('GENERO', '')).strip().upper(),
                        tramo=str(row.get('TRAMO', '')).strip() if pd.notna(row.get('TRAMO')) else None,
                        fecha_corte=pd.to_datetime(row.get('FECHA_CORTE')).date(),
                        cod_centro=str(row.get('COD_CENTRO', '')).strip(),
                        nombre_centro=str(row.get('NOMBRE_CENTRO', '')).strip(),
                        # Agregar otros campos...
                        traslado_positivo=FonasaProcessor._parse_boolean(row.get('TRASLADO_POSITIVO')),
                        traslado_negativo=FonasaProcessor._parse_boolean(row.get('TRASLADO_NEGATIVO')),
                        nuevo_inscrito=FonasaProcessor._parse_boolean(row.get('NUEVO_INSCRITO')),
                        rechazado_previsional=FonasaProcessor._parse_boolean(row.get('RECHAZADO_PREVISIONAL')),
                        rechazado_fallecido=FonasaProcessor._parse_boolean(row.get('RECHAZADO_FALLECIDO')),
                    )
                    
                    session.add(registro)
                    registros_procesados += 1
                    
                except Exception as e:
                    logger.warning(f"Error procesando registro: {str(e)}")
                    registros_con_error += 1
                    continue
            
            # Guardar en lotes
            await session.commit()
            
            # Calcular estadísticas finales
            estadisticas = FonasaProcessor._calculate_final_stats(df)
            
            return {
                'success': True,
                'registros_procesados': registros_procesados,
                'registros_con_error': registros_con_error,
                **estadisticas
            }
            
        except Exception as e:
            await session.rollback()
            logger.error(f"Error procesando archivo FONASA completo: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def _parse_boolean(value) -> bool:
        """Convierte diferentes formatos a booleano"""
        if pd.isna(value):
            return False
        
        str_value = str(value).strip().upper()
        return str_value in ['1', 'TRUE', 'SI', 'S', 'YES', 'Y']
    
    @staticmethod
    def _calculate_final_stats(df: pd.DataFrame) -> Dict[str, int]:
        """Calcula estadísticas finales del procesamiento"""
        stats = {}
        
        # Contadores principales
        if 'NUEVO_INSCRITO' in df.columns:
            stats['nuevos_inscritos'] = df['NUEVO_INSCRITO'].astype(str).str.upper().isin(['1', 'TRUE', 'SI', 'S']).sum()
        
        if 'RECHAZADO_PREVISIONAL' in df.columns:
            stats['rechazos_previsionales'] = df['RECHAZADO_PREVISIONAL'].astype(str).str.upper().isin(['1', 'TRUE', 'SI', 'S']).sum()
        
        if 'TRASLADO_NEGATIVO' in df.columns:
            stats['traslados_negativos'] = df['TRASLADO_NEGATIVO'].astype(str).str.upper().isin(['1', 'TRUE', 'SI', 'S']).sum()
        
        return stats