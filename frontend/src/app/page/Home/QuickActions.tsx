// src/app/components/dashboard/QuickActions.tsx
"use client";

import React from 'react';
import {
  MdUploadFile,
  MdFileDownload,
  MdPersonAdd,
  MdAssessment,
  MdPrint,
  MdHomeWork,
} from 'react-icons/md';
import Link from 'next/link';

export function QuickActions() {
  const printCertificate = (type: 'residencia' | 'inscripcion') => {
    const url = `/certificados/${type}`;
    const w = window.open(url, '_blank');
    if (w) {
      w.addEventListener('load', () => {
        w.print();
      });
    }
  };

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
      onClick: () => {
        console.log('Exportar datos');
        // Aquí tu lógica de exportación
      },
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
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
      id: 'print-residencia',
      title: 'Certificado Residencia',
      description: 'Imprimir certificado de residencia',
      icon: MdHomeWork,
      onClick: () => printCertificate('residencia'),
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
    },
    {
      id: 'print-inscripcion',
      title: 'Certificado Inscripción',
      description: 'Imprimir certificado de inscripción',
      icon: MdPrint,
      onClick: () => printCertificate('inscripcion'),
      color: 'bg-teal-500',
      hoverColor: 'hover:bg-teal-600',
    }
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Acciones Rápidas</h2>
      <div className="flex flex-col space-y-4">
        {actions.map(action => {
          const Icon = action.icon;
          const baseClasses = `flex items-start space-x-4 p-4 rounded-xl shadow transition transform hover:shadow-md hover:scale-[1.02] text-white`;
          const colorClasses = `${action.color} ${action.hoverColor}`;

          if (action.onClick) {
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`${baseClasses} ${colorClasses} w-full text-left`}
              >
                <Icon className="w-6 h-6 mt-1 opacity-90" />
                <div>
                  <h3 className="font-medium text-lg">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </button>
            );
          }

          return (
            <Link
              key={action.id}
              href={action.href!}
              className={`${baseClasses} ${colorClasses} w-full`}
            >
              <Icon className="w-6 h-6 mt-1 opacity-90" />
              <div>
                <h3 className="font-medium text-lg">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
