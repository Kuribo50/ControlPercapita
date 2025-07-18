// src/components/dashboard/GraficoCortes.jsx
import React from 'react';
import Card from './Card';
import { FiBarChart } from 'react-icons/fi';

export default function GraficoCortes({ cortes }) {
  const agg = cortes.reduce((a,c)=>{
    if (!c.fecha_corte) return a;
    const d=new Date(c.fecha_corte);
    const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    a[k]=(a[k]||0)+1; return a;
  },{});
  const labels=Object.keys(agg).sort();
  const values=labels.map(l=>agg[l]);

  return (
    <Card title={<><FiBarChart className="inline mr-1"/> Cortes por Mes</>}>
      {labels.length===0 ? (
        <p className="text-slate-500">No hay cortes registrados.</p>
      ) : (
        <div className="flex h-32 items-end gap-3">
          {labels.map((lbl,i)=>(
            <div key={lbl} className="flex flex-col items-center flex-1 max-w-[60px] hover:opacity-80 transition-opacity">
              <div className="w-full rounded-t bg-blue-500" style={{height:`${values[i]*25}px`}} title={`${values[i]} cortes`} />
              <p className="mt-1 text-xs">{lbl}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
