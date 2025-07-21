// src/components/layout/Sidebar.tsx (ACTUALIZADO con temática percápita)
"use client";

import React, { useState } from 'react';
import {
  MdDashboard,
  MdPersonAdd,
  MdPeopleOutline,
  MdAssignment,
  MdUploadFile,
  MdAssessment,
  MdSettings,
  MdSecurity,
  MdHelp,
  MdChevronLeft,
  MdChevronRight,
  MdLocalHospital
} from 'react-icons/md';
import Link from 'next/link';

interface SidebarProps {
  currentPage?: string;
}

export function Sidebar({ currentPage = 'dashboard' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const generalLinks = [
    { id: 'dashboard', href: '/', label: 'Dashboard', icon: MdDashboard },
    { id: 'usuarios-nuevos', href: '/usuarios-nuevos', label: 'Usuarios Nuevos', icon: MdPersonAdd, badge: 12 },
    { id: 'registros', href: '/registros', label: 'Registros FONASA', icon: MdPeopleOutline },
    { id: 'casos-revision', href: '/casos-revision', label: 'Casos a Revisar', icon: MdAssignment, badge: 3 },
  ];

  const toolsLinks = [
    { id: 'upload', href: '/upload', label: 'Subir Corte', icon: MdUploadFile },
    { id: 'reportes', href: '/reportes', label: 'Reportes', icon: MdAssessment },
    { id: 'validacion', href: '/validacion', label: 'Validación SIIS', icon: MdSecurity, badge: 'BETA' },
  ];

  const supportLinks = [
    { id: 'configuracion', href: '/configuracion', label: 'Configuración', icon: MdSettings },
    { id: 'ayuda', href: '/ayuda', label: 'Ayuda', icon: MdHelp },
  ];

  const isActive = (id: string) => id === currentPage;

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <MdLocalHospital className="text-white w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">Sistema Percápita</span>
              <p className="text-xs text-gray-500">CESFAM Dr. Alberto Reyes</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          {isCollapsed ? (
            <MdChevronRight className="w-5 h-5 text-gray-500" />
          ) : (
            <MdChevronLeft className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {/* General Section */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Gestión Percápita
            </h3>
          )}
          <nav className="space-y-1">
            {generalLinks.map(({ id, href, label, icon: Icon, badge }) => (
              <Link
                key={id}
                href={href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(id)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="ml-3">{label}</span>
                    {badge && (
                      <span className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Tools Section */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Herramientas
            </h3>
          )}
          <nav className="space-y-1">
            {toolsLinks.map(({ id, href, label, icon: Icon, badge }) => (
              <Link
                key={id}
                href={href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(id)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="ml-3">{label}</span>
                    {badge && (
                      <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Support Section */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Soporte
            </h3>
          )}
          <nav className="space-y-1">
            {supportLinks.map(({ id, href, label, icon: Icon }) => (
              <Link
                key={id}
                href={href}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="ml-3">{label}</span>}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}