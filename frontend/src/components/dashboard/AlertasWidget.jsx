// src/components/dashboard/AlertasWidget.jsx
import React from 'react';
import Card from './Card';
import { FiBellOff, FiInfo, FiAlertTriangle } from 'react-icons/fi';

export default function AlertasWidget({ alertas }) {
  if (!alertas?.length) {
    return (
      <Card title={<><FiBellOff className="inline mr-1"/> Alertas del Sistema</>}>
        <p className="text-slate-500">No hay alertas del sistema.</p>
      </Card>
    );
  }
  const map = {
    warning: { icon:<FiAlertTriangle />, bg:'bg-amber-50', col:'text-amber-700' },
    info:    { icon:<FiInfo />,          bg:'bg-blue-50',  col:'text-blue-700'   },
    success: { icon:<FiBellOff />,      bg:'bg-emerald-50',col:'text-emerald-700'},
  };
  return (
    <Card title={<><FiBellOff className="inline mr-1"/> Alertas del Sistema</>}>
      <ul className="flex flex-col gap-3">
        {alertas.map((a,i)=>{
          const {icon, bg, col} = map[a.tipo] || map.info;
          return (
            <li key={i} className={`flex items-start gap-2 p-3 rounded-md border border-slate-200 ${bg} hover:shadow transition`}>
              <span className={`${col}`}>{icon}</span>
              <div className="flex-1 text-sm">
                <p className="font-medium">{a.mensaje}</p>
                <p className="text-xs text-slate-500">{a.tiempo}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
