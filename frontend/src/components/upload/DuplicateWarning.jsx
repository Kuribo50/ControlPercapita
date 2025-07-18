// src/components/upload/DuplicateWarning.jsx
export default function DuplicateWarning({ duplicateFile, onSubstitute, onCancel, isUploading }) {
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-CL');
    } catch {
      return dateStr;
    }
  };

  const getMonthYear = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
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

  if (!duplicateFile) return null;

  // Determinar tipo de advertencia y mensaje
  const esDuplicadoExacto = duplicateFile.tipoDuplicado === 'exacto';
  const tituloDuplicado = esDuplicadoExacto
    ? `⚠️ Ya existe un archivo procesado con exactamente la misma fecha de corte (${formatDate(duplicateFile.fecha_corte)})`
    : `⚠️ Ya existe un archivo procesado para ${getMonthYear(duplicateFile.fecha_corte)}`;

  const mensajeDuplicado = esDuplicadoExacto
    ? 'El sistema ha detectado que ya existe un archivo con la misma fecha de corte exacta.'
    : 'El sistema ha detectado que ya existe un archivo para el mismo mes y año.';

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="text-amber-500 mt-0.5">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-amber-800 mb-2">
            {tituloDuplicado}
          </h4>
          <p className="text-xs text-amber-700 mb-2">{mensajeDuplicado}</p>
          <div className="bg-white border border-amber-200 rounded p-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getFileIcon(duplicateFile.filename)}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{duplicateFile.filename}</p>
                  <p className="text-xs text-gray-500">
                    {duplicateFile.registros.toLocaleString()} registros • Corte: {formatDate(duplicateFile.fecha_corte)}
                  </p>
                </div>
              </div>
              <div className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                Archivo existente
              </div>
            </div>
          </div>
          <p className="text-sm text-amber-700 mb-4">
            ¿Qué acción deseas realizar?
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onSubstitute}
              disabled={isUploading}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Sustituyendo...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Sustituir archivo
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={isUploading}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}