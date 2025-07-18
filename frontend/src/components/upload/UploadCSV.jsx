// src/components/UploadCSV.jsx
import { useState, useEffect } from 'react';
import DeleteConfirmModal from './common/DeleteConfirmModal';
import FileDropzone from './upload/FileDropzone';
import FileInfo from './upload/FileInfo';
import FileAnalysis from './upload/FileAnalysis';
import DuplicateWarning from './upload/DuplicateWarning';
import DetectedCases from './upload/DetectedCases';
import UploadProgress from './upload/UploadProgress';
import UploadResults from './upload/UploadResults';
import ProcessedFiles from './upload/ProcessedFiles';

export default function UploadCSV() {
  const [file, setFile] = useState(null);
  const [fechaCorte, setFechaCorte] = useState('');
  const [fechaCorteDetectada, setFechaCorteDetectada] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [result, setResult] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [loadingArchivos, setLoadingArchivos] = useState(true);
  const [previewData, setPreviewData] = useState(null);
  const [detectedCases, setDetectedCases] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Cargar archivos procesados al montar el componente
  useEffect(() => {
    cargarArchivos();
  }, []);

  // Analizar archivo cuando se selecciona
  useEffect(() => {
    if (file) {
      analizarArchivo();
    }
  }, [file]);

  const cargarArchivos = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/percapita/archivos-procesados');
      const data = await response.json();
      setArchivos(data.archivos || []);
    } catch (error) {
      console.error('Error cargando archivos:', error);
    } finally {
      setLoadingArchivos(false);
    }
  };

  const verificarDuplicado = (fechaCorte) => {
    if (!fechaCorte || archivos.length === 0) return null;
    
    // Analizar la fecha una sola vez
    const fechaAnalizar = new Date(fechaCorte);
    
    // Opción 1: Verificar por fecha exacta (precisión de día)
    const coincidenciaExacta = archivos.find(archivo => {
      return new Date(archivo.fecha_corte).toISOString().split('T')[0] === 
             fechaAnalizar.toISOString().split('T')[0];
    });
    
    if (coincidenciaExacta) {
      return { ...coincidenciaExacta, tipoDuplicado: 'exacto' };
    }
    
    // Opción 2: Verificar por mes-año (implementación actual)
    const mesAnalizar = fechaAnalizar.getFullYear() + '-' + 
                       String(fechaAnalizar.getMonth() + 1).padStart(2, '0');
    
    const coincidenciaMes = archivos.find(archivo => {
      const fechaExistente = new Date(archivo.fecha_corte);
      const mesExistente = fechaExistente.getFullYear() + '-' + 
                           String(fechaExistente.getMonth() + 1).padStart(2, '0');
      return mesExistente === mesAnalizar;
    });
    
    if (coincidenciaMes) {
      return { ...coincidenciaMes, tipoDuplicado: 'mes' };
    }
    
    return null;
  };

  const analizarArchivo = async () => {
    if (!file) return;
    
    setAnalyzing(true);
    setPreviewData(null);
    setDetectedCases(null);
    setFechaCorteDetectada(null);
    setDuplicateWarning(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:8000/api/percapita/preview-csv', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setPreviewData(data);
      
      if (data.fecha_corte_detectada) {
        setFechaCorteDetectada(data.fecha_corte_detectada);
        setFechaCorte(data.fecha_corte_detectada);
        
        // Mostrar estado de verificación de duplicados
        setCheckingDuplicates(true);
        
        // Pequeño timeout para permitir que se actualice la UI
        setTimeout(() => {
          // Verificar si ya existe un archivo con este corte
          const duplicado = verificarDuplicado(data.fecha_corte_detectada);
          if (duplicado) {
            setDuplicateWarning(duplicado);
          }
          setCheckingDuplicates(false);
        }, 500);
      }

      // Detectar casos problemáticos
      if (data.casos_detectados) {
        setDetectedCases(data.casos_detectados);
      }
    } catch (error) {
      console.error('Error analizando archivo:', error);
      setCheckingDuplicates(false);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileSelect = (selectedFile, error = null) => {
    if (error) {
      setResult({ error });
      return;
    }
    setFile(selectedFile);
    setResult(null);
  };

  const handleUpload = async (sustituir = false) => {
    if (!file) return;
    
    setUploading(true);
    setResult(null);
    
    const formData = new FormData();
    formData.append('file', file);
    if (fechaCorte) {
      formData.append('fecha_corte', fechaCorte);
    }
    if (sustituir && duplicateWarning) {
      formData.append('sustituir_archivo_id', duplicateWarning.id);
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/percapita/upload-csv', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        await cargarArchivos();
        setDuplicateWarning(null);
      }
    } catch (error) {
      setResult({ error: 'Error al subir el archivo. Verifica la conexión con el servidor.' });
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setFechaCorte('');
    setFechaCorteDetectada(null);
    setPreviewData(null);
    setDetectedCases(null);
    setDuplicateWarning(null);
    setResult(null);
    setUploading(false);
  };

  const confirmarEliminacion = async () => {
    if (!showDeleteConfirm) return;
    
    try {
      await fetch(`http://localhost:8000/api/percapita/archivos-procesados/${showDeleteConfirm}`, {
        method: 'DELETE'
      });
      await cargarArchivos();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error eliminando archivo:', error);
    }
  };

  const getFileType = (filename) => {
    const name = filename.toLowerCase();
    if (name.endsWith('.csv')) return 'CSV';
    if (name.endsWith('.txt')) return 'TXT';
    if (name.endsWith('.xls')) return 'Excel 97';
    if (name.endsWith('.xlsx')) return 'Excel';
    return 'Desconocido';
  };

  return (
    <div className="space-y-6">
      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        isOpen={!!showDeleteConfirm}
        onConfirm={confirmarEliminacion}
        onCancel={() => setShowDeleteConfirm(null)}
      />

      {/* Información compacta de formatos */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-800">Formatos: CSV, TXT, Excel (XLS/XLSX)</h3>
            <p className="text-xs text-blue-600 mt-1">Máximo 50 MB • Detección automática de duplicados y casos problemáticos</p>
          </div>
          <div className="text-2xl">📊</div>
        </div>
      </div>

      {/* Área de subida */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6">
          {!file ? (
            <FileDropzone
              onFileSelect={handleFileSelect}
              disabled={uploading || analyzing}
            />
          ) : (
            <div className="space-y-4">
              {/* Información del archivo */}
              <FileInfo
                file={file}
                onRemove={resetUpload}
                disabled={uploading || analyzing}
              />

              {/* Análisis del archivo */}
              <FileAnalysis
                isAnalyzing={analyzing}
                isCheckingDuplicates={checkingDuplicates}
                previewData={duplicateWarning ? null : previewData}
              />

              {/* Alerta de duplicado */}
              <DuplicateWarning
                duplicateFile={duplicateWarning}
                onSubstitute={() => handleUpload(true)}
                onCancel={resetUpload}
                isUploading={uploading}
              />

              {/* Casos detectados */}
              <DetectedCases cases={duplicateWarning ? null : detectedCases} />

              {/* Botones de acción */}
              {!duplicateWarning && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleUpload(false)}
                    disabled={uploading || analyzing || checkingDuplicates}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Procesando...</span>
                      </div>
                    ) : (
                      `Procesar ${getFileType(file.name)}`
                    )}
                  </button>
                  <button
                    onClick={resetUpload}
                    disabled={uploading || analyzing || checkingDuplicates}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Barra de progreso */}
      <UploadProgress isUploading={uploading} />

      {/* Resultados */}
      <UploadResults result={result} onReset={resetUpload} />

      {/* Archivos procesados */}
      <ProcessedFiles
        files={archivos}
        isLoading={loadingArchivos}
        onDelete={setShowDeleteConfirm}
      />
    </div>
  );
}