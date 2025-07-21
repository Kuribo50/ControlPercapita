// src/app/(app)/upload/page.tsx (REDISEÑADO estilo modal de la imagen)
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
  MdClose
} from "react-icons/md";

interface ArchivoProcessed {
  id: string;
  filename: string;
  fecha_corte: string;
  fecha_procesamiento: string;
  total_registros: number;
  nuevos_inscritos: number;
  rechazos_previsionales: number;
  traslados_negativos: number;
  estado_procesamiento: string;
  establecimiento: string;
  codigo_establecimiento: string;
}

interface UploadResult {
  success: boolean;
  archivo_id?: string;
  filename?: string;
  fecha_corte?: string;
  establecimiento?: string;
  total_registros?: number;
  error?: string;
}

interface PreviewData {
  validacion_ok: boolean;
  total_registros: number;
  fecha_corte_detectada: string;
  establecimientos_detectados: {
    establecimiento_principal: {
      nombre_identificado: string;
      codigo: string;
      nombre: string;
      cantidad_registros: number;
    };
  };
  error?: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [archivos, setArchivos] = useState<ArchivoProcessed[]>([]);
  const [loadingArchivos, setLoadingArchivos] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar archivos procesados
  const cargarArchivos = useCallback(async () => {
    try {
      setLoadingArchivos(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/percapita/archivos-procesados`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setArchivos(data.archivos || []);
    } catch (error) {
      console.error("Error cargando archivos:", error);
    } finally {
      setLoadingArchivos(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.assign("/login");
      return;
    }
    
    cargarArchivos();
  }, [cargarArchivos]);

  // Simular progreso de subida
  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return interval;
  };

  // Manejo de drag & drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setUploadProgress(0);
    
    // Previsualizar archivo
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/percapita/preview-csv`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPreviewData(data);
    } catch (error: any) {
      console.error("Error previewing file:", error);
      setPreviewData({
        validacion_ok: false,
        total_registros: 0,
        fecha_corte_detectada: "",
        establecimientos_detectados: { establecimiento_principal: null },
        error: error.response?.data?.detail || "Error al procesar archivo"
      });
    }
  };

  const handleSubmit = async () => {
    if (!file || !previewData) return;

    const formData = new FormData();
    formData.append("file", file);
    
    if (previewData.fecha_corte_detectada) {
      formData.append("fecha_corte", previewData.fecha_corte_detectada);
    }
    
    if (previewData.establecimientos_detectados?.establecimiento_principal?.nombre_identificado) {
      formData.append("establecimiento", previewData.establecimientos_detectados.establecimiento_principal.nombre_identificado);
    }

    try {
      setUploading(true);
      const progressInterval = simulateProgress();
      const token = localStorage.getItem("token");
      
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/percapita/upload-csv`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setResult({
        success: true,
        ...data,
      });
      
      // Recargar lista de archivos
      setTimeout(() => {
        cargarArchivos();
        resetForm();
      }, 1500);
    } catch (error: any) {
      setUploadProgress(0);
      setResult({
        success: false,
        error: error.response?.data?.detail || "Error al subir archivo",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewData(null);
    setResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const deleteArchivo = async (archivoId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este corte?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/percapita/archivos-procesados/${archivoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cargarArchivos();
    } catch (error) {
      console.error("Error eliminando archivo:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      return <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">XL</div>;
    }
    if (filename.endsWith('.pptx') || filename.endsWith('.ppt')) {
      return <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">PP</div>;
    }
    return <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">W</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Subir Corte FONASA</h1>
            <p className="text-sm text-gray-500">Gestión de archivos de población inscrita</p>
          </div>
          <div className="text-sm text-gray-500">
            {archivos.length} cortes procesados
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Dropzone - Lado Izquierdo */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Upload file</h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <MdClose className="w-5 h-5" />
                </button>
              </div>

              {!file ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <MdCloudUpload className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-gray-600 mb-2">
                    Drop your file here, or{" "}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-500 hover:text-blue-600 font-medium"
                    >
                      Browse
                    </button>
                  </p>
                  <p className="text-xs text-gray-400">Maximum file size 50mb</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt,.xls,.xlsx"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Archivo seleccionado */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.name)}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">{file.name}</div>
                        <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                      </div>
                      {uploading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-12 text-xs text-gray-600">{Math.round(uploadProgress)}%</div>
                        </div>
                      ) : (
                        <button
                          onClick={resetForm}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <MdDelete className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {uploading && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vista previa */}
                  {previewData && previewData.validacion_ok && (
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <MdCalendarToday className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Fecha de Corte</span>
                        </div>
                        <div className="text-sm text-gray-900">
                          {new Date(previewData.fecha_corte_detectada).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <MdLocalHospital className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Establecimiento</span>
                        </div>
                        <div className="text-sm text-gray-900">
                          {previewData.establecimientos_detectados?.establecimiento_principal?.nombre_identificado || "No identificado"}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <MdPeople className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Registros</span>
                        </div>
                        <div className="text-sm text-gray-900">
                          {previewData.total_registros.toLocaleString()} usuarios
                        </div>
                      </div>

                      <button
                        onClick={handleSubmit}
                        disabled={uploading}
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {uploading ? "Procesando..." : "Subir Corte"}
                      </button>
                    </div>
                  )}

                  {/* Error */}
                  {previewData && !previewData.validacion_ok && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">{previewData.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Resultado */}
            {result && (
              <div className={`mt-4 p-4 rounded-lg ${
                result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}>
                <p className="font-medium">
                  {result.success ? "¡Corte procesado exitosamente!" : "Error al procesar"}
                </p>
                {result.success && (
                  <p className="text-sm mt-1">
                    {result.total_registros?.toLocaleString()} registros de {result.establecimiento}
                  </p>
                )}
                {!result.success && <p className="text-sm mt-1">{result.error}</p>}
              </div>
            )}
          </div>

          {/* Lista de Archivos - Lado Derecho */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Uploaded Files</h2>
              </div>

              <div className="p-6">
                {loadingArchivos ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Cargando archivos...</p>
                  </div>
                ) : archivos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MdDescription className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay cortes procesados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {archivos.map((archivo) => (
                      <div key={archivo.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center space-x-3 flex-1">
                          {getFileIcon(archivo.filename)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{archivo.filename}</div>
                            <div className="text-sm text-gray-500">
                              {archivo.establecimiento} • {new Date(archivo.fecha_corte).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {archivo.total_registros.toLocaleString()} usuarios
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            archivo.estado_procesamiento === "completado"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {archivo.estado_procesamiento === "completado" ? "100%" : "50%"}
                          </span>
                          
                          <div className="flex space-x-1">
                            <button 
                              className="text-gray-400 hover:text-blue-500"
                              title="Editar"
                            >
                              <MdEdit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteArchivo(archivo.id)}
                              className="text-gray-400 hover:text-red-500"
                              title="Eliminar"
                            >
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
    </div>
  );
}