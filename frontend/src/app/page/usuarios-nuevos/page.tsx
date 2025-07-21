// src/app/usuarios-nuevos/page.tsx
"use client";

import { PageTemplate } from '../../components/shared/PageTemplate';
import { HiOutlineUser } from 'react-icons/hi2';
import { useState, useEffect } from 'react';

export default function UsuariosNuevosPage() {
  const [usuarios, setUsuarios] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroFecha, setFiltroFecha] = useState('hoy');

  useEffect(() => {
    setTimeout(() => {
      setUsuarios([
        {
          id: 1,
          run: "12345678-9",
          nombre: "Juan Carlos Pérez",
          telefono: "+56912345678",
          email: "juan.perez@email.com",
          fechaRegistro: "2024-01-20T10:30:00",
          estado: "pendiente",
          documentos: ["Cédula", "Comprobante domicilio"]
        },
        {
          id: 2,
          run: "98765432-1",
          nombre: "Ana María González",
          telefono: "+56987654321",
          email: "ana.gonzalez@email.com",
          fechaRegistro: "2024-01-20T14:15:00",
          estado: "documentos_pendientes",
          documentos: ["Cédula"]
        },
        {
          id: 3,
          run: "11223344-5",
          nombre: "Pedro Silva López",
          telefono: "+56911223344",
          email: "pedro.silva@email.com",
          fechaRegistro: "2024-01-19T16:45:00",
          estado: "validado",
          documentos: ["Cédula", "Comprobante domicilio", "Certificado médico"]
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getEstadoBadge = (estado: string) => {
    const configs = {
      'pendiente': { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      'documentos_pendientes': { color: 'bg-orange-100 text-orange-800', text: 'Docs. Pendientes' },
      'validado': { color: 'bg-green-100 text-green-800', text: 'Validado' },
      'rechazado': { color: 'bg-red-100 text-red-800', text: 'Rechazado' }
    };
    
    const config = configs[estado as keyof typeof configs] || configs.pendiente;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const fechaUsuario = new Date(usuario.fechaRegistro);
    const hoy = new Date();
    
    switch (filtroFecha) {
      case 'hoy':
        return fechaUsuario.toDateString() === hoy.toDateString();
      case 'semana':
        const semanaAtras = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
        return fechaUsuario >= semanaAtras;
      case 'mes':
        const mesAtras = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
        return fechaUsuario >= mesAtras;
      default:
        return true;
    }
  });

  return (
    <PageTemplate 
      title="Nuevos Usuarios" 
      icon={HiOutlineUser}
      color="emerald"
      actions={
        <div className="flex items-center space-x-4">
          <select
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          >
            <option value="hoy">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
            <option value="todos">Todos</option>
          </select>
          <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm font-medium">
            {usuariosFiltrados.length} nuevos
          </span>
        </div>
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-100 h-48 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usuariosFiltrados.map((usuario) => (
            <div key={usuario.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{usuario.nombre}</h3>
                  <p className="text-sm text-gray-600">RUN: {usuario.run}</p>
                </div>
                {getEstadoBadge(usuario.estado)}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-16 font-medium">Tel:</span>
                  <span>{usuario.telefono}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-16 font-medium">Email:</span>
                  <span className="truncate">{usuario.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-16 font-medium">Fecha:</span>
                  <span>{new Date(usuario.fechaRegistro).toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 mb-1">Documentos:</p>
                <div className="flex flex-wrap gap-1">
                  {usuario.documentos.map((doc: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700">
                  Validar
                </button>
                <button className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
                  Ver más
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTemplate>
  );
}