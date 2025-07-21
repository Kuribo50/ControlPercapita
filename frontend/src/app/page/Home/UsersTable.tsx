// src/components/dashboard/UsersTable.tsx
"use client";

import { useState } from 'react';
import { 
  MdVisibility, 
  MdEdit, 
  MdMoreVert,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdExpandMore,
  MdExpandLess
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
    
    const config = configs[estado.toLowerCase() as keyof typeof configs] || configs.default;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3.5 h-3.5" />
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
        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse w-60"></div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse w-48"></div>
              <div className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-lg h-32 animate-pulse"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center">
        <span className="mr-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg">👥</span>
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Usuarios por Motivo
        </span>
      </h2>
      
      {Object.entries(registrosPorMotivo).map(([motivo, registros]) => {
        const isExpanded = expandedSections[motivo];
        const page = currentPage[motivo] || 1;
        const startIndex = (page - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        const paginatedRegistros = registros.slice(startIndex, endIndex);
        const totalPages = Math.ceil(registros.length / recordsPerPage);

        return (
          <div key={motivo} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md">
            <div 
              className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection(motivo)}
            >
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {motivo}
                </h3>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {registros.length} {registros.length === 1 ? 'usuario' : 'usuarios'}
                </span>
              </div>
              <div className="text-gray-500">
                {isExpanded ? <MdExpandLess className="w-6 h-6" /> : <MdExpandMore className="w-6 h-6" />}
              </div>
            </div>
            
            {isExpanded && (
              <div className="border-t border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['RUN', 'Nombre Completo', 'Centro', 'Fecha Corte', 'Estado', 'Acciones'].map((header, index) => (
                          <th 
                            key={index}
                            className={`px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                              header === 'Centro' ? 'hidden md:table-cell' : 
                              header === 'Fecha Corte' ? 'hidden lg:table-cell' : ''
                            }`}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedRegistros.map((registro) => (
                        <tr key={registro.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {registro.run}-{registro.dv}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">
                                {registro.nombres} {registro.apellido_paterno} {registro.apellido_materno}
                              </div>
                              <div className="text-gray-500 md:hidden mt-1">
                                {registro.nombre_centro}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-900 hidden md:table-cell max-w-xs truncate">
                            {registro.nombre_centro}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                            {new Date(registro.fecha_corte).toLocaleDateString('es-CL')}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            {getEstadoBadge(registro.aceptado_rechazado)}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => onUsuarioClick?.(registro)}
                                className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-full transition-colors"
                                title="Ver detalles"
                                aria-label="Ver detalles"
                              >
                                <MdVisibility className="w-5 h-5" />
                              </button>
                              <button
                                className="p-2 text-gray-500 hover:text-white hover:bg-gray-500 rounded-full transition-colors"
                                title="Más opciones"
                                aria-label="Más opciones"
                              >
                                <MdMoreVert className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-500">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, registros.length)} de {registros.length} registros
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => changePage(motivo, page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                              className={`w-10 h-10 flex items-center justify-center text-sm rounded-md ${
                                page === pageNum 
                                  ? 'bg-blue-600 text-white' 
                                  : 'border border-gray-300 hover:bg-gray-50'
                              } transition-colors`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => changePage(motivo, page + 1)}
                        disabled={page === totalPages}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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