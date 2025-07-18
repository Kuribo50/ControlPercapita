// src/components/upload/FileAnalysis.jsx
export default function FileAnalysis({ isAnalyzing, isCheckingDuplicates, previewData }) {
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-CL');
    } catch {
      return dateStr;
    }
  };

  if (isAnalyzing || isCheckingDuplicates) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-blue-800">
            {isCheckingDuplicates 
              ? "Verificando duplicados en el sistema..." 
              : "Analizando archivo..."}
          </span>
        </div>
      </div>
    );
  }

  if (!previewData) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h4 className="text-sm font-medium text-green-800 mb-2">Información Detectada</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
        <div>
          <span className="text-green-600">Registros:</span>
          <span className="ml-2 font-medium">{previewData.total_registros?.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-green-600">Columnas:</span>
          <span className="ml-2 font-medium">{previewData.columnas_detectadas}</span>
        </div>
        <div>
          <span className="text-green-600">Formato:</span>
          <span className="ml-2 font-medium">{previewData.file_format}</span>
        </div>
      </div>
      {previewData.fecha_corte_detectada && (
        <div className="mt-3 p-2 bg-green-100 rounded border border-green-300">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-sm font-medium text-green-800">
              Fecha de corte detectada: {formatDate(previewData.fecha_corte_detectada)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}