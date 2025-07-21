// src/app/components/dashboard/QuickActions.tsx
"use client";

import React from 'react';
import {
  MdUploadFile,
  MdFileDownload,
  MdPersonAdd,
  MdAssessment,
  MdNotifications,
  MdSettings
} from 'react-icons/md';
import Link from 'next/link';

export function QuickActions() {
  const actions = [
    {
      id: 'upload',
      title: 'Subir Corte',
      description: 'Cargar nuevo archivo de percápita',
      icon: MdUploadFile,
      href: '/upload',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      id: 'export',
      title: 'Exportar Datos',
      description: 'Descargar registros en Excel/CSV',
      icon: MdFileDownload,
      href: '#',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      onClick: () => {
        // Lógica de exportación
        console.log('Exportar datos');
      }
    },
    {
      id: 'add-user',
      title: 'Agregar Usuario',
      description: 'Registrar manualmente un usuario',
      icon: MdPersonAdd,
      href: '/usuarios/nuevo',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
    },
    {
      id: 'reports',
      title: 'Generar Reporte',
      description: 'Crear reportes personalizados',
      icon: MdAssessment,
      href: '/reportes',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
    }
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Acciones Rápidas</h2>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          Ver todas
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const IconComponent = action.icon;
          
          if (action.onClick) {
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`${action.color} ${action.hoverColor} text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 text-left group`}
              >
                <div className="flex items-center justify-between mb-3">
                  <IconComponent className="w-8 h-8 text-white opacity-90 group-hover:opacity-100" />
                  <div className="w-2 h-2 bg-white bg-opacity-30 rounded-full"></div>
                </div>
                <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </button>
            );
          }

          return (
            <Link
              key={action.id}
              href={action.href}
              className={`${action.color} ${action.hoverColor} text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 block group`}
            >
              <div className="flex items-center justify-between mb-3">
                <IconComponent className="w-8 h-8 text-white opacity-90 group-hover:opacity-100" />
                <div className="w-2 h-2 bg-white bg-opacity-30 rounded-full"></div>
              </div>
              <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}