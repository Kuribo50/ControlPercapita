// src/components/dashboard/TopBar.tsx (ACTUALIZADO con temática percápita)
"use client";

import React, { useState } from 'react';
import {
  MdSearch,
  MdNotifications,
  MdKeyboardArrowDown,
  MdFilterList,
  MdFileDownload,
  MdCalendarMonth,
  MdRefresh
} from 'react-icons/md';

interface TopBarProps {
  onRefresh?: () => void;
  loading?: boolean;
  totalRegistros?: number;
  ultimaActualizacion?: Date | null;
}

export function TopBar({ onRefresh, loading, totalRegistros = 0, ultimaActualizacion }: TopBarProps) {
  const [dateRange, setDateRange] = useState('Jul 18 - Jul 21');

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Percápita</h1>
            <p className="text-sm text-gray-500">
              {totalRegistros.toLocaleString()} registros FONASA • CESFAM Dr. Alberto Reyes
            </p>
          </div>
          
          {/* Search */}
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por RUN, nombre..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
              ⌘ F
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Date Range */}
          <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
            <MdCalendarMonth className="w-4 h-4" />
            <span>{dateRange}</span>
            <MdKeyboardArrowDown className="w-4 h-4" />
          </button>

          {/* Filter */}
          <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
            <MdFilterList className="w-4 h-4" />
            <span>Filtros</span>
          </button>

          {/* Export */}
          <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
            <MdFileDownload className="w-4 h-4" />
            <span>Exportar</span>
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            <MdRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600">
            <MdNotifications className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">DR</span>
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-gray-900">Dr. Alberto Reyes</div>
              <div className="text-xs text-gray-500">Director CESFAM</div>
            </div>
            <MdKeyboardArrowDown className="w-4 h-4 text-gray-400" />
          </div>

          {/* Last update info */}
          {ultimaActualizacion && (
            <div className="text-xs text-gray-500 border-l pl-4">
              Última actualización:<br/>
              {ultimaActualizacion.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}