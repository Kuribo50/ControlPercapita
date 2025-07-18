// src/components/upload/ProcessedFiles.jsx
export default function ProcessedFiles({ files, isLoading, onDelete }) {
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-CL');
    } catch {
      return dateStr;
    }
  };

  const getFileIcon = (filename) => {
    const name = filename.toLowerCase();
    if (name.endsWith('.csv')) return '📄';
    if (name.endsWith('.txt')) return '📝';
    if (name.endsWith('.xls') || name.endsWith('.xlsx')) return '📊';
    return '📁';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Archivos Procesados</h3>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📁</div>
            <p>No hay archivos procesados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((archivo) => (
              <div key={archivo.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="text-xl">{getFileIcon(archivo.filename)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{archivo.filename}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span>Corte: {formatDate(archivo.fecha_corte)}</span>
                      </span>
                      <span>•</span>
                      <span>{archivo.formato}</span>
                      <span>•</span>
                      <span>{archivo.registros.toLocaleString()} registros</span>
                      {archivo.casos_detectados && (
                        <>
                          <span>•</span>
                          <span className="text-red-600 font-medium">
                            {Object.values(archivo.casos_detectados).reduce((total, count) => total + count, 0)} casos
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Botón para ver detalles de casos */}
                  {archivo.casos_detectados && Object.values(archivo.casos_detectados).some(count => count > 0) && (
                    <button
                      onClick={() => window.location.href = `/archivo/${archivo.id}/casos`}
                      className="text-yellow-600 hover:text-yellow-800 p-1"
                      title="Ver casos detectados"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(archivo.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                    title="Eliminar archivo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}