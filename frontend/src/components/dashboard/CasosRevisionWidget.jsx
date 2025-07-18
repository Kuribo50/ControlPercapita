// src/components/dashboard/CasosRevisionWidget.jsx
import React from 'react';
import Card from './Card';
import { FiAlertCircle } from 'react-icons/fi';

export default function CasosRevisionWidget({ casos }) {
  const prioridadColor = (p) =>
    ({ alta: 'bg-red-100 text-red-700', media: 'bg-amber-100 text-amber-700', baja: 'bg-emerald-100 text-emerald-700' }[p] ?? 'bg-slate-100 text-slate-600');

  if (!casos?.length) {
    return (
      <Card title={<><FiAlertCircle className="inline mr-1"/> Casos a Revisar</>} badge="0 pendientes" badgeColor="bg-red-100 text-red-700">
        <p className="text-slate-500">No hay casos a revisar.</p>
      </Card>
    );
  }
  return (
    <Card title={<><FiAlertCircle className="inline mr-1"/> Casos a Revisar</>} badge={`${casos.length} pendientes`} badgeColor="bg-red-100 text-red-700">
      <div className="flex flex-col gap-4">
        {casos.map(c => (
          <div key={c.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100 transition">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-800">{c.nombre}</span>
              <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${prioridadColor(c.prioridad)}`}>
                {c.prioridad}
              </span>
            </div>
            <div className="mt-1 flex justify-between text-xs text-slate-600">
              <span>RUN: {c.run}</span>
              <span>{c.tiempo}</span>
            </div>
            <p className="text-xs text-red-600">{c.problema}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 pt-3 mt-4 text-right">
        <a href="/casos-revisar" className="text-sm font-medium text-blue-600 hover:underline">
          Ver todos los casos →
        </a>
      </div>
    </Card>
  );
}
