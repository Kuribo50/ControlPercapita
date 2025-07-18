// src/components/users/UsersByStatusTable.jsx
import React, { useState, useEffect } from 'react';
import {
  MdCheckCircle,
  MdCancel,
  MdSwapHoriz,
  MdPersonAdd,
  MdErrorOutline
} from 'react-icons/md';

/**
 * Mapea cada posible estado a un color y un icono.
 */
const ESTADO_INFO = {
  'MANTIENE INSCRIPCIÓN':    { label: 'Mantiene inscripción',   color: 'bg-blue-100 text-blue-800',     icon: <MdCheckCircle/> },
  'MIGRADOS A FONASA':       { label: 'Migrados a FONASA',       color: 'bg-teal-100 text-teal-800',     icon: <MdSwapHoriz/> },
  'NUEVO INSCRITO':          { label: 'Nuevo inscrito',          color: 'bg-green-100 text-green-800',   icon: <MdPersonAdd/> },
  'RECHAZADO FALLECIDO':     { label: 'Rechazado (fallecido)',   color: 'bg-gray-100 text-gray-800',     icon: <MdCancel/> },
  'RECHAZADO PREVISIONAL':    { label: 'Rechazado previsional',   color: 'bg-red-100 text-red-800',       icon: <MdCancel/> },
  'TRASLADO NEGATIVO':       { label: 'Traslado negativo',       color: 'bg-orange-100 text-orange-800', icon: <MdCancel/> },
  'TRASLADO POSITIVO':       { label: 'Traslado positivo',       color: 'bg-purple-100 text-purple-800', icon: <MdSwapHoriz/> },
  'Sin Validar':             { label: 'Sin validar',             color: 'bg-yellow-100 text-yellow-800', icon: <MdErrorOutline/> }
};

// Datos de ejemplo
const SAMPLE_USERS = [
  {
    id: 1,
    run: '12.345.678-9',
    nombre: 'Ana Pérez',
    fecha_creacion: '2025-07-15T10:23:00',
    establecimiento: 'CESFAM Tomé',
    cod: 'CP-001',
    ultima_validacion: { estado_actual: 'NUEVO INSCRITO' }
  },
  {
    id: 2,
    run: '22.333.444-5',
    nombre: 'Luis González',
    fecha_creacion: '2025-07-16T11:10:00',
    establecimiento: 'CESFAM Tomé',
    cod: 'CP-002',
    ultima_validacion: { estado_actual: 'MANTIENE INSCRIPCIÓN' }
  },
  {
    id: 3,
    run: '33.222.111-0',
    nombre: 'María Rodríguez',
    fecha_creacion: '2025-07-17T09:45:00',
    establecimiento: 'CESFAM Tomé',
    cod: 'CP-003',
    ultima_validacion: { estado_actual: 'RECHAZADO PREVISIONAL' }
  },
  {
    id: 4,
    run: '44.111.222-3',
    nombre: 'Pedro Sánchez',
    fecha_creacion: '2025-07-18T14:30:00',
    establecimiento: 'CESFAM Tomé',
    cod: 'CP-004',
    ultima_validacion: { estado_actual: 'Sin Validar' }
  }
];

export default function UsersByStatusTable({ demo = false }) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (demo) {
      setUsers(SAMPLE_USERS);
    } else {
      loadRealUsers();
    }
  }, [demo]);

  async function loadRealUsers() {
    setLoading(true);
    try {
      // aquí iría tu llamada al API real
      // const { usuarios } = await percapitaApi.getUsuariosNuevos();
      // setUsers(usuarios);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Agrupa usuarios por estado_actual
  const groups = users.reduce((acc, u) => {
    const estado = u.ultima_validacion?.estado_actual || 'Sin Validar';
    if (!acc[estado]) acc[estado] = [];
    acc[estado].push(u);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {Object.entries(groups).map(([estado, list]) => {
        const info = ESTADO_INFO[estado] || ESTADO_INFO['Sin Validar'];
        return (
          <section key={estado}>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <span className={`p-1 rounded ${info.color}`}>{info.icon}</span>
              {info.label} ({list.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">RUN</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nombre</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Creación</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Centro</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Código</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {list.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{u.run}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{u.nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(u.fecha_creacion).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{u.establecimiento}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{u.cod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
