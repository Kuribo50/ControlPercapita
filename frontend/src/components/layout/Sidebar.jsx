// src/components/layout/Sidebar.jsx
import React, { useState } from 'react';
import {
  MdDashboard, MdPeople, MdSearch, MdUpload, MdAssessment,
  MdSettings, MdMenu, MdClose, MdChevronLeft, MdChevronRight
} from 'react-icons/md';

export default function Sidebar({ currentPage = 'dashboard' }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const links = [
    { 
      id: 'dashboard', 
      href: '/', 
      label: 'Dashboard', 
      icon: MdDashboard, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Resumen general del sistema'
    },
    { 
      id: 'new-users', 
      href: '/new-users', 
      label: 'Usuarios Nuevos', 
      icon: MdPeople, 
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Gestionar inscripciones nuevas'
    },
    { 
      id: 'review-cases', 
      href: '/review-cases', 
      label: 'Casos a Revisar', 
      icon: MdSearch, 
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Revisar casos pendientes'
    },
    { 
      id: 'upload', 
      href: '/upload', 
      label: 'Subir Corte', 
      icon: MdUpload, 
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      description: 'Cargar archivo FONASA'
    },
    { 
      id: 'reports', 
      href: '/reports', 
      label: 'Reportes', 
      icon: MdAssessment, 
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      description: 'Generar informes y estadísticas'
    },
  ];

  const isActive = (id) => id === currentPage;

  return (
    <>
      {/* Overlay para móvil */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Botón hamburguesa para móvil */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-md"
      >
        <MdMenu className="h-6 w-6 text-gray-600" />
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        ${isCollapsed ? 'w-16' : 'w-64'} 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-white border-r border-gray-200 shadow-lg
        transition-all duration-300 ease-in-out
        flex flex-col
      `}>
        
        {/* Header del sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <MdDashboard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-sm">Sistema Percápita</h1>
                <p className="text-xs text-gray-500">CESFAM Dr. Alberto Reyes</p>
              </div>
            </div>
          )}
          
          {/* Botón colapsar - solo desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-1 hover:bg-gray-100 rounded"
          >
            {isCollapsed ? (
              <MdChevronRight className="h-5 w-5 text-gray-500" />
            ) : (
              <MdChevronLeft className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {/* Botón cerrar - solo móvil */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 hover:bg-gray-100 rounded"
          >
            <MdClose className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-2">
          {links.map(({ id, href, label, icon: Icon, color, bgColor, description }) => {
            const active = isActive(id);
            
            return (
              
                key={id}
                href={href}
                className={`
                  group flex items-center px-3 py-3 text-sm font-medium rounded-lg
                  transition-all duration-200 ease-in-out
                  ${active 
                    ? `${color} ${bgColor} shadow-sm` 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                title={isCollapsed ? label : ''}
              >
                <Icon className={`
                  h-5 w-5 flex-shrink-0
                  ${active ? color : 'text-gray-400 group-hover:text-gray-500'}
                `} />
                
                {!isCollapsed && (
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="font-medium">{label}</div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {description}
                    </div>
                  </div>
                )}
                
                {!isCollapsed && active && (
                  <div className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`} />
                )}
              </a>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className="p-4 border-t border-gray-200">
          
            href="/settings"
            className={`
              group flex items-center px-3 py-2 text-sm font-medium rounded-lg
              text-gray-700 hover:bg-gray-50 hover:text-gray-900
              transition-colors duration-200
            `}
            title={isCollapsed ? 'Configuración' : ''}
          >
            <MdSettings className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            {!isCollapsed && <span className="ml-3">Configuración</span>}
          </a>
        </div>
      </div>
    </>
  );
}