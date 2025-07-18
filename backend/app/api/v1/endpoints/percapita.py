from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date
import tempfile
import os
from ....core.database import get_async_session
from ....core.auth import get_current_user
from ....models.user import User
from ....models.archivo import Archivo
from ....models.usuario_nuevo import UsuarioNuevo
from ....schemas.archivo import ArchivoResponse, ArchivoPreview
from ....schemas.usuario_nuevo import UsuarioNuevoCreate, UsuarioNuevoResponse
from ....schemas.dashboard import DashboardResponse
from ....services.fonasa_processor import FonasaProcessor
from ....services.usuario_validator import UsuarioValidator
from ....services.file_processor import FileProcessor
from ....core.config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Dashboard
@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Obtener datos del dashboard"""
    try:
        # Obtener estadísticas básicas
        from sqlalchemy import select, func
        
        # Total usuarios en archivos
        total_usuarios_query = select(func.count(Archivo.total_registros)).where(
            Archivo.is_active == True
        )
        total_usuarios_result = await session.execute(total_usuarios_query)
        total_usuarios = total_usuarios_result.scalar() or 0
        
        # Usuarios nuevos
        usuarios_nuevos_query = select(func.count(UsuarioNuevo.id)).where(
            UsuarioNuevo.is_active == True
        )
        usuarios_nuevos_result = await session.execute(usuarios_nuevos_query)
        usuarios_nuevos = usuarios_nuevos_result.scalar() or 0
        
        # Casos pendientes (simplificado)
        casos_pendientes = 0  # Se puede calcular basado en los archivos procesados
        
        # Evolución (datos de ejemplo - se puede implementar con datos reales)
        evolucion = [
            {"mes": "Feb", "poblacion": 15420},
            {"mes": "Mar", "poblacion": 15638},
            {"mes": "Abr", "poblacion": 15789}
        ]
        
        return DashboardResponse(
            total_usuarios=total_usuarios,
            casos_pendientes=casos_pendientes,
            usuarios_nuevos=usuarios_nuevos,
            evolucion=evolucion
        )
        
    except Exception as e:
        logger.error(f"Error obteniendo dashboard: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error obteniendo datos del dashboard"
        )

# Archivos
# backend/app/api/v1/endpoints/percapita.py (actualizar)

@router.post("/preview-csv")
async def preview_csv_file(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Analizar archivo antes de subirlo con detección de duplicados"""
    try:
        # Validaciones básicas
        if not file.filename.lower().endswith(('.csv', '.txt', '.xls', '.xlsx')):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Formato de archivo no soportado. Use CSV, TXT, XLS o XLSX."
            )
        
        if file.size and file.size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Archivo demasiado grande. Máximo permitido: {settings.MAX_FILE_SIZE/1024/1024:.1f}MB"
            )
        
        # Guardar archivo temporal
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            # Procesar archivo
            preview_data = FonasaProcessor.preview_fonasa_file(tmp_file_path)
            
            # Verificar duplicados si se detectó fecha de corte
            if preview_data.get('fecha_corte_detectada') and preview_data.get('validacion_ok'):
                establecimiento_principal = preview_data.get('establecimientos_detectados', {}).get('establecimiento_principal')
                codigo_establecimiento = establecimiento_principal.get('codigo') if establecimiento_principal else None
                
                duplicado = await FonasaProcessor.check_duplicate_corte(
                    session, 
                    preview_data['fecha_corte_detectada'],
                    codigo_establecimiento
                )
                
                if duplicado:
                    preview_data['duplicado_detectado'] = duplicado
            
            return preview_data
            
        finally:
            # Limpiar archivo temporal
            os.unlink(tmp_file_path)
            
    except Exception as e:
        logger.error(f"Error analizando archivo: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analizando archivo: {str(e)}"
        )

@router.post("/upload-csv")
async def upload_csv_file(
    file: UploadFile = File(...),
    fecha_corte: Optional[str] = Form(None),
    establecimiento: Optional[str] = Form(None),
    sustituir_archivo_id: Optional[str] = Form(None),
    confirmar_duplicado: bool = Form(False),
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Subir y procesar archivo FONASA con manejo de duplicados"""
    try:
        # Validaciones básicas
        if not file.filename.lower().endswith(('.csv', '.txt', '.xls', '.xlsx')):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Formato de archivo no soportado"
            )
        
        # Crear directorio de uploads
        upload_dir = os.path.join(settings.UPLOAD_FOLDER, "fonasa")
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generar nombre único para el archivo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_extension = Path(file.filename).suffix
        unique_filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Guardar archivo
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Analizar archivo
        preview_data = FonasaProcessor.preview_fonasa_file(file_path)
        
        if not preview_data.get('validacion_ok'):
            os.unlink(file_path)  # Limpiar archivo inválido
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Archivo inválido: {preview_data.get('error', 'Formato no reconocido')}"
            )
        
        # Usar fecha y establecimiento detectados o los proporcionados
        fecha_corte_final = fecha_corte or preview_data.get('fecha_corte_detectada')
        establecimiento_detectado = preview_data.get('establecimientos_detectados', {}).get('establecimiento_principal')
        establecimiento_final = establecimiento or (establecimiento_detectado.get('nombre_identificado') if establecimiento_detectado else None)
        
        if not fecha_corte_final:
            os.unlink(file_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo detectar la fecha de corte. Por favor especifíquela manualmente."
            )
        
        # Verificar duplicados si no se confirmó
        if not confirmar_duplicado:
            codigo_establecimiento = establecimiento_detectado.get('codigo') if establecimiento_detectado else None
            duplicado = await FonasaProcessor.check_duplicate_corte(
                session, 
                fecha_corte_final,
                codigo_establecimiento
            )
            
            if duplicado:
                os.unlink(file_path)  # Limpiar archivo temporalmente
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={
                        "message": "Ya existe un corte para esta fecha y establecimiento",
                        "duplicado_info": duplicado,
                        "requiere_confirmacion": True
                    }
                )
        
        # Si hay que sustituir archivo existente
        if sustituir_archivo_id:
            # Marcar archivo anterior como inactivo
            query = select(Archivo).where(Archivo.id == sustituir_archivo_id)
            result = await session.execute(query)
            archivo_anterior = result.scalar_one_or_none()
            
            if archivo_anterior:
                archivo_anterior.is_active = False
                await session.commit()
        
        # Crear registro de archivo
        metadata = {
            'establecimientos_detectados': preview_data.get('establecimientos_detectados'),
            'casos_detectados': preview_data.get('casos_detectados'),
            'estadisticas': preview_data.get('estadisticas'),
            'establecimiento_procesamiento': establecimiento_final
        }
        
        archivo = Archivo(
            filename=file.filename,
            unique_filename=unique_filename,
            formato=preview_data.get('formato'),
            fecha_corte=date.fromisoformat(fecha_corte_final),
            total_registros=preview_data.get('total_registros', 0),
            path_archivo=file_path,
            metadata=metadata,
            user_id=current_user.id
        )
        
        session.add(archivo)
        await session.commit()
        await session.refresh(archivo)
        
        # Procesar registros (esto puede hacerse en segundo plano)
        resultado_procesamiento = await FonasaProcessor.process_and_save_fonasa_file(
            file_path, str(archivo.id), session
        )
        
        # Actualizar estadísticas del archivo
        if resultado_procesamiento.get('success'):
            archivo.nuevos_inscritos = resultado_procesamiento.get('nuevos_inscritos', 0)
            archivo.rechazos_previsionales = resultado_procesamiento.get('rechazos_previsionales', 0)
            archivo.traslados_negativos = resultado_procesamiento.get('traslados_negativos', 0)
            archivo.estado_procesamiento = 'completado'
            await session.commit()
        else:
            archivo.estado_procesamiento = 'error'
            await session.commit()
        
        return {
            "success": True,
            "archivo_id": str(archivo.id),
            "filename": archivo.filename,
            "fecha_corte": archivo.fecha_corte.isoformat(),
            "establecimiento": establecimiento_final,
            "total_registros": archivo.total_registros,
            "nuevos_inscritos": archivo.nuevos_inscritos or 0,
            "rechazos_previsionales": archivo.rechazos_previsionales or 0,
            "traslados_negativos": archivo.traslados_negativos or 0,
            "casos_detectados": preview_data.get('casos_detectados'),
            "estadisticas": preview_data.get('estadisticas')
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error procesando archivo: {str(e)}")
        # Limpiar archivo si existe
        if 'file_path' in locals() and os.path.exists(file_path):
            os.unlink(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error procesando archivo: {str(e)}"
        )

@router.get("/archivos-procesados")
async def get_archivos_procesados(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Obtener lista de archivos procesados"""
    try:
        query = select(Archivo).where(
            Archivo.is_active == True
        ).order_by(Archivo.created_at.desc())
        
        result = await session.execute(query)
        archivos = result.scalars().all()
        
        archivos_data = []
        for archivo in archivos:
            metadata = archivo.metadata or {}
            establecimientos = metadata.get('establecimientos_detectados', {})
            establecimiento_principal = establecimientos.get('establecimiento_principal', {})
            
            archivos_data.append({
                "id": str(archivo.id),
                "filename": archivo.filename,
                "formato": archivo.formato,
                "fecha_corte": archivo.fecha_corte.isoformat(),
                "fecha_procesamiento": archivo.created_at.isoformat(),
                "total_registros": archivo.total_registros,
                "nuevos_inscritos": archivo.nuevos_inscritos or 0,
                "rechazos_previsionales": archivo.rechazos_previsionales or 0,
                "traslados_negativos": archivo.traslados_negativos or 0,
                "estado_procesamiento": archivo.estado_procesamiento or 'pendiente',
                "establecimiento": establecimiento_principal.get('nombre_identificado') or establecimiento_principal.get('nombre'),
                "codigo_establecimiento": establecimiento_principal.get('codigo')
            })
        
        return {
            "archivos": archivos_data,
            "total": len(archivos_data)
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo archivos procesados: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error obteniendo archivos procesados"
        )

@router.delete("/archivos-procesados/{archivo_id}")
async def delete_archivo(
    archivo_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    try:
        # Buscar el archivo
        result = await session.execute(
            select(Archivo).where(Archivo.id == archivo_id)
        )
        archivo = result.scalars().first()
        
        if not archivo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Archivo no encontrado"
            )
        
        # Eliminar el archivo
        await session.delete(archivo)
        await session.commit()
        
        return {"message": "Archivo eliminado correctamente"}
        
    except Exception as e:
        await session.rollback()
        logger.error(f"Error eliminando archivo: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error eliminando archivo: {str(e)}"
        )

@router.get("/usuarios-nuevos")
async def get_usuarios_nuevos(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Obtener lista de usuarios nuevos"""
    try:
        from sqlalchemy import select
        
        query = select(UsuarioNuevo).where(
            UsuarioNuevo.is_active == True
        ).order_by(UsuarioNuevo.created_at.desc())
        
        result = await session.execute(query)
        usuarios = result.scalars().all()
        
        return {
            "usuarios": [
                UsuarioNuevoResponse(
                    id=usuario.id,
                    fecha=usuario.fecha,
                    run=usuario.run,
                    nombre=usuario.nombre_usuario,
                    nacionalidad=usuario.nacionalidad,
                    etnia=usuario.etnia,
                    sector=usuario.sector,
                    subsector=usuario.subsector,
                    cod_percapita=usuario.cod_percapita,
                    validado_en_siis=usuario.validado_en_siis,
                    establecimiento=usuario.establecimiento,
                    observacion=usuario.observacion,
                    estado_validacion=usuario.estado_validacion,
                    created_at=usuario.created_at.isoformat()
                )
                for usuario in usuarios
            ]
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo usuarios: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error obteniendo usuarios"
        )

@router.delete("/usuarios-nuevos/{usuario_id}")
async def delete_usuario_nuevo(
    usuario_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Eliminar usuario nuevo"""
    try:
        from sqlalchemy import select
        
        query = select(UsuarioNuevo).where(UsuarioNuevo.id == usuario_id)
        result = await session.execute(query)
        usuario = result.scalar_one_or_none()
        
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        # Soft delete
        usuario.is_active = False
        await session.commit()
        
        return {"message": "Usuario eliminado correctamente"}
        
    except Exception as e:
        logger.error(f"Error eliminando usuario: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error eliminando usuario"
        )

@router.post("/revalidar-usuarios")
async def revalidar_usuarios(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Revalidar todos los usuarios contra el corte actual"""
    try:
        resultado = await UsuarioValidator.revalidate_all_usuarios(session)
        return resultado
        
    except Exception as e:
        logger.error(f"Error revalidando usuarios: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error revalidando usuarios"
        )

@router.get("/test")
async def test_endpoint():
    """Endpoint de prueba"""
    return {
        "message": "API funcionando correctamente",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }
@router.get("/estado-inicial")
async def get_estado_inicial(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Obtener estado inicial del sistema"""
    try:
        from sqlalchemy import select, func
        
        # Verificar si hay archivos
        archivos_query = select(func.count(Archivo.id)).where(Archivo.is_active == True)
        archivos_result = await session.execute(archivos_query)
        archivos_count = archivos_result.scalar() or 0
        
        # Verificar usuarios nuevos
        usuarios_query = select(func.count(UsuarioNuevo.id)).where(UsuarioNuevo.is_active == True)
        usuarios_result = await session.execute(usuarios_query)
        usuarios_count = usuarios_result.scalar() or 0
        
        # Obtener último archivo
        ultimo_archivo = None
        if archivos_count > 0:
            last_archivo_query = select(Archivo).where(
                Archivo.is_active == True
            ).order_by(Archivo.created_at.desc()).limit(1)
            
            last_result = await session.execute(last_archivo_query)
            last_archivo = last_result.scalar_one_or_none()
            
            if last_archivo:
                ultimo_archivo = {
                    "filename": last_archivo.filename,
                    "fecha_corte": last_archivo.fecha_corte.isoformat(),
                    "total_registros": last_archivo.total_registros,
                    "created_at": last_archivo.created_at.isoformat()
                }
        
        return {
            "tiene_corte_activo": archivos_count > 0,
            "archivos_procesados": archivos_count,
            "usuarios_nuevos": usuarios_count,
            "casos_pendientes": 0,  # Se puede calcular después
            "ultimo_archivo": ultimo_archivo
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo estado inicial: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error obteniendo estado inicial"
        )

@router.get("/casos-revision")
async def get_casos_revision(
    tipo: Optional[str] = None,
    archivo_id: Optional[str] = None,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Obtener casos de revisión"""
    try:
        from sqlalchemy import select
        
        query = select(CasoRevision).where(CasoRevision.is_active == True)
        
        if tipo:
            query = query.where(CasoRevision.tipo_caso == tipo)
        
        if archivo_id:
            query = query.where(CasoRevision.archivo_id == archivo_id)
        
        query = query.order_by(CasoRevision.created_at.desc())
        
        result = await session.execute(query)
        casos = result.scalars().all()
        
        return {
            "casos": [
                {
                    "id": str(caso.id),
                    "tipo_caso": caso.tipo_caso,
                    "run": caso.run,
                    "nombre": caso.nombre,
                    "descripcion": caso.descripcion,
                    "estado": caso.estado,
                    "datos_originales": caso.datos_originales,
                    "created_at": caso.created_at.isoformat()
                }
                for caso in casos
            ],
            "total": len(casos)
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo casos de revisión: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error obteniendo casos de revisión"
        )
        
        
@app.get("/api/v1/percapita/dashboard")
async def get_dashboard():
    """Dashboard con datos más completos"""
    return {
        "total_usuarios": 15789,
        "casos_pendientes": 23,
        "usuarios_nuevos": 847,
        "evolucion": [
            {"mes": "Feb", "poblacion": 15420},
            {"mes": "Mar", "poblacion": 15638}, 
            {"mes": "Abr", "poblacion": 15789}
        ],
        "estadisticas_mes": {
            "nuevos_inscritos": 847,
            "rechazos_previsionales": 67,
            "traslados_negativos": 23,
            "tasa_validacion": 94.2
        },
        "actividad_reciente": [
            {
                "tiempo": "09:45",
                "tipo": "upload",
                "mensaje": "Archivo FONASA procesado",
                "detalle": "1,250 registros"
            },
            {
                "tiempo": "09:30", 
                "tipo": "user",
                "mensaje": "Nuevo usuario registrado",
                "detalle": "María González"
            }
        ]
    }