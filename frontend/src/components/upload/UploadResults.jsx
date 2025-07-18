// src/components/upload/UploadResults.jsx
export default function UploadResults({ result, onReset }) {
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-CL');
    } catch {
      return dateStr;
    }
  };

  if (!result) return null;

  return (
    <div className={`border rounded-lg p-6 ${
      result.error 
        ? 'bg-red-50 border-red-200' 
        : 'bg-green-50 border-green-200'
    }`}>
      {result.error ? (
        <div className="flex items-start">
          <div className="text-red-400 mr-3">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-red-800">Error al procesar archivo</h3>
            <p className="mt-1 text-sm text-red-700">{result.error}</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center mb-4">
            <div className="text-green-400 mr-3">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-green-800">
                Archivo procesado exitosamente
              </h3>
              <div className="flex items-center space-x-4 text-sm text-green-700">
                <span>Fecha de corte: {formatDate(result.fecha_corte)}</span>
                {result.fecha_corte_detectada && (
                  <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs">
                    🤖 Detectada automáticamente
                  </span>
                )}
                {result.sustituido && (
                  <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded text-xs">
                    🔄 Archivo sustituido
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-3 border border-green-200 text-center">
              <div className="text-lg font-bold text-gray-900">{result.total_registros?.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200 text-center">
              <div className="text-lg font-bold text-green-600">{result.nuevos_inscritos?.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Nuevos</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200 text-center">
              <div className="text-lg font-bold text-yellow-600">{result.traslados_negativos?.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Traslados</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200 text-center">
              <div className="text-lg font-bold text-red-600">{result.rechazos_previsionales?.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Rechazos</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <a href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              Dashboard
            </a>
            <a href="/casos-revisar" className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700">
              Casos ({result.traslados_negativos + result.rechazos_previsionales})
            </a>
            <a href="/casos-sin-centro" className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700">
              Sin Centro ({result.sin_centro || 0})
            </a>
            <a href="/casos-centro-mal" className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700">
              Centro Mal ({result.centro_mal || 0})
            </a>
            <a href="/solo-rechazos" className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600">
              Solo Rechazos ({result.rechazos_previsionales})
            </a>
            <a href="/solo-traslados" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
              Solo Traslados ({result.traslados_negativos})
            </a>
            <a href="/usuarios-nuevos" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
              Nuevos ({result.nuevos_inscritos})
            </a>
            <button onClick={onReset} className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700">
              Otro Archivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}