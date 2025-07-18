// src/components/new-users/UsersTable.jsx
import React, { useState } from 'react';
import Select from 'react-select';
import {
  MdSearch,
  MdRefresh,
} from 'react-icons/md';
import { percapitaApi } from '../../utils/api';

export default function UsersTable({ users, loading, onReload }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState({ value: 'all', label: 'Todos' });
  const statusOpts = [
    { value: 'all',      label: 'Todos' },
    { value: 'validated',label: '✅ Validados' },
    { value: 'pending',  label: '🕒 Pendientes' },
    { value: 'not_found',label: '❌ No encontrados' }
  ];

  const filtered = users.filter(u => {
    if (search) {
      const s = search.toLowerCase();
      if (!u.nombre?.toLowerCase().includes(s) && !u.run?.toLowerCase().includes(s)) return false;
    }
    if (status.value !== 'all') {
      if (status.value === 'validated' && !u.estado_validacion?.encontrado_en_corte) return false;
      if (status.value === 'not_found' && u.estado_validacion?.encontrado_en_corte) return false;
      if (status.value === 'pending' && u.estado_validacion) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex-1 min-w-[200px]">
          <label className="flex items-center gap-1 text-sm font-medium mb-1">
            <MdSearch/> Buscar
          </label>
          <input
            type="text"
            placeholder="Nombre o RUN…"
            value={search}
            onChange={e=>setSearch(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Estado</label>
          <Select
            options={statusOpts}
            value={status}
            onChange={setStatus}
            isSearchable={false}
            classNamePrefix="react-select"
          />
        </div>
        <button
          onClick={onReload}
          disabled={loading}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <MdRefresh/> Actualizar
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Información</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{u.nombre} ({u.run})</td>
                <td className="px-6 py-4">{u.nacionalidad} / {u.sector}</td>
                <td className="px-6 py-4">
                  {/* Reusar tu getStatusBadge(u) */}
                </td>
                <td className="px-6 py-4">{new Date(u.fecha).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  {/* Botones editar/eliminar */}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                  {users.length ? 'No hay resultados' : 'No hay usuarios aún'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
);
}
