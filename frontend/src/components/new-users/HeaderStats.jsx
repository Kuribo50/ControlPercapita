// src/components/new-users/HeaderStats.jsx
import React from 'react';
import {
  MdPeople,
  MdCheckCircle,
  MdAccessTime,
  MdError
} from 'react-icons/md';

export default function HeaderStats({ stats }) {
  const items = [
    { label: 'Total', value: stats.total, color: 'text-blue-600',   icon: <MdPeople className="h-6 w-6"/> },
    { label: 'Validados', value: stats.validated, color: 'text-green-600', icon: <MdCheckCircle className="h-6 w-6"/> },
    { label: 'Pendientes', value: stats.pending, color: 'text-yellow-600', icon: <MdAccessTime className="h-6 w-6"/> },
    { label: 'No encontrados', value: stats.not_found, color: 'text-red-600', icon: <MdError className="h-6 w-6"/> }
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <MdPeople/> Gestión de Usuarios Nuevos
      </h1>
      <p className="text-gray-600 mb-4">
        Registra, valida y analiza usuarios no incluidos en el corte FONASA
      </p>
      <div className="flex flex-wrap gap-4">
        {items.map(item => (
          <div key={item.label} className="bg-white rounded-lg p-4 shadow flex-1 min-w-[120px]">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${item.color}`}>{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
              <div className="text-3xl">{item.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
