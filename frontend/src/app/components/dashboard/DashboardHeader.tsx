// src/components/dashboard/DashboardHeader.tsx
interface DashboardHeaderProps {
    totalRegistros: number;
    ultimaActualizacion: Date | null;
    onRefresh: () => void;
    loading?: boolean;
  }
  
  export function DashboardHeader({ 
    totalRegistros, 
    ultimaActualizacion, 
    onRefresh, 
    loading = false 
  }: DashboardHeaderProps) {
    return (
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-blue-900 mb-2">
            Dashboard de Registros
          </h1>
          <p className="text-gray-600 flex items-center">
            <span className="mr-2">📊</span>
            {totalRegistros.toLocaleString()} registros totales
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {ultimaActualizacion && (
            <p className="text-sm text-gray-500">
              Última actualización: {ultimaActualizacion.toLocaleTimeString()}
            </p>
          )}
          
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className={`mr-2 ${loading ? 'animate-spin' : ''}`}>
              🔄
            </span>
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>
    );
  }