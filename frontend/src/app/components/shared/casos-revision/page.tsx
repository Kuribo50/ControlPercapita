// src/app/casos-revision/page.tsx
"use client";

import { PageTemplate } from '../PageTemplate';
import { HiDocumentText } from 'react-icons/hi2';
import { useState, useEffect } from 'react';

export default function CasosRevisionPage() {
  const [casos, setCasos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga
    setTimeout(() => {
      setCasos([
        {
          id: 1,
          run: "12345678-9",
          nombre: "María González",
          motivo: "Documentos incompletos",
          prioridad: "Alta",
          fecha: "2024-01-20"
        },
        // más casos...
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <PageTemplate 
      title="Casos a Revisar" 
      icon={HiDocumentText}
      color="emerald"
      actions={
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
          5 pendientes
        </span>
      }
    >
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-100 h-16 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {casos.map((caso) => (
            <div key={caso.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{caso.nombre}</h3>
                  <p className="text-sm text-gray-500">RUN: {caso.run}</p>
                  <p className="text-sm text-gray-600">{caso.motivo}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    caso.prioridad === 'Alta' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {caso.prioridad}
                  </span>
                 <p className="text-xs text-gray-500 mt-1">
                   {new Date(caso.fecha).toLocaleDateString()}
                 </p>
                 <div className="flex space-x-2 mt-2">
                   <button className="px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700">
                     Revisar
                   </button>
                   <button className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700">
                     Diferir
                   </button>
                 </div>
               </div>
             </div>
           </div>
         ))}
       </div>
     )}
   </PageTemplate>
 );
}