// src/app/components/layout/Navbar.tsx
"use client";

import React, { useState } from 'react';
import { MdSearch, MdNotifications, MdFilterList, MdFileDownload, MdRefresh } from 'react-icons/md';

interface NavbarProps {
  onRefresh?: () => void;
  loading?: boolean;
  filtros?: {
    busqueda: string;
    fechaDesde: string;
    fechaHasta: string;
    estado: string;
    motivo: string;
  };
  onFiltrosChange?: (filtros: unknown) => void;
}

export default function Navbar({
  onRefresh,
  loading,
  filtros = { busqueda: '', fechaDesde: '', fechaHasta: '', estado: 'todos', motivo: 'todos' },
  onFiltrosChange
}: NavbarProps) {
  const userName = 'Invitado';

  const [showFilters, setShowFilters] = useState(false);

  const handleFiltroChange = (key: string, value: string) => {
    onFiltrosChange?.({ ...filtros, [key]: value });
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
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-3 items-center">

        {/* IZQUIERDA: Título */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-900">Dashboard Percápita</h1>
        </div>

        {/* CENTRO: Buscador */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-sm">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o RUN..."
              value={filtros.busqueda}
              onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* DERECHA: Iconos + usuario */}
        <div className="flex justify-end items-center space-x-4">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`p-2 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <MdFilterList className="w-5 h-5" />
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <MdRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <MdFileDownload className="w-5 h-5" />
          </button>

          <div className="relative">
            <button className="p-2 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              <MdNotifications className="w-5 h-5" />
            </button>
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>

          {/* Nombre del usuario */}
          <div className="pl-4 border-l border-gray-200">
            <span className="text-sm font-medium text-gray-700">
              {userName}
            </span>
          </div>
        </div>
      </div>

      {/* PANEL DE FILTROS */}
      {showFilters && (
        <div className="px-4 pb-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
            {/* Estado */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
              <select
                value={filtros.estado}
                onChange={e => handleFiltroChange('estado', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="aceptado">Aceptados</option>
                <option value="rechazado">Rechazados</option>
                <option value="pendiente">Pendientes</option>
              </select>
            </div>

            {/* Desde */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={e => handleFiltroChange('fechaDesde', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Hasta */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={e => handleFiltroChange('fechaHasta', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Limpiar */}
            <div className="flex items-end">
              <button
                onClick={limpiarFiltros}
                className="w-full py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
