// src/components/upload/DetectedCases.jsx
export default function DetectedCases({ cases }) {
  const getCaseIcon = (tipo) => {
    const iconMap = {
      'sin_centro': '🏢',
      'centro_mal': '⚠️',
      'rechazos_previsionales': '❌',
      'traslados_negativos': '🔄',
      'datos_incompletos': '📝',
      'duplicados': '👥',
      'fechas_invalidas': '📅'
    };
    return iconMap[tipo] || '📋';
  };

  const getCaseColor = (tipo) => {
    const colorMap = {
      'sin_centro': 'bg-red-100 border-red-300 text-red-800',
      'centro_mal': 'bg-yellow-100 border-yellow-300 text-yellow-800',
      'rechazos_previsionales': 'bg-red-100 border-red-300 text-red-800',
      'traslados_negativos': 'bg-orange-100 border-orange-300 text-orange-800',
      'datos_incompletos': 'bg-blue-100 border-blue-300 text-blue-800',
      'duplicados': 'bg-purple-100 border-purple-300 text-purple-800',
      'fechas_invalidas': 'bg-gray-100 border-gray-300 text-gray-800'
    };
    return colorMap[tipo] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  const getCaseTitle = (tipo) => {
    const titleMap = {
      'sin_centro': 'Sin Centro Asignado',
      'centro_mal': 'Centro Mal Asignado',
      'rechazos_previsionales': 'Rechazos Previsionales',
      'traslados_negativos': 'Traslados Negativos',
      'datos_incompletos': 'Datos Incompletos',
      'duplicados': 'Registros Duplicados',
      'fechas_invalidas': 'Fechas Inválidas'
    };
    return titleMap[tipo] || 'Casos a Revisar';
  };

  const getTotalCasesCount = () => {
    if (!cases) return 0;
    return Object.values(cases).reduce((total, count) => total + count, 0);
  };

  if (!cases || Object.keys(cases).length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h4 className="text-sm font-medium text-yellow-800 mb-3 flex items-center">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        Casos Detectados para Revisar ({getTotalCasesCount()} total)
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(cases).map(([tipo, cantidad]) => (
          cantidad > 0 && (
            <div key={tipo} className={`rounded-lg p-3 border ${getCaseColor(tipo)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCaseIcon(tipo)}</span>
                  <div>
                    <p className="text-sm font-medium">{getCaseTitle(tipo)}</p>
                    <p className="text-xs opacity-75">{cantidad.toLocaleString()} casos</p>
                  </div>
                </div>
                <div className="text-lg font-bold">
                  {cantidad}
                </div>
              </div>
            </div>
          )
        ))}
      </div>
      
      {/* Resumen rápido */}
      <div className="mt-4 p-3 bg-white rounded-lg border border-yellow-300">
        <h5 className="text-sm font-medium text-yellow-800 mb-2">Resumen de Casos:</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <div className="font-bold text-red-600">
              {(cases.sin_centro || 0) + (cases.centro_mal || 0)}
            </div>
            <div className="text-gray-600">Problemas Centro</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-red-600">
              {cases.rechazos_previsionales || 0}
            </div>
            <div className="text-gray-600">Rechazos</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-orange-600">
              {cases.traslados_negativos || 0}
            </div>
            <div className="text-gray-600">Traslados</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-blue-600">
              {(cases.datos_incompletos || 0) + (cases.duplicados || 0)}
            </div>
            <div className="text-gray-600">Datos</div>
          </div>
        </div>
      </div>
    </div>
  );
}