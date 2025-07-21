// src/app/desafiliaciones/page.tsx
"use client";

import { PageTemplate } from '../../components/shared/PageTemplate';
import { HiOutlineUser } from 'react-icons/hi2';
import { useState, useEffect } from 'react';

export default function DesafiliacionesPage() {
  const [solicitudes, setSolicitudes] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setSolicitudes([
        {
          id: 1,
          run: "12345678-9",
          nombre: "Carlos Mendoza",
          fechaSolicitud: "2024-01-18",
          motivo: "Cambio de domicilio",
          estado: "en_proceso",
          centroOrigen: "CESFAM Dr. Alberto Reyes",
          centroDestino: "CESFAM Las Condes"
        },
        {
          id: 2,
          run: "98765432-1",
          nombre: "María Elena Castro",
          fechaSolicitud: "2024-01-17",
          motivo: "Solicitud personal",
          estado: "aprobada",
          centroOrigen: "CESFAM Dr. Alberto Reyes",
          centroDestino: null
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <PageTemplate 
      title="Desafiliaciones" 
      icon={HiOutlineUser}
      color="purple"
      actions={
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Nueva Desafiliación
        </button>
      }
    >
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha Solicitud
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Motivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {solicitudes.map((solicitud) => (
                <tr key={solicitud.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {solicitud.nombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        {solicitud.run}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(solicitud.fechaSolicitud).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {solicitud.motivo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      solicitud.estado === 'aprobada' 
                        ? 'bg-green-100 text-green-800'
                        : solicitud.estado === 'en_proceso'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {solicitud.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button className="text-purple-600 hover:text-purple-900">
                        Ver
                      </button>
                      {solicitud.estado === 'en_proceso' && (
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
    </PageTemplate>
  );
}