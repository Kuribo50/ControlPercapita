// src/components/new-users/NewUsersAnalytics.jsx
import React from 'react';
import {
  MdAssessment,
  MdPeople,
  MdCheckCircle,
  MdAccessTime,
  MdErrorOutline,
  MdShowChart
} from 'react-icons/md';

export default function NewUsersAnalytics({ users, stats, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando análisis…</p>
        </div>
      </div>
    );
  }

  // … mismos cálculos que antes …

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MdAssessment className="h-6 w-6"/> Análisis de Usuarios Nuevos
        </h2>
        <p className="text-gray-600">Estadísticas y tendencias de usuarios registrados</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Total Usuarios</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <MdPeople className="text-4xl"/>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Validados</p>
            <p className="text-3xl font-bold">{stats.validated}</p>
          </div>
          <MdCheckCircle className="text-4xl"/>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white flex items-center justify-between">
          <div>
            <p className="text-yellow-100 text-sm">Pendientes</p>
            <p className="text-3xl font-bold">{stats.pending}</p>
          </div>
          <MdAccessTime className="text-4xl"/>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white flex items-center justify-between">
          <div>
            <p className="text-red-100 text-sm">No Encontrados</p>
            <p className="text-3xl font-bold">{stats.not_found}</p>
          </div>
          <MdErrorOutline className="text-4xl"/>
        </div>
      </div>

      {/* ... resto de tablas y gráficas, usando MdShowChart para iconos de gráficas ... */}
    </div>
  );
}
