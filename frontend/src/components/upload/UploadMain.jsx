// src/components/upload/UploadMain.jsx (continuación)
import React, { useState, useEffect } from 'react';
import { 
 MdCloudUpload, MdDescription, MdError, MdCheckCircle, 
 MdWarning, MdDelete, MdDownload, MdInfo, MdBusiness,
 MdCalendarToday, MdAssignment, MdRefresh
} from 'react-icons/md';

export default function UploadMain() {
 const [file, setFile] = useState(null);
 const [dragOver, setDragOver] = useState(false);
 const [uploading, setUploading] = useState(false);
 const [analyzing, setAnalyzing] = useState(false);
 const [result, setResult] = useState(null);
 const [archivos, setArchivos] = useState([]);
 const [loadingArchivos, setLoadingArchivos] = useState(true);
 const [previewData, setPreviewData] = useState(null);
 const [fechaCorte, setFechaCorte] = useState('');
 const [establecimiento, setEstablecimiento] = useState('');
 const [showDuplicateModal, setShowDuplicateModal] = useState(false);
 const [duplicateInfo, setDuplicateInfo] = useState(null);

 useEffect(() => {
   cargarArchivos();
 }, []);

 useEffect(() => {
   if (file) {
     analizarArchivo();
   }
 }, [file]);

 const cargarArchivos = async () => {
   try {
     const response = await fetch('http://localhost:8000/api/v1/percapita/archivos-procesados');
     const data = await response.json();
     setArchivos(data.archivos || []);
   } catch (error) {
     console.error('Error cargando archivos:', error);
   } finally {
     setLoadingArchivos(false);
   }
 };

 const analizarArchivo = async () => {
   if (!file) return;
   
   setAnalyzing(true);
   setPreviewData(null);
   setResult(null);
   setDuplicateInfo(null);
   
   const formData = new FormData();
   formData.append('file', file);
   
   try {
     const response = await fetch('http://localhost:8000/api/v1/percapita/preview-csv', {
       method: 'POST',
       body: formData
     });
     
     const data = await response.json();
     
     if (response.ok && data.validacion_ok) {
       setPreviewData(data);
       
       // Auto-completar campos detectados
       if (data.fecha_corte_detectada) {
         setFechaCorte(data.fecha_corte_detectada);
       }
       
       if (data.establecimientos_detectados?.establecimiento_principal?.nombre_identificado) {
         setEstablecimiento(data.establecimientos_detectados.establecimiento_principal.nombre_identificado);
       }
       
       // Verificar duplicados
       if (data.duplicado_detectado) {
         setDuplicateInfo(data.duplicado_detectado);
         setShowDuplicateModal(true);
       }
     } else {
       setResult({ 
         error: data.error || data.detail || 'Error analizando archivo',
         validacion_ok: false 
       });
     }
   } catch (error) {
     console.error('Error analizando archivo:', error);
     setResult({ error: 'Error de conexión con el servidor' });
   } finally {
     setAnalyzing(false);
   }
 };

 const handleDrop = (e) => {
   e.preventDefault();
   setDragOver(false);
   
   const files = Array.from(e.dataTransfer.files);
   const file = files[0];
   
   if (file && isValidFile(file)) {
     setFile(file);
   } else {
     setResult({ error: 'Tipo de archivo no válido. Solo se permiten archivos CSV, TXT, XLS y XLSX.' });
   }
 };

 const handleFileSelect = (e) => {
   const file = e.target.files[0];
   if (file && isValidFile(file)) {
     setFile(file);
   } else {
     setResult({ error: 'Tipo de archivo no válido.' });
   }
 };

 const isValidFile = (file) => {
   const validTypes = ['.csv', '.txt', '.xls', '.xlsx'];
   return validTypes.some(type => file.name.toLowerCase().endsWith(type));
 };

 const handleUpload = async (confirmarDuplicado = false, sustituirArchivoId = null) => {
   if (!file) return;
   
   setUploading(true);
   setResult(null);
   setShowDuplicateModal(false);
   
   const formData = new FormData();
   formData.append('file', file);
   if (fechaCorte) {
     formData.append('fecha_corte', fechaCorte);
   }
   if (establecimiento) {
     formData.append('establecimiento', establecimiento);
   }
   if (confirmarDuplicado) {
     formData.append('confirmar_duplicado', 'true');
   }
   if (sustituirArchivoId) {
     formData.append('sustituir_archivo_id', sustituirArchivoId);
   }
   
   try {
     const response = await fetch('http://localhost:8000/api/v1/percapita/upload-csv', {
       method: 'POST',
       body: formData
     });
     
     const data = await response.json();
     
     if (response.status === 409) {
       // Conflicto por duplicado
       setDuplicateInfo(data.detail.duplicado_info);
       setShowDuplicateModal(true);
       setResult({ warning: data.detail.message });
     } else if (response.ok) {
       setResult(data);
       await cargarArchivos();
       resetForm();
     } else {
       setResult({ error: data.detail || 'Error al procesar el archivo' });
     }
   } catch (error) {
     setResult({ error: 'Error al subir el archivo. Verifica la conexión con el servidor.' });
   } finally {
     setUploading(false);
   }
 };

 const resetForm = () => {
   setFile(null);
   setPreviewData(null);
   setFechaCorte('');
   setEstablecimiento('');
   setResult(null);
   setDuplicateInfo(null);
   setShowDuplicateModal(false);
 };

 const formatFileSize = (bytes) => {
   if (bytes === 0) return '0 Bytes';
   const k = 1024;
   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
   const i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
 };

 const getFileIcon = (filename) => {
   return <MdDescription className="h-8 w-8 text-blue-500" />;
 };

 return (
   <div className="max-w-6xl mx-auto space-y-8">
     {/* Header */}
     <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-6">
       <div className="flex items-center justify-between">
         <div className="flex items-center space-x-4">
           <div className="p-3 bg-violet-500 rounded-lg">
             <MdCloudUpload className="h-8 w-8 text-white" />
           </div>
           <div>
             <h1 className="text-2xl font-bold text-gray-900">Subir Corte FONASA</h1>
             <p className="text-gray-600 mt-1">
               Carga y procesa archivos de población inscrita desde FONASA
             </p>
           </div>
         </div>
         <button
           onClick={cargarArchivos}
           disabled={loadingArchivos}
           className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
         >
           <MdRefresh className={loadingArchivos ? 'animate-spin' : ''} />
           <span>Actualizar Lista</span>
         </button>
       </div>
     </div>

     {/* Zona de carga */}
     <div className="bg-white rounded-xl shadow-sm border border-gray-200">
       <div className="p-6">
         <h2 className="text-lg font-semibold text-gray-900 mb-4">Cargar Archivo</h2>
         
         {!file ? (
           <div
             className={`
               border-2 border-dashed rounded-xl p-12 text-center transition-colors
               ${dragOver 
                 ? 'border-violet-400 bg-violet-50' 
                 : 'border-gray-300 hover:border-violet-400 hover:bg-gray-50'
               }
             `}
             onDrop={handleDrop}
             onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
             onDragLeave={() => setDragOver(false)}
           >
             <MdCloudUpload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-gray-900 mb-2">
               Arrastra tu archivo de corte FONASA aquí
             </h3>
             <p className="text-gray-500 mb-4">
               o haz clic para seleccionar archivo
             </p>
             <input
               type="file"
               accept=".csv,.txt,.xls,.xlsx"
               onChange={handleFileSelect}
               className="hidden"
               id="file-upload"
             />
             <label
               htmlFor="file-upload"
               className="inline-flex items-center px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 cursor-pointer transition-colors"
             >
               <MdCloudUpload className="h-5 w-5 mr-2" />
               Seleccionar Archivo
             </label>
             <p className="text-xs text-gray-400 mt-4">
               Formatos soportados: CSV, TXT, XLS, XLSX (Máximo 50MB)
             </p>
           </div>
         ) : (
           <div className="space-y-6">
             {/* Información del archivo */}
             <ArchiveInfo 
               file={file} 
               analyzing={analyzing} 
               onRemove={resetForm}
               getFileIcon={getFileIcon}
               formatFileSize={formatFileSize}
             />

             {/* Análisis del archivo */}
             {previewData && (
               <ArchiveAnalysis 
                 previewData={previewData}
                 fechaCorte={fechaCorte}
                 setFechaCorte={setFechaCorte}
                 establecimiento={establecimiento}
                 setEstablecimiento={setEstablecimiento}
                 onUpload={() => handleUpload(false)}
                 onCancel={resetForm}
                 uploading={uploading}
                 analyzing={analyzing}
               />
             )}
           </div>
         )}
       </div>
     </div>

     {/* Modal de duplicado */}
     {showDuplicateModal && duplicateInfo && (
       <DuplicateModal
         duplicateInfo={duplicateInfo}
         onConfirm={() => handleUpload(true)}
         onReplace={() => handleUpload(false, duplicateInfo.archivo_id)}
         onCancel={() => setShowDuplicateModal(false)}
       />
     )}

     {/* Resultados */}
     {result && <UploadResults result={result} onReset={resetForm} />}

     {/* Lista de archivos procesados */}
     <ProcessedFiles
       files={archivos}
       isLoading={loadingArchivos}
       onReload={cargarArchivos}
     />
   </div>
 );
}

// Componente de información del archivo
function ArchiveInfo({ file, analyzing, onRemove, getFileIcon, formatFileSize }) {
 return (
   <div className="border border-gray-200 rounded-lg p-4">
     <div className="flex items-start space-x-4">
       {getFileIcon(file.name)}
       <div className="flex-1 min-w-0">
         <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
         <p className="text-sm text-gray-500">
           {formatFileSize(file.size)} • {file.type || 'Archivo FONASA'}
         </p>
         
         {analyzing && (
           <div className="flex items-center mt-2 text-blue-600">
             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
             <span className="text-sm">Analizando estructura del archivo...</span>
           </div>
         )}
       </div>
       <button
         onClick={onRemove}
         className="p-2 text-gray-400 hover:text-red-500 transition-colors"
         title="Remover archivo"
       >
         <MdDelete className="h-5 w-5" />
       </button>
     </div>
   </div>
 );
}

// Componente de análisis del archivo
function ArchiveAnalysis({ 
 previewData, 
 fechaCorte, 
 setFechaCorte, 
 establecimiento, 
 setEstablecimiento,
 onUpload,
 onCancel,
 uploading,
 analyzing 
}) {
 const estadisticas = previewData.estadisticas || {};
 const establecimientos = previewData.establecimientos_detectados || {};
 const casos = previewData.casos_detectados || {};

 return (
   <div className="space-y-6">
     {/* Estadísticas principales */}
     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
         <div className="flex items-center space-x-2">
           <MdAssignment className="h-5 w-5 text-blue-500" />
           <span className="font-medium text-blue-900">Total Registros</span>
         </div>
         <p className="text-2xl font-bold text-blue-600 mt-1">
           {previewData.total_registros?.toLocaleString()}
         </p>
       </div>
       
       <div className="bg-green-50 border border-green-200 rounded-lg p-4">
         <div className="flex items-center space-x-2">
           <MdCheckCircle className="h-5 w-5 text-green-500" />
           <span className="font-medium text-green-900">Formato</span>
         </div>
         <p className="text-lg font-semibold text-green-600 mt-1">
           {previewData.formato || 'CSV'}
         </p>
       </div>
       
       <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
         <div className="flex items-center space-x-2">
           <MdCalendarToday className="h-5 w-5 text-purple-500" />
           <span className="font-medium text-purple-900">Fecha Detectada</span>
         </div>
         <p className="text-lg font-semibold text-purple-600 mt-1">
           {previewData.fecha_corte_detectada 
             ? new Date(previewData.fecha_corte_detectada).toLocaleDateString('es-ES')
             : 'No detectada'
           }
         </p>
       </div>

       <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
         <div className="flex items-center space-x-2">
           <MdBusiness className="h-5 w-5 text-amber-500" />
           <span className="font-medium text-amber-900">Establecimiento</span>
         </div>
         <p className="text-sm font-semibold text-amber-600 mt-1">
           {establecimientos.establecimiento_principal?.nombre_identificado || 'No identificado'}
         </p>
       </div>
     </div>

     {/* Información detallada de establecimientos */}
     {establecimientos.establecimientos && establecimientos.establecimientos.length > 0 && (
       <div className="bg-gray-50 rounded-lg p-4">
         <h4 className="font-medium text-gray-900 mb-3">Establecimientos Detectados</h4>
         <div className="space-y-2">
           {establecimientos.establecimientos.map((est, index) => (
             <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
               <div>
                 <span className="font-medium">{est.nombre_identificado || est.nombre}</span>
                 <span className="text-sm text-gray-500 ml-2">({est.codigo})</span>
               </div>
               <div className="text-right">
                 <div className="font-semibold">{est.cantidad_registros.toLocaleString()}</div>
                 <div className="text-xs text-gray-500">{est.porcentaje}%</div>
               </div>
             </div>
           ))}
         </div>
       </div>
     )}

     {/* Casos detectados */}
     {casos.tipos_casos && Object.keys(casos.tipos_casos).length > 0 && (
       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
         <h4 className="font-medium text-yellow-900 mb-3 flex items-center">
           <MdWarning className="h-5 w-5 mr-2" />
           Casos Detectados para Revisión
         </h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
           {Object.entries(casos.tipos_casos).map(([tipo, info]) => (
             <div key={tipo} className={`p-3 rounded-lg ${
               info.es_positivo ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
             }`}>
               <div className="flex justify-between items-center">
                 <span className="text-sm font-medium">{info.descripcion}</span>
                 <span className={`font-bold ${info.es_positivo ? 'text-green-600' : 'text-red-600'}`}>
                   {info.cantidad.toLocaleString()}
                 </span>
               </div>
               <div className="text-xs text-gray-600 mt-1">
                 {info.porcentaje}% del total
               </div>
             </div>
           ))}
         </div>
       </div>
     )}

     {/* Formulario de configuración */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
           Fecha de Corte *
         </label>
         <input
           type="date"
           value={fechaCorte}
           onChange={(e) => setFechaCorte(e.target.value)}
           className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
           required
         />
         <p className="text-xs text-gray-500 mt-1">
           {previewData.fecha_corte_detectada 
             ? 'Fecha detectada automáticamente. Puedes modificarla si es necesario.'
             : 'No se pudo detectar automáticamente. Ingresa la fecha del corte.'
           }
         </p>
       </div>

       <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
           Establecimiento Principal
         </label>
         <input
           type="text"
           value={establecimiento}
           onChange={(e) => setEstablecimiento(e.target.value)}
           placeholder="Nombre del establecimiento"
           className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
         />
         <p className="text-xs text-gray-500 mt-1">
           {establecimientos.establecimiento_principal?.nombre_identificado
             ? 'Establecimiento detectado automáticamente'
             : 'No se pudo identificar. Ingresa el nombre si es necesario.'
           }
         </p>
       </div>
     </div>

     {/* Calidad de datos */}
     {estadisticas.calidad_datos && (
       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
         <h4 className="font-medium text-blue-900 mb-3">Calidad de Datos</h4>
         <div className="flex items-center space-x-4">
           <div className="flex-1">
             <div className="flex justify-between text-sm mb-1">
               <span>Completitud</span>
               <span>{estadisticas.calidad_datos.completitud}%</span>
             </div>
             <div className="w-full bg-blue-200 rounded-full h-2">
               <div
                 className="bg-blue-500 h-2 rounded-full transition-all"
                 style={{ width: `${estadisticas.calidad_datos.completitud}%` }}
               />
             </div>
           </div>
           <div className="text-sm text-gray-600">
             {estadisticas.calidad_datos.campos_vacios.toLocaleString()} campos vacíos
           </div>
         </div>
       </div>
     )}

     {/* Botones de acción */}
     <div className="flex space-x-4">
       <button
         onClick={onUpload}
         disabled={uploading || analyzing || !fechaCorte}
         className="flex-1 bg-violet-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
       >
         {uploading ? (
           <div className="flex items-center justify-center space-x-2">
             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
             <span>Procesando Corte...</span>
           </div>
         ) : (
           <div className="flex items-center justify-center space-x-2">
             <MdCloudUpload className="h-5 w-5" />
             <span>Procesar Corte FONASA</span>
           </div>
         )}
       </button>
       <button
         onClick={onCancel}
         disabled={uploading}
         className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
       >
         Cancelar
       </button>
     </div>
   </div>
 );
}

// Modal de duplicado
function DuplicateModal({ duplicateInfo, onConfirm, onReplace, onCancel }) {
 return (
   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
     <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4">
       <div className="p-6">
         <div className="flex items-center space-x-3 mb-4">
           <MdWarning className="h-8 w-8 text-amber-500" />
           <h3 className="text-lg font-semibold text-gray-900">
             Corte Duplicado Detectado
           </h3>
         </div>
         
         <div className="mb-6">
           <p className="text-gray-600 mb-4">
             Ya existe un corte procesado para esta fecha y establecimiento:
           </p>
           
           <div className="bg-gray-50 rounded-lg p-4 space-y-2">
             <div className="flex justify-between">
               <span className="text-gray-600">Archivo:</span>
               <span className="font-medium">{duplicateInfo.filename}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-gray-600">Fecha de corte:</span>
               <span className="font-medium">
                 {new Date(duplicateInfo.fecha_corte).toLocaleDateString('es-ES')}
               </span>
             </div>
             <div className="flex justify-between">
               <span className="text-gray-600">Procesado:</span>
               <span className="font-medium">
                 {new Date(duplicateInfo.fecha_procesamiento).toLocaleDateString('es-ES')}
               </span>
             </div>
             <div className="flex justify-between">
               <span className="text-gray-600">Registros:</span>
               <span className="font-medium">{duplicateInfo.total_registros.toLocaleString()}</span>
             </div>
           </div>
         </div>

         <div className="flex space-x-3">
           <button
             onClick={onReplace}
             className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
           >
             Reemplazar Archivo
           </button>
           <button
             onClick={onConfirm}
             className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
           >
             Mantener Ambos
           </button>
           <button
             onClick={onCancel}
             className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
           >
             Cancelar
           </button>
         </div>
       </div>
     </div>
   </div>
 );
}

// Componente de resultados
function UploadResults({ result, onReset }) {
 if (!result) return null;

 return (
   <div className={`rounded-xl p-6 ${
     result.success 
       ? 'bg-green-50 border border-green-200' 
       : result.warning
       ? 'bg-yellow-50 border border-yellow-200'
       : 'bg-red-50 border border-red-200'
   }`}>
     <div className="flex items-start space-x-3">
       {result.success ? (
         <MdCheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
       ) : result.warning ? (
         <MdWarning className="h-6 w-6 text-yellow-500 mt-0.5" />
       ) : (
         <MdError className="h-6 w-6 text-red-500 mt-0.5" />
       )}
       <div className="flex-1">
         <h3 className={`font-medium ${
           result.success ? 'text-green-900' : 
           result.warning ? 'text-yellow-900' : 'text-red-900'
         }`}>
           {result.success ? '¡Corte procesado exitosamente!' : 
            result.warning ? 'Advertencia' : 'Error al procesar corte'}
         </h3>
         <p className={`mt-1 text-sm ${
           result.success ? 'text-green-700' : 
           result.warning ? 'text-yellow-700' : 'text-red-700'
         }`}>
           {result.success 
             ? `Se procesaron ${result.total_registros?.toLocaleString()} registros del corte ${result.establecimiento || ''}.`
             : result.warning || result.error || 'Error desconocido'
           }
         </p>
         
         {result.success && (
           <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="text-center">
               <div className="text-2xl font-bold text-green-600">
                 {result.total_registros?.toLocaleString() || 0}
               </div>
               <div className="text-sm text-green-700">Total Registros</div>
             </div>
             <div className="text-center">
               <div className="text-2xl font-bold text-blue-600">
                 {result.nuevos_inscritos || 0}
               </div>
               <div className="text-sm text-blue-700">Nuevos Inscritos</div>
             </div>
             <div className="text-center">
               <div className="text-2xl font-bold text-yellow-600">
                 {result.rechazos_previsionales || 0}
               </div>
               <div className="text-sm text-yellow-700">Rechazos Previsionales</div>
             </div>
             <div className="text-center">
               <div className="text-2xl font-bold text-red-600">
                 {result.traslados_negativos || 0}
               </div>
               <div className="text-sm text-red-700">Traslados Negativos</div>
             </div>
           </div>
         )}

         {result.success && (
           <div className="mt-4 pt-4 border-t border-green-200">
             <button
               onClick={onReset}
               className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
             >
               Procesar Otro Corte
             </button>
           </div>
         )}
       </div>
     </div>
   </div>
 );
}

// Componente de archivos procesados
function ProcessedFiles({ files, isLoading, onReload }) {
 return (
   <div className="bg-white rounded-xl shadow-sm border border-gray-200">
     <div className="px-6 py-4 border-b border-gray-200">
       <div className="flex items-center justify-between">
         <div>
           <h2 className="text-lg font-semibold text-gray-900">Cortes Procesados</h2>
           <p className="text-sm text-gray-500 mt-1">Historial de cortes FONASA cargados</p>
         </div>
         <button
           onClick={onReload}
           disabled={isLoading}
           onClick={onReload}
           disabled={isLoading}
           className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
         >
           <MdRefresh className={isLoading ? 'animate-spin' : ''} />
           <span>Actualizar</span>
         </button>
       </div>
     </div>
     
     <div className="p-6">
       {isLoading ? (
         <div className="flex items-center justify-center py-8">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
           <span className="ml-3 text-gray-500">Cargando archivos...</span>
         </div>
       ) : files.length === 0 ? (
         <div className="text-center py-8">
           <MdDescription className="h-12 w-12 text-gray-300 mx-auto mb-4" />
           <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cortes procesados</h3>
           <p className="text-gray-500">Los cortes que subas aparecerán aquí</p>
         </div>
       ) : (
         <div className="space-y-4">
           {files.map((archivo) => (
             <ArchiveCard key={archivo.id} archivo={archivo} />
           ))}
         </div>
       )}
     </div>
   </div>
 );
}

// Componente de tarjeta de archivo
function ArchiveCard({ archivo }) {
 const fechaCorte = new Date(archivo.fecha_corte).toLocaleDateString('es-ES', {
   year: 'numeric',
   month: 'long',
   day: 'numeric'
 });
 
 const fechaProcesamiento = new Date(archivo.fecha_procesamiento).toLocaleDateString('es-ES');
 
 const getEstadoColor = (estado) => {
   switch (estado) {
     case 'completado':
       return 'bg-green-100 text-green-800 border-green-200';
     case 'procesando':
       return 'bg-blue-100 text-blue-800 border-blue-200';
     case 'error':
       return 'bg-red-100 text-red-800 border-red-200';
     default:
       return 'bg-gray-100 text-gray-800 border-gray-200';
   }
 };

 const getEstadoTexto = (estado) => {
   switch (estado) {
     case 'completado': return 'Completado';
     case 'procesando': return 'Procesando';
     case 'error': return 'Error';
     default: return 'Pendiente';
   }
 };

 return (
   <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200">
     <div className="flex items-start justify-between">
       <div className="flex items-start space-x-4">
         <div className="p-3 bg-blue-50 rounded-lg">
           <MdDescription className="h-6 w-6 text-blue-600" />
         </div>
         
         <div className="flex-1 min-w-0">
           <div className="flex items-center space-x-3 mb-2">
             <h4 className="font-semibold text-gray-900 truncate">{archivo.filename}</h4>
             <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(archivo.estado_procesamiento)}`}>
               {getEstadoTexto(archivo.estado_procesamiento)}
             </span>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
             <div className="space-y-1">
               <div className="flex items-center text-sm text-gray-600">
                 <MdCalendarToday className="h-4 w-4 mr-2" />
                 <span>Corte: {fechaCorte}</span>
               </div>
               <div className="flex items-center text-sm text-gray-600">
                 <MdBusiness className="h-4 w-4 mr-2" />
                 <span>{archivo.establecimiento || 'No especificado'}</span>
               </div>
             </div>
             
             <div className="space-y-1">
               <div className="text-sm text-gray-600">
                 Procesado: {fechaProcesamiento}
               </div>
               <div className="text-sm text-gray-600">
                 Formato: {archivo.formato}
               </div>
             </div>
           </div>

           {/* Estadísticas */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             <div className="text-center p-2 bg-gray-50 rounded-lg">
               <div className="text-lg font-bold text-gray-900">
                 {archivo.total_registros?.toLocaleString()}
               </div>
               <div className="text-xs text-gray-600">Total</div>
             </div>
             
             {archivo.nuevos_inscritos > 0 && (
               <div className="text-center p-2 bg-green-50 rounded-lg">
                 <div className="text-lg font-bold text-green-600">
                   {archivo.nuevos_inscritos}
                 </div>
                 <div className="text-xs text-green-700">Nuevos</div>
               </div>
             )}
             
             {archivo.rechazos_previsionales > 0 && (
               <div className="text-center p-2 bg-yellow-50 rounded-lg">
                 <div className="text-lg font-bold text-yellow-600">
                   {archivo.rechazos_previsionales}
                 </div>
                 <div className="text-xs text-yellow-700">Rechazos</div>
               </div>
             )}
             
             {archivo.traslados_negativos > 0 && (
               <div className="text-center p-2 bg-red-50 rounded-lg">
                 <div className="text-lg font-bold text-red-600">
                   {archivo.traslados_negativos}
                 </div>
                 <div className="text-xs text-red-700">Traslados -</div>
               </div>
             )}
           </div>
         </div>
       </div>
       
       {/* Acciones */}
       <div className="flex items-center space-x-2 ml-4">
         <button
           className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
           title="Descargar reporte"
         >
           <MdDownload className="h-5 w-5" />
         </button>
         <button
           className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
           title="Ver detalles"
         >
           <MdInfo className="h-5 w-5" />
         </button>
         <button
           className="p-2 text-gray-400 hover:text-red-500 transition-colors"
           title="Eliminar archivo"
         >
           <MdDelete className="h-5 w-5" />
         </button>
       </div>
     </div>
   </div>
 );
}