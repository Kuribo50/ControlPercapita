// src/components/dashboard/TimelineWidget.jsx
import React from 'react';
import Card from './Card';
import { FiActivity } from 'react-icons/fi';

export default function TimelineWidget({ actividades }) {
  if (!actividades?.length) {
    return (
      <Card title={<><FiActivity className="inline mr-1"/> Actividad Reciente</>}>
        <p className="text-slate-500">No hay actividad reciente.</p>
      </Card>
    );
  }
  return (
    <Card title={<><FiActivity className="inline mr-1"/> Actividad Reciente</>}>
      <div className="relative pl-6">
        <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-slate-200" />
        {actividades.map((a, i) => (
          <div key={i} className="relative mb-6 last:mb-0 pl-4">
            <span
              className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white animate-pulse"
              style={{ background: a.color || '#3b82f6' }}
            />
            <p className="text-xs text-slate-500">{a.tiempo}</p>
            <p className="text-sm font-medium text-slate-800">{a.mensaje}</p>
            <p className="text-xs text-slate-500">{a.detalle}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 pt-3 mt-4 text-right">
        <a href="/actividad" className="text-sm font-medium text-blue-600 hover:underline">
          Ver toda la actividad →
        </a>
      </div>
    </Card>
  );
}
