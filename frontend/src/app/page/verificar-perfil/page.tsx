// src/app/verificar-perfil/page.tsx
"use client";

import { useState } from 'react';
import { 
  MdSearch, 
  MdPerson, 
  MdVerified, 
  MdError,
  MdInfo
} from 'react-icons/md';

export default function VerificarPerfilPage() {
  const [run, setRun] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<unknown>(null);

  const buscarPerfil = async () => {
    if (!run) return;
    
    setLoading(true);
    // Simular búsqueda
    setTimeout(() => {
      setResultado({
        run: run,
        nombres: "Juan Carlos",
        apellidos: "González Pérez",
        estado: "Activo",
        centro: "CESFAM Dr. Alberto Reyes",
        ultimaActualizacion: "2024-01-15"
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <MdSearch className="w-6 h-6 text-emerald-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Verificar Perfil</h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RUN (sin puntos, con guión)
              </label>
              <input
                type="text"
                value={run}
                onChange={(e) => setRun(e.target.value)}
                placeholder="12345678-9"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={buscarPerfil}
                disabled={!run || loading}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Buscando...
                  </>
                ) : (
                  <>
                    <MdSearch className="w-4 h-4 mr-2" />
                    Buscar
                  </>
                )}
              </button>
            </div>
          </div>

          {resultado && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <MdPerson className="w-8 h-8 text-emerald-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-900">
                      {resultado.nombres} {resultado.apellidos}
                    </h3>
                    <p className="text-emerald-700">RUN: {resultado.run}</p>
                  </div>
                </div>
                <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <MdVerified className="w-4 h-4 mr-1" />
                  {resultado.estado}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-emerald-800">Centro de Salud</label>
                  <p className="text-emerald-900">{resultado.centro}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-emerald-800">Última Actualización</label>
                  <p className="text-emerald-900">{resultado.ultimaActualizacion}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}