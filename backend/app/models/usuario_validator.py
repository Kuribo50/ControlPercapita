from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from ..models.usuario_nuevo import UsuarioNuevo
from ..models.registro_fonasa import RegistroFonasa
import logging

logger = logging.getLogger(__name__)

class UsuarioValidator:
    
    @staticmethod
    async def validate_usuario_against_fonasa(
        usuario: UsuarioNuevo,
        session: AsyncSession
    ) -> Dict[str, Any]:
        """Valida un usuario nuevo contra los registros de FONASA"""
        
        try:
            # Extraer RUN sin DV del usuario
            run_usuario = usuario.run_sin_dv
            
            # Buscar en registros FONASA
            query = select(RegistroFonasa).where(
                RegistroFonasa.run == run_usuario
            )
            
            result = await session.execute(query)
            registros_fonasa = result.scalars().all()
            
            if not registros_fonasa:
                return {
                    'encontrado_en_corte': False,
                    'estado': 'NO_ENCONTRADO',
                    'mensaje': 'RUN no encontrado en corte FONASA actual',
                    'detalles': None
                }
            
            # Si se encuentra, analizar el estado
            registro = registros_fonasa[0]  # Tomar el primer registro
            
            estado_validacion = {
                'encontrado_en_corte': True,
                'estado': 'ENCONTRADO',
                'mensaje': f'Usuario encontrado en corte FONASA',
                'detalles': {
                    'nombre_fonasa': registro.nombre_completo,
                    'run_completo': registro.run_completo,
                    'centro_asignado': registro.nombre_centro,
                    'cod_centro': registro.cod_centro,
                    'fecha_corte': registro.fecha_corte.isoformat(),
                    'es_nuevo_inscrito': registro.nuevo_inscrito,
                    'es_traslado_negativo': registro.traslado_negativo,
                    'es_rechazado_previsional': registro.rechazado_previsional,
                    'estado_especial': UsuarioValidator._get_estado_especial(registro)
                }
            }
            
            # Verificar coincidencia de nombres
            similitud_nombre = UsuarioValidator._compare_names(
                usuario.nombre_usuario,
                registro.nombre_completo
            )
            
            estado_validacion['detalles']['similitud_nombre'] = similitud_nombre
            
            if similitud_nombre < 0.7:
                estado_validacion['advertencias'] = [
                    f"Posible diferencia en nombres: '{usuario.nombre_usuario}' vs '{registro.nombre_completo}'"
                ]
            
            return estado_validacion
            
        except Exception as e:
            logger.error(f"Error validando usuario {usuario.run}: {str(e)}")
            return {
                'encontrado_en_corte': False,
                'estado': 'ERROR_VALIDACION',
                'mensaje': f'Error durante validación: {str(e)}',
                'detalles': None
            }
    
    @staticmethod
    def _get_estado_especial(registro: RegistroFonasa) -> Optional[str]:
        """Determina si el registro tiene algún estado especial"""
        if registro.nuevo_inscrito:
            return 'NUEVO_INSCRITO'
        elif registro.traslado_negativo:
            return 'TRASLADO_NEGATIVO'
        elif registro.traslado_positivo:
            return 'TRASLADO_POSITIVO'
        elif registro.rechazado_previsional:
            return 'RECHAZADO_PREVISIONAL'
        elif registro.rechazado_fallecido:
            return 'RECHAZADO_FALLECIDO'
        elif registro.exbloqueado:
            return 'EXBLOQUEADO'
        else:
            return 'MANTIENE_INSCRIPCION'
    
    @staticmethod
    def _compare_names(name1: str, name2: str) -> float:
        """Compara similitud entre nombres usando algoritmo simple"""
        try:
            from difflib import SequenceMatcher
            
            # Normalizar nombres
            name1_clean = name1.upper().strip()
            name2_clean = name2.upper().strip()
            
            # Calcular similitud
            similarity = SequenceMatcher(None, name1_clean, name2_clean).ratio()
            return similarity
            
        except Exception:
            # Si hay error, asumir que no son similares
            return 0.0
    
    @staticmethod
    async def revalidate_all_usuarios(session: AsyncSession) -> Dict[str, Any]:
        """Revalida todos los usuarios nuevos contra el corte actual"""
        
        try:
            # Obtener todos los usuarios nuevos
            query = select(UsuarioNuevo).where(UsuarioNuevo.is_active == True)
            result = await session.execute(query)
            usuarios = result.scalars().all()
            
            usuarios_revalidados = 0
            usuarios_con_error = 0
            
            for usuario in usuarios:
                try:
                    # Revalidar usuario
                    estado_validacion = await UsuarioValidator.validate_usuario_against_fonasa(
                        usuario, session
                    )
                    
                    # Actualizar estado
                    usuario.estado_validacion = estado_validacion
                    usuarios_revalidados += 1
                    
                except Exception as e:
                    logger.warning(f"Error revalidando usuario {usuario.run}: {str(e)}")
                    usuarios_con_error += 1
            
            await session.commit()
            
            return {
                'success': True,
                'usuarios_revalidados': usuarios_revalidados,
                'usuarios_con_error': usuarios_con_error,
                'total_usuarios': len(usuarios)
            }
            
        except Exception as e:
            await session.rollback()
            logger.error(f"Error en revalidación masiva: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }