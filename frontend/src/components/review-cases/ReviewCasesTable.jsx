import React from 'react';
import {
  MdPerson,
  MdPermIdentity,
  MdLocationOn,
  MdSubdirectoryArrowRight,
  MdConfirmationNumber,
  MdDateRange,
  MdLocalHospital,
  MdNote,
  MdCheckCircle,
  MdErrorOutline
} from 'react-icons/md';

export default function ReviewCasesTable({ cases }) {
  if (!cases.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        No hay casos pendientes de revisión.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">RUN</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nombre</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Sector</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subsector</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Código Percápita</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Fecha</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Establecimiento</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Observación</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {cases.map(c => {
            // Determina badge de estado
            let EstadoIcon = c.estado_validacion?.encontrado_en_corte
              ? <MdCheckCircle className="text-green-600 h-5 w-5"/>
              : <MdErrorOutline className="text-red-600 h-5 w-5"/>;

            return (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700 flex items-center gap-2">
                  <MdPermIdentity className="h-5 w-5 text-gray-400"/> {c.run}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 flex items-center gap-2">
                  <MdPerson className="h-5 w-5 text-gray-400"/> {c.nombre}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 flex items-center gap-1">
                  <MdLocationOn className="h-5 w-5 text-gray-400"/> {c.sector}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 flex items-center gap-1">
                  <MdSubdirectoryArrowRight className="h-5 w-5 text-gray-400"/> {c.subsector || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 flex items-center gap-1">
                  <MdConfirmationNumber className="h-5 w-5 text-gray-400"/> {c.cod_percapita}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 flex items-center gap-1">
                  <MdDateRange className="h-5 w-5 text-gray-400"/> {new Date(c.fecha).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 flex items-center gap-1">
                  <MdLocalHospital className="h-5 w-5 text-gray-400"/> {c.establecimiento}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 flex items-center gap-1">
                  <MdNote className="h-5 w-5 text-gray-400"/> {c.observacion || '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  {EstadoIcon}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
