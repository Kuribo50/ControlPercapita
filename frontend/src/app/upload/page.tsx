// src/app/upload/page.tsx (versión mejorada y responsiva)
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { 
  MdCloudUpload, 
  MdDescription, 
  MdEdit,
  MdDelete,
  MdCalendarToday,
  MdLocalHospital,
  MdPeople,
  MdClose,
  MdCheckCircle,
  MdError,
  MdVisibility
} from "react-icons/md";

// ... interfaces anteriores ...

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [archivos, setArchivos] = useState<ArchivoProcessed[]>([]);
  const [loadingArchivos, setLoadingArchivos] = useState(true);
  const [selectedFile, setSelectedFile] = useState<ArchivoProcessed | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ... funciones anteriores ...

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Gestión de Archivos Percápita
          </h1>
          <p className="text-gray-600">
            Sube y administra los cortes de datos FONASA
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Panel de Subida - Izquierda */}
          <div className="xl:col-span-5">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <MdCloudUpload className="w-5 h-5 mr-2 text-blue-600" />
                Subir Nuevo Corte
              </h2>

              {/* Drag & Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragOver
                    ? 'border-blue-400 bg-blue-50'
                    : file
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={() => setDragOver(false)}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="space-y-4">
                  {!file ? (
                    <>
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                        <MdCloudUpload className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          Arrastra tu archivo aquí
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          o <span className="text-blue-600 font-medium cursor-pointer">haz clic para seleccionar</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Formatos soportados: .txt, .csv (máximo 50MB)
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                        <MdDescription className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setFile(null);
                          setPreviewData(null);
                          setResult(null);
                        }}
                        className="inline-flex items-center space-x-1 text-sm text-red-600 hover:text-red-800"
                      >
                        <MdClose className="w-4 h-4" />
                        <span>Remover</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {uploading && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Procesando archivo...
                    </span>
                    <span className="text-sm text-gray-500">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Preview Data */}
              {previewData && (
                <div className="mt-6 space-y-4">
                  {previewData.validacion_ok ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <MdCheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Archivo válido</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <MdCalendarToday className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">Fecha:</span>
                            <span className="font-medium">{previewData.fecha_corte_detectada}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MdLocalHospital className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">Centro:</span>
                            <span className="font-medium text-xs">
                              {previewData.establecimientos_detectados?.establecimiento_principal?.nombre_identificado || "No identificado"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <MdPeople className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">Registros:</span>
                            <span className="font-medium">{previewData.total_registros.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleSubmit}
                        disabled={uploading}
                        className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <MdCloudUpload className="w-4 h-4" />
                        <span>{uploading ? "Procesando..." : "Subir Corte"}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <MdError className="w-5 h-5 text-red-600" />
                        <span className="font-medium text-red-800">Error de validación</span>
                      </div>
                      <p className="text-sm text-red-700">{previewData.error}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Result */}
              {result && (
                <div className={`mt-6 p-4 rounded-lg ${
                  result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {result.success ? (
                      <MdCheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <MdError className="w-5 h-5 text-red-600" />
                    )}
                    <p className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                      {result.success ? "¡Corte procesado exitosamente!" : "Error al procesar"}
                    </p>
                  </div>
                  {result.success && (
                    <p className={`text-sm ${result.success ? "text-green-700" : "text-red-700"}`}>
                      {result.total_registros?.toLocaleString()} registros de {result.establecimiento}
                    </p>
                  )}
                  {!result.success && <p className="text-sm text-red-700">{result.error}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Lista de Archivos - Derecha */}
          <div className="xl:col-span-7">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Archivos Procesados</h2>
              </div>

              <div className="p-6">
                {loadingArchivos ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-100 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : archivos.length === 0 ? (
                  <div className="text-center py-12">
                    <MdDescription className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay archivos procesados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {archivos.map((archivo) => (
                      <div
                        key={archivo.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <MdDescription className="w-5 h-5 text-gray-400 flex-shrink-0" />
                              <h3 className="font-medium text-gray-900 truncate">
                                {archivo.filename}
                              </h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                archivo.estado_procesamiento === 'completado' 
                                  ? 'bg-green-100 text-green-800'
                                  : archivo.estado_procesamiento === 'procesando'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {archivo.estado_procesamiento}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <MdCalendarToday className="w-3 h-3" />
                                <span>{archivo.fecha_corte}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MdPeople className="w-3 h-3" />
                                <span>{archivo.total_registros.toLocaleString()} reg.</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MdLocalHospital className="w-3 h-3" />
                                <span className="truncate">{archivo.establecimiento}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(archivo.fecha_procesamiento).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                              onClick={() => setSelectedFile(archivo)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver detalles"
                            >
                              <MdVisibility className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors">
                              <MdEdit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <MdDelete className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalles del archivo */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Detalles del Archivo</h3>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <MdClose className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {/* Contenido del modal con detalles del archivo */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre del archivo</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedFile.filename}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de corte</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedFile.fecha_corte}</p>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Estado</label>
                   <p className="mt-1">
                     <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                       selectedFile.estado_procesamiento === 'completado' 
                         ? 'bg-green-100 text-green-800'
                         : selectedFile.estado_procesamiento === 'procesando'
                         ? 'bg-blue-100 text-blue-800'
                         : 'bg-red-100 text-red-800'
                     }`}>
                       {selectedFile.estado_procesamiento}
                     </span>
                   </p>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Total de registros</label>
                   <p className="mt-1 text-sm text-gray-900">{selectedFile.total_registros.toLocaleString()}</p>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Establecimiento</label>
                   <p className="mt-1 text-sm text-gray-900">{selectedFile.establecimiento}</p>
                 </div>
               </div>

               <div className="grid grid-cols-3 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Nuevos inscritos</label>
                   <p className="mt-1 text-sm text-green-600 font-medium">{selectedFile.nuevos_inscritos}</p>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Rechazos previsionales</label>
                   <p className="mt-1 text-sm text-red-600 font-medium">{selectedFile.rechazos_previsionales}</p>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Traslados negativos</label>
                   <p className="mt-1 text-sm text-orange-600 font-medium">{selectedFile.traslados_negativos}</p>
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700">Fecha de procesamiento</label>
                 <p className="mt-1 text-sm text-gray-900">
                   {new Date(selectedFile.fecha_procesamiento).toLocaleString()}
                 </p>
               </div>
             </div>
           </div>
         </div>
       </div>
     )}
   </div>
 );
}