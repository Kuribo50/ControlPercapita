// src/app/components/dashboard/ChartSection.tsx
"use client";

import React from 'react';
import {
  MdPieChart,
  MdBarChart
} from 'react-icons/md';

interface ChartSectionProps {
  stats: any;
  registros: any[];
  loading: boolean;
}

export function ChartSection({ stats, registros, loading }: ChartSectionProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="animate-pulse">
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-64 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const motivosPorCantidad = registros.reduce((acc: any, registro) => {
    const motivo = registro.motivo || 'Sin motivo';
    acc[motivo] = (acc[motivo] || 0) + 1;
    return acc;
  }, {});

  const topMotivos = Object.entries(motivosPorCantidad)
    .sort(([,a]: any, [,b]: any) => b - a)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Estados */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <MdPieChart className="w-5 h-5 text-blue-600" />
            </div>
            <span>Estados de Usuarios</span>
          </h3>
        </div>
        
        <div className="space-y-4">
          {[
            { 
              label: 'Aceptados', 
              value: stats.aceptados, 
              color: 'bg-green-500', 
              bgColor: 'bg-green-50',
              textColor: 'text-green-800'
            },
            { 
              label: 'Rechazados', 
              value: stats.rechazados, 
              color: 'bg-red-500', 
              bgColor: 'bg-red-50',
              textColor: 'text-red-800'
            },
            { 
              label: 'Pendientes', 
              value: stats.pendientesRevision, 
              color: 'bg-orange-500', 
              bgColor: 'bg-orange-50',
              textColor: 'text-orange-800'
            }
          ].map((item) => {
            const porcentaje = stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0;
            
            return (
              <div key={item.label} className={`${item.bgColor} p-4 rounded-lg transition-all duration-200 hover:shadow-sm`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 ${item.color} rounded-full mr-3`}></div>
                    <span className={`font-medium ${item.textColor}`}>{item.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold ${item.textColor}">{item.value}</div>
                    <div className="text-sm ${item.textColor}">
                      {porcentaje}%
                    </div>
                  </div>
                </div>
                <div className="mt-3 w-full bg-white bg-opacity-50 rounded-full h-2">
                  <div 
                    className={`${item.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${porcentaje}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Motivos */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <MdBarChart className="w-5 h-5 text-purple-600" />
            </div>
            <span>Top Motivos</span>
          </h3>
        </div>

        <div className="space-y-4">
          {topMotivos.map(([motivo, cantidad]: any, index) => {
            const porcentaje = stats.total > 0 ? Math.round((cantidad / stats.total) * 100) : 0;
            const colors = [
              'bg-purple-500',
              'bg-indigo-500',
              'bg-blue-500',
              'bg-teal-500',
              'bg-cyan-500'
            ];
            
            return (
              <div key={motivo} className="group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {index + 1}. {motivo}
                  </span>
                  <span className="text-sm font-semibold text-gray-600">{cantidad}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`${colors[index]} h-2.5 rounded-full transition-all duration-500 group-hover:opacity-90`}
                    style={{ width: `${porcentaje}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}