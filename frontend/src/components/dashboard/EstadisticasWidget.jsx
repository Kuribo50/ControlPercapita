// src/components/dashboard/EstadisticasWidget.jsx
import React from 'react';
import Card from './Card';
import { FiPieChart } from 'react-icons/fi';

export default function EstadisticasWidget({ estadisticas }) {
  if (!estadisticas || Object.keys(estadisticas).length===0) {
    return (
      <Card title={<><FiPieChart className="inline mr-1"/> Estadísticas del Mes</>}>
        <p className="text-slate-500">No hay estadísticas disponibles.</p>
      </Card>
    );
  }
  const rows = [
    { label:'Nuevos Inscritos', value:estadisticas.nuevos_inscritos, color:'text-emerald-600' },
    { label:'Rechazos Prev.',   value:estadisticas.rechazos_previsionales, color:'text-red-600' },
    { label:'Traslados Neg.',   value:estadisticas.traslados_negativos, color:'text-amber-600' },
    { label:'Tasa de Val.',     value:`${estadisticas.tasa_validacion}%`, color:'text-blue-600' },
  ];
  return (
    <Card title={<><FiPieChart className="inline mr-1"/> Estadísticas del Mes</>}>
      <ul className="flex flex-col gap-3">
        {rows.map(r=>(
          <li key={r.label} className="flex justify-between text-sm hover:bg-slate-50 px-2 py-1 rounded transition">
            <span className="text-slate-600">{r.label}</span>
            <span className={`font-semibold ${r.color}`}>{r.value||0}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
