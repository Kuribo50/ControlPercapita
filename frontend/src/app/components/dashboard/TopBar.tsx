// src/components/dashboard/TopBar.tsx
"use client";

import React, { useState } from 'react';
import {
  MdSearch,
  MdNotifications,
  MdKeyboardArrowDown,
  MdFilterList,
  MdFileDownload,
  MdCalendarMonth,
  MdRefresh,
  MdClose
} from 'react-icons/md';

interface TopBarProps {
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

export function TopBar({ 
  onRefresh, 
  loading, 
  totalRegistros = 0, 
  ultimaActualizacion,
  filtros = { busqueda: '', fechaDesde: '', fechaHasta: '', estado: 'todos', motivo: 'todos' },
  onFiltrosChange
}: TopBarProps) {
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
                <span className="ml-2">• Actualizado: {ultimaActualizacion.toLocaleTimeString()}</span>
              )}
            </p>
          </div>
          
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por RUN, nombre..."
              value={filtros.busqueda}
              onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 lg:space-x-4 overflow-x-auto">
          {/* Filter Toggle */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg whitespace-nowrap"
          >
            <MdFilterList className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
          </button>

          {/* Export */}
          <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg whitespace-nowrap">
            <MdFileDownload className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
          >
            <MdRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{loading ? 'Cargando...' : 'Actualizar'}</span>
          </button>
        </div>
      </div>

      {/* Panel de Filtros Expandible */}
      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="aceptado">Aceptados</option>
                <option value="rechazado">Rechazados</option>
                <option value="pendiente">Pendientes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
              <select
                value={filtros.motivo}
                onChange={(e) => handleFiltroChange('motivo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los motivos</option>
                <option value="nuevo_inscrito">Nuevo Inscrito</option>
                <option value="traslado_positivo">Traslado Positivo</option>
                <option value="traslado_negativo">Traslado Negativo</option>
                <option value="rechazo_previsional">Rechazo Previsional</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={limpiarFiltros}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}