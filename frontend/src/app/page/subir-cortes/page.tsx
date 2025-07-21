// src/app/subir-cortes/page.tsx
"use client";

import { PageTemplate } from '../../components/shared/PageTemplate';
import { HiCloudArrowUp } from 'react-icons/hi2';
import { useState, useRef } from 'react';

export default function SubirCortesPage() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [resultado, setResultado] = useState<unknown>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setArchivo(file);
      setResultado(null);
    }
  };

  const subirArchivo = async () => {
    if (!archivo) return;
    
    setCargando(true);
    setProgreso(0);
    
    // Simular subida con progreso
    const interval = setInterval(() => {
      setProgreso(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setCargando(false);
          setResultado({
            totalRegistros: 1250,
            procesados: 1180,
            errores: 70,
            duplicados: 15,
            nuevos: 1165
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const limpiarFormulario = () => {
    setArchivo(null);
    setResultado(null);
    setProgreso(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <PageTemplate 
      title="Subir Cortes" 
      icon={HiCloudArrowUp}
      color="rose"
      actions={
        <div className="text-sm text-gray-600">
          Formatos: Excel (.xlsx), CSV (.csv)
        </div>
      }
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Zona de subida */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-rose-400 transition-colors">
          <HiCloudArrowUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              Seleccionar archivo de corte
            </h3>
            <p className="text-gray-600">
              Arrastra y suelta tu archivo aquí, o haz clic para seleccionar
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            disabled={cargando}
          >
            Seleccionar archivo
          </button>
        </div>

        {/* Información del archivo */}
        {archivo && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-rose-900">Archivo seleccionado</h4>
                <p className="text-sm text-rose-700">
                  {archivo.name} ({(archivo.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={subirArchivo}
                  disabled={cargando}
                  className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 disabled:opacity-50"
                >
                  {cargando ? 'Procesando...' : 'Subir'}
                </button>
                <button
                  onClick={limpiarFormulario}
                  disabled={cargando}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Barra de progreso */}
        {cargando && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Procesando archivo...</span>
              <span>{progreso}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-rose-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progreso}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Resultados */}
        {resultado && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-medium text-green-900 mb-4">✅ Archivo procesado exitosamente</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{resultado.totalRegistros}</div>
                <div className="text-xs text-green-800">Total registros</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{resultado.procesados}</div>
                <div className="text-xs text-blue-800">Procesados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{resultado.nuevos}</div>
                <div className="text-xs text-green-800">Nuevos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{resultado.duplicados}</div>
                <div className="text-xs text-yellow-800">Duplicados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{resultado.errores}</div>
                <div className="text-xs text-red-800">Errores</div>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                Ver Detalles
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">
                Descargar Log
              </button>
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}