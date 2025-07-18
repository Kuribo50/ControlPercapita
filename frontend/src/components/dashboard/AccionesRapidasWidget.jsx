// src/components/dashboard/AccionesRapidasWidget.jsx
import React from 'react';
import Card from './Card';
import { FiUserPlus, FiUpload, FiFileText, FiSearch } from 'react-icons/fi';

export default function AccionesRapidasWidget() {
  const items = [
    { href:'/new-users',    label:'Registrar Usuario Nuevo',    icon:<FiUserPlus />, bg:'bg-emerald-50', color:'text-emerald-700' },
    { href:'/upload',       label:'Subir Archivo FONASA',       icon:<FiUpload />,   bg:'bg-blue-50',   color:'text-blue-700' },
    { href:'/reports',      label:'Generar Reporte',            icon:<FiFileText />, bg:'bg-violet-50', color:'text-violet-700' },
    { href:'/review-cases', label:'Revisar Casos Pendientes',   icon:<FiSearch />,   bg:'bg-amber-50',  color:'text-amber-700' },
  ];
  return (
    <Card title="⚡ Acciones Rápidas">
      <div className="flex flex-col gap-2">
        {items.map(it=>(
          <a key={it.href} href={it.href}
             className={`flex items-center gap-2 p-3 rounded-md border border-transparent text-sm font-medium ${it.bg} ${it.color}
                        hover:border-slate-200 hover:bg-white hover:scale-105 transition transform`}>
            <span className="text-lg">{it.icon}</span>
            <span>{it.label}</span>
          </a>
        ))}
      </div>
    </Card>
  );
}
