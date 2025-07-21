// src/components/dashboard/UsersTable.tsx
"use client";

import { useState } from 'react';
import { 
  MdVisibility, 
  MdEdit, 
  MdMoreVert,
  MdCheckCircle,
  MdCancel,
  MdPending
} from 'react-icons/md';

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
  onUsuarioClick?: (usuario: Registro) => void;
}

export function UsersTable({ registrosPorMotivo, loading = false, onUsuarioClick }: UsersTableProps) {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState<{ [key: string]: number }>({});
  const recordsPerPage = 10;

  const toggleSection = (motivo: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [motivo]: !prev[motivo]
    }));
  };

  const getEstadoBadge = (estado: string) => {
    const configs = {
      'aceptado': { color: 'bg-green-100 text-green-800', icon: MdCheckCircle },
      'rechazado': { color: 'bg-red-100 text-red-800', icon: MdCancel },
      'pendiente': { color: 'bg-yellow-100 text-yellow-800', icon: MdPending },
      default: { color: 'bg-gray-100 text-gray-800', icon: MdPending }
    };
    
    const config = configs[estado.toLowerCase() as keyof typeof configs ] || configs.default;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3" />
        <span className="capitalize">{estado || 'Sin estado'}</span>
      </span>
    );
  };

  const changePage = (motivo: string, newPage: number) => {
    setCurrentPage(prev => ({
      ...prev,
      [motivo]: newPage
    }));
  };

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
    <section className="space-y-6">
      <h2 className="text-2xl lg:text-3xl font-bold text-blue-800 flex items-center">
        <span className="mr-3">👥</span>
        Usuarios por Motivo
      </h2>
      
      {Object.entries(registrosPorMotivo).map(([motivo, registros]) => {
        const isExpanded = expandedSections[motivo];
        const page = currentPage[motivo] || 1;
        const startIndex = (page - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        const paginatedRegistros = registros.slice(startIndex, endIndex);
        const totalPages = Math.ceil(registros.length / recordsPerPage);

        return (
          <div key={motivo} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection(motivo)}
            >
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {motivo}
                </h3>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {registros.length} usuarios
                </span>
              </div>
              <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {isExpanded && (
              <div className="border-t border-gray-200">
                {/* Tabla Responsiva */}
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          RUN
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre Completo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Centro
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                          Fecha Corte
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedRegistros.map((registro) => (
                        <tr key={registro.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {registro.run}-{registro.dv}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">
                                {registro.nombres} {registro.apellido_paterno} {registro.apellido_materno}
                              </div>
                              <div className="text-gray-500 md:hidden">
                                {registro.nombre_centro}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 hidden md:table-cell max-w-xs truncate">
                            {registro.nombre_centro}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                            {new Date(registro.fecha_corte).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {getEstadoBadge(registro.aceptado_rechazado)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => onUsuarioClick?.(registro)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                title="Ver detalles"
                              >
                                <MdVisibility className="w-4 h-4" />
                              </button>
                              <button
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                                title="Más opciones"
                              >
                                <MdMoreVert className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, registros.length)} de {registros.length} registros
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => changePage(motivo, page - 1)}
                        disabled={page === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => changePage(motivo, pageNum)}
                              className={`px-3 py-1 text-sm rounded-md ${
                                page === pageNum 
                                  ? 'bg-blue-500 text-white' 
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => changePage(motivo, page + 1)}
                        disabled={page === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}