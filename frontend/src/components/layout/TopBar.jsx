// src/components/layout/TopBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  MdNotifications, MdSettings, MdLogout, MdPerson,
  MdKeyboardArrowDown
} from 'react-icons/md';

export default function TopBar({ user = {}, onLogout }) {
  const [openUser, setOpenUser] = useState(false);
  const userRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!userRef.current?.contains(e.target)) {
        setOpenUser(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Breadcrumb o título dinámico */}
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {getPageTitle(window.location.pathname)}
            </h2>
            <p className="text-sm text-gray-500">
              {getPageDescription(window.location.pathname)}
            </p>
          </div>
        </div>

        {/* Acciones del usuario */}
        <div className="flex items-center space-x-4">
          {/* Notificaciones */}
          <button
            className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="Notificaciones"
          >
            <MdNotifications className="h-5 w-5" />
          </button>

          {/* Usuario */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setOpenUser(!openUser)}
              className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {user?.name || 'Usuario'}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.role || 'Operador'}
                </div>
              </div>
              <MdKeyboardArrowDown className={`h-4 w-4 text-gray-400 transition-transform ${openUser ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {openUser && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-medium text-gray-900">{user?.name || 'Usuario'}</p>
                  <p className="text-sm text-gray-500">{user?.email || '—'}</p>
                </div>
                
                <div className="py-1">
                  
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <MdPerson className="h-4 w-4 mr-3" />
                    Mi Perfil
                  </a>
                  
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <MdSettings className="h-4 w-4 mr-3" />
                    Configuración
                  </a>
                </div>
                
                <div className="border-t border-gray-100">
                  <button
                    onClick={onLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <MdLogout className="h-4 w-4 mr-3" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function getPageTitle(pathname) {
  const titles = {
    '/': 'Dashboard',
    '/new-users': 'Usuarios Nuevos',
    '/review-cases': 'Casos a Revisar',
    '/upload': 'Subir Corte FONASA',
    '/reports': 'Reportes y Estadísticas'
  };
  return titles[pathname] || 'Sistema Percápita';
}

function getPageDescription(pathname) {
  const descriptions = {
    '/': 'Resumen general del sistema de percápita',
    '/new-users': 'Gestión de nuevas inscripciones',
    '/review-cases': 'Revisión de casos pendientes',
    '/upload': 'Carga y procesamiento de archivos FONASA',
    '/reports': 'Análisis y generación de informes'
  };
  return descriptions[pathname] || 'Gestión del sistema de percápita';
}