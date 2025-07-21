// src/components/dashboard/UsersTable.tsx
interface Registro {
    id: string;
    run: string;
    dv: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    fecha_nacimiento: string;
    genero: string;
    tramo: string;
    fecha_corte: string;
    cod_centro: string;
    nombre_centro: string;
    motivo: string;
    aceptado_rechazado: string;
  }
  
  interface UsersTableProps {
    registrosPorMotivo: { [motivo: string]: Registro[] };
    loading?: boolean;
  }
  
  export function UsersTable({ registrosPorMotivo, loading = false }: UsersTableProps) {
    if (loading) {
      return (
        <section className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-60"></div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
                <div className="bg-gray-100 rounded-lg h-32 animate-pulse"></div>
              </div>
            ))}
          </div>
        </section>
      );
    }
  
    return (
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-blue-800 flex items-center">
          <span className="mr-3">👥</span>
          Usuarios por Motivo
        </h2>
        
        {Object.entries(registrosPorMotivo).map(([motivo, registros]) => (
          <div key={motivo} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-blue-700">
                {motivo}
              </h3>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {registros.length} usuarios
              </span>
            </div>
            
            <div className="overflow-x-auto rounded-lg shadow-lg">
              <table className="min-w-full bg-white">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">RUN</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Nombre Completo</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Centro</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Fecha Corte</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {registros.map((registro) => (
                    <tr key={registro.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-sm text-gray-900">
                        {registro.run}-{registro.dv}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {`${registro.nombres} ${registro.apellido_paterno} ${registro.apellido_materno}`}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{registro.nombre_centro}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{registro.fecha_corte}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          registro.aceptado_rechazado.toLowerCase() === 'aceptado' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {registro.aceptado_rechazado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>
    );
  }