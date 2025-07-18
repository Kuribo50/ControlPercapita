// src/components/dashboard/EvolutionChart.jsx
import React from 'react';
import Card from './Card';
import { FiBarChart2 } from 'react-icons/fi';

export default function EvolutionChart({ data }) {
  const max = Math.max(...data.map(d => d.poblacion));
  const min = Math.min(...data.map(d => d.poblacion));

  return (
    <Card title={<><FiBarChart2 className="inline mr-1"/> Evolución Poblacional</>}>
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data.map((d, i) => {
          const prev = i>0 ? data[i-1].poblacion : d.poblacion;
          const delta = d.poblacion - prev;
          const pct = i>0?((delta/prev)*100).toFixed(1):0;
          return (
            <div key={d.mes} className="rounded-lg border border-slate-200 bg-gray-50 p-4 text-center hover:bg-gray-100 transition">
              <p className="text-sm font-medium text-slate-600">{d.mes} 2025</p>
              <p className="text-2xl font-bold text-blue-600">{d.poblacion.toLocaleString()}</p>
              {i>0 && (
                <p className={`mt-1 text-xs font-medium ${delta>=0?'text-emerald-600':'text-red-600'}`}>
                  {delta>=0?'📈':'📉'} {Math.abs(delta).toLocaleString()} ({pct}%)
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="rounded-lg border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-8 hover:shadow-md transition">
        <div className="flex h-48 items-end gap-3">
          {data.map(d => {
            const h = ((d.poblacion-min)/(max-min))*140 + 20;
            return (
              <div key={d.mes} className="flex flex-col items-center flex-1 max-w-[80px]">
                <div
                  className="w-full rounded-t-lg bg-blue-500 transition-all duration-300"
                  style={{ height: `${h}px` }}
                  title={d.poblacion.toLocaleString()}
                />
                <p className="mt-2 text-xs font-medium text-slate-600">{d.mes}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
