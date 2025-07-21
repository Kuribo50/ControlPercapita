// src/app/dashboard/Navbar.tsx (versión mejorada)
"use client";
import React, { useState } from 'react';
import {
  MdSearch,
  MdNotifications,
  MdFilterList,
  MdFileDownload,
  MdRefresh,
  MdClose,
  MdCalendarToday
} from 'react-icons/md';

interface NavbarProps {
  onRefresh?: () => void;
  loading?: boolean;
  totalRegistros?: number;
  ultimaActualizacion?: Date | null;
  filtros?: {
    busqueda: string;
    fechaDesde: string;
    fechaHasta: string;
    estado: string;
    motivo: string;
  };
  onFiltrosChange?: (filtros: unknown) => void;
}

export function Navbar({ 
  onRefresh, 
  loading, 
  totalRegistros = 0, 
  ultimaActualizacion,
  filtros = { busqueda: '', fechaDesde: '', fechaHasta: '', estado: 'todos', motivo: 'todos' },
  onFiltrosChange
}: NavbarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleFiltroChange = (key: string, value: string) => {
    const nuevosFiltros = { ...filtros, [key]: value };
    onFiltrosChange?.(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    onFiltrosChange?.({
      busqueda: '',
      fechaDesde: '',
      fechaHasta: '',
      estado: 'todos',
      motivo: 'todos'
    });
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Left side */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard Percápita</h1>
            <p className="text-sm text-gray-500">
              {totalRegistros.toLocaleString()} registros FONASA • CESFAM Dr. Alberto Reyes
              {ultimaActualizacion && (
                <span className="ml-2">
                  • Actualizado: {ultimaActualizacion.toLocaleString()}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          {/* Barra de búsqueda */}
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre o RUN..."
              value={filtros.busqueda}
              onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border transition-colors ${
                showFilters 
                  ? 'bg-blue-50 text-blue-600 border-blue-200' 
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <MdFilterList className="w-4 h-4" />
            </button>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <MdRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <MdFileDownload className="w-4 h-4" />
            </button>

            <div className="relative">
              <button className="p-2 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                <MdNotifications className="w-4 h-4" />
              </button>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de filtros expandido */}
      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="aceptado">Aceptados</option>
                <option value="rechazado">Rechazados</option>
                <option value="pendiente">Pendientes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={limpiarFiltros}
                className="w-full px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Navbar;