// src/app/revisar-codigos/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { 
  MdQrCode, 
  MdCheckCircle, 
  MdError,
  MdRefresh,
  MdFilterList
} from 'react-icons/md';

export default function RevisarCodigosPage() {
  const [codigos, setCodigos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setCodigos([
        {
          id: 1,
          codigo: "ABC123",
          usuario: "María González",
          run: "12345678-9",
          estado: "pendiente",
          fecha: "2024-01-20",
          motivo: "Inscripción nueva"
        },
        {
          id: 2,
          codigo: "DEF456",
          usuario: "Carlos Pérez",
          run: "87654321-0",
          estado: "validado",
          fecha: "2024-01-19",
          motivo: "Renovación"
        },
        {
          id: 3,
          codigo: "GHI789",
          usuario: "Ana Silva",
          run: "11223344-5",
          estado: "rechazado",
          fecha: "2024-01-18",
          motivo: "Documentos incorrectos"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getEstadoBadge = (estado: string) => {
    const configs = {
      'pendiente': { color: 'bg-yellow-100 text-yellow-800', icon: MdRefresh },
      'validado': { color: 'bg-green-100 text-green-800', icon: MdCheckCircle },
      'rechazado': { color: 'bg-red-100 text-red-800', icon: MdError }
    };
    
    const config = configs[estado as keyof typeof configs];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3" />
        <span className="capitalize">{estado}</span>
      </span>
    );
  };

  const codigosFiltrados = codigos.filter(codigo => 
    filtro === 'todos' || codigo.estado === filtro
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <MdQrCode className="w-6 h-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Revisar Códigos</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="pendiente">Pendientes</option>
                <option value="validado">Validados</option>
                <option value="rechazado">Rechazados</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      RUN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {codigosFiltrados.map((codigo) => (
                    <tr key={codigo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {codigo.codigo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {codigo.usuario}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {codigo.run}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getEstadoBadge(codigo.estado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(codigo.fecha).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            Revisar
                          </button>
                          {codigo.estado === 'pendiente' && (
                            <>
                              <button className="text-green-600 hover:text-green-900">
                                Aprobar
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Rechazar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}