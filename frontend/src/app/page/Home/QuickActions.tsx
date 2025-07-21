// src/app/components/dashboard/QuickActions.tsx
"use client";

import React from 'react';
import {
  MdUploadFile,
  MdFileDownload,
  MdPersonAdd,
  MdAssessment
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
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'export',
      title: 'Exportar Datos',
      description: 'Descargar registros en Excel/CSV',
      icon: MdFileDownload,
      href: '#',
      color: 'from-green-500 to-green-600',
      onClick: () => console.log('Exportar datos')
    },
    {
      id: 'add-user',
      title: 'Agregar Usuario',
      description: 'Registrar manualmente un usuario',
      icon: MdPersonAdd,
      href: '/usuarios/nuevo',
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'reports',
      title: 'Generar Reporte',
      description: 'Crear reportes personalizados',
      icon: MdAssessment,
      href: '/reportes',
      color: 'from-orange-500 to-orange-600',
    }
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></span>
          Acciones Rápidas
        </h2>
        <Link href="/acciones" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
          Ver todas →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {actions.map((action) => {
          const IconComponent = action.icon;
          
          const content = (
            <div className={`bg-gradient-to-br ${action.color} text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group`}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <IconComponent className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="w-2 h-2 bg-white bg-opacity-30 rounded-full"></div>
              </div>
              
              <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
              
              <div className="mt-4 pt-2 border-t border-white border-opacity-20 flex justify-end">
                <span className="text-xs font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                  Click para acceder
                </span>
              </div>
            </div>
          );

          if (action.onClick) {
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className="text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={action.id}
              href={action.href}
              className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}