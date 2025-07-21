// src/app/components/layout/Sidebar.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  // Iconos principales
  HiHome,
  HiMagnifyingGlass,
  HiOutlineQrCode,
  HiDocumentText,
  HiOutlineUser,
  HiCheckCircle,
  HiXCircle,
  HiArrowsRightLeft,
  HiCloudArrowUp,
  HiEye,
  HiUsers,
  HiArrowDownTray,
  HiDocument,
  HiClock,
  HiArrowRightOnRectangle,
  HiArrowPath,
  HiCog8Tooth,
  HiQuestionMarkCircle,
  // Iconos de control
  HiChevronLeft,
  HiChevronRight,
  HiChevronDown,
  HiBars3,
  HiXMark,
  // Iconos especiales
  HiHeart,
  HiOutlineViewColumns,
  HiOutlineMinus,
  HiOutlinePlus
} from 'react-icons/hi2';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

// ==================== INTERFACES ====================
interface LinkItem {
  id: string;
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

interface MenuSectionDef {
  title: string;
  items: LinkItem[];
  color?: string;
}

// ==================== CONFIGURACIÓN DE DATOS ====================
const inicioItems: LinkItem[] = [
  { 
    id: 'home', 
    href: '/page/Home', 
    label: 'Inicio', 
    icon: HiHome 
  }
];

const nestedSections: MenuSectionDef[] = [
  {
    title: 'Percápita',
    color: 'emerald',
    items: [
      { id: 'verificar-perfil', href: '/page/verificar-perfil', label: 'Verificar Perfil', icon: HiMagnifyingGlass },
      { id: 'revisar-codigos', href: '/page/revisar-codigos', label: 'Revisar Códigos', icon: HiOutlineQrCode },
      { id: 'casos-revision', href: '/page/casos-revision', label: 'Casos a Revisar', icon: HiDocumentText, badge: 5 },
      { id: 'nuevos-usuarios', href: '/page/usuarios-nuevos', label: 'Nuevos Usuarios', icon: HiOutlineUser, badge: 12 },
      { id: 'no-validados', href: '/page/no-validados', label: 'No Validados', icon: HiXCircle },
      { id: 'validados', href: '/page/validados', label: 'Validados', icon: HiCheckCircle },
    ]
  },
  {
    title: 'Afiliaciones',
    color: 'purple',
    items: [
      { id: 'desafiliaciones', href: '/page/desafiliaciones', label: 'Desafiliaciones', icon: HiOutlineUser },
      { id: 'inscripcion-migrantes', href: '/page/inscripcion-migrantes', label: 'Inscripción Migrantes', icon: HiOutlineUser },
      { id: 'traslado-sector', href: '/page/traslado-sector', label: 'Traslado de Sector', icon: HiArrowsRightLeft },
      { id: 'traslado-centro', href: '/page/traslado-centro', label: 'Traslado de Centro', icon: HiArrowsRightLeft },
    ]
  },
  {
    title: 'Certificados y Reportes',
    color: 'blue',
    items: [
      { id: 'certificados-residencia', href: '/page/certificados-residencia', label: 'Certificados de Residencia', icon: HiDocument },
      { id: 'certificado-inscripcion', href: '/page/certificado-inscripcion', label: 'Certificado de Inscripción', icon: HiDocument },
      { id: 'exportar', href: '/page/exportar', label: 'Exportar', icon: HiArrowDownTray },
    ]
  },
  {
    title: 'Otros Trámites',
    color: 'amber',
    items: [
      { id: 'carencias', href: '/page/carencias', label: 'Carencias', icon: HiClock },
      { id: 'renuncias', href: '/page/renuncias', label: 'Renuncias', icon: HiArrowRightOnRectangle },
      { id: 'renovaciones-nip', href: '/page/renovaciones-nip', label: 'Renovaciones NIP', icon: HiArrowPath },
    ]
  },
  {
    title: 'Gestión de Cortes',
    color: 'rose',
    items: [
      { id: 'subir-cortes', href: '/page/subir-cortes', label: 'Subir Cortes', icon: HiCloudArrowUp },
      { id: 'ver-cortes', href: '/page/ver-cortes', label: 'Ver Cortes', icon: HiEye },
      { id: 'administrar-usuarios', href: '/page/administrar-usuarios', label: 'Administrar Usuarios', icon: HiUsers },
    ]
  },
  {
    title: 'Configuración',
    color: 'slate',
    items: [
      { id: 'configuracion', href: '/page/configuracion', label: 'Configuración', icon: HiCog8Tooth },
      { id: 'ayuda', href: '/page/ayuda', label: 'Ayuda', icon: HiQuestionMarkCircle },
    ]
  }
];
// ==================== UTILIDADES ====================
const getColorClasses = (color: string, active: boolean) => {
  const colorMap = {
    blue: {
      active: 'bg-blue-50 text-blue-700 border-r-3 border-blue-500',
      inactive: 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/60'
    },
    emerald: {
      active: 'bg-emerald-50 text-emerald-700 border-r-3 border-emerald-500',
      inactive: 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50/60'
    },
    purple: {
      active: 'bg-purple-50 text-purple-700 border-r-3 border-purple-500',
      inactive: 'text-gray-600 hover:text-purple-600 hover:bg-purple-50/60'
    },
    amber: {
      active: 'bg-amber-50 text-amber-700 border-r-3 border-amber-500',
      inactive: 'text-gray-600 hover:text-amber-600 hover:bg-amber-50/60'
    },
    rose: {
      active: 'bg-rose-50 text-rose-700 border-r-3 border-rose-500',
      inactive: 'text-gray-600 hover:text-rose-600 hover:bg-rose-50/60'
    },
    slate: {
      active: 'bg-slate-50 text-slate-700 border-r-3 border-slate-500',
      inactive: 'text-gray-600 hover:text-slate-600 hover:bg-slate-50/60'
    }
  };
  
  const colorConfig = colorMap[color as keyof typeof colorMap] || colorMap.blue;
  return active ? colorConfig.active : colorConfig.inactive;
};

// ==================== COMPONENTES ====================
function SidebarLink({
  item,
  isActive,
  collapsed,
  sectionColor = 'blue',
  onClick
}: {
  item: LinkItem;
  isActive: boolean;
  collapsed: boolean;
  sectionColor?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        group flex items-center relative rounded-lg text-sm font-medium 
        transition-all duration-200 ease-out
        ${collapsed ? 'p-2 justify-center' : 'px-3 py-2'}
        ${getColorClasses(sectionColor, isActive)}
      `}
    >
      {/* Icono */}
      {item.icon && (
        <div className="relative flex-shrink-0">
          <item.icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
          {collapsed && item.badge && (
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
      )}
      
      {/* Contenido expandido */}
      {!collapsed && (
        <>
          <span className="flex-1 ml-2.5 truncate">{item.label}</span>
          {item.badge && (
            <span className="ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
              {item.badge}
            </span>
          )}
        </>
      )}
      
      {/* Tooltip para estado colapsado */}
      {collapsed && (
        <div className="
          absolute left-full ml-2 px-2 py-1.5 bg-gray-900 text-white text-xs rounded-md 
          opacity-0 invisible group-hover:opacity-100 group-hover:visible 
          transition-all duration-200 whitespace-nowrap z-50 pointer-events-none
        ">
          {item.label}
          {item.badge && (
            <span className="ml-1.5 px-1 py-0.5 bg-red-500 text-xs rounded-full">
              {item.badge}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

function MenuSection({
  section,
  collapsed,
  isActive,
  isOpen,
  onToggle,
  onItemClick
}: {
  section: MenuSectionDef;
  collapsed: boolean;
  isActive: (href: string) => boolean;
  isOpen: boolean;
  onToggle: () => void;
  onItemClick?: () => void;
}) {
  const hasActiveItem = section.items.some(item => isActive(item.href));
  const totalBadges = section.items.reduce((sum, item) => {
    const badge = item.badge;
    return sum + (typeof badge === 'number' ? badge : 0);
  }, 0);

  // Vista colapsada
  if (collapsed) {
    return (
      <div className="relative group mb-2">
        <div className="flex flex-col items-center space-y-1">
          {section.items.map(item => (
            <SidebarLink
              key={item.id}
              item={item}
              isActive={isActive(item.href)}
              collapsed={collapsed}
              sectionColor={section.color}
              onClick={onItemClick}
            />
          ))}
        </div>
        
        {/* Tooltip para sección colapsada */}
        <div className="
          absolute left-full ml-2 px-2 py-1.5 bg-gray-900 text-white text-xs rounded-md
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all duration-200 whitespace-nowrap z-50 pointer-events-none
        ">
          {section.title}
          {totalBadges > 0 && (
            <span className="ml-1.5 px-1 py-0.5 bg-red-500 text-xs rounded-full">
              {totalBadges}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Vista expandida
  return (
    <div className="mb-3">
      {/* Header de sección */}
      <button
        onClick={onToggle}
        className={`
          flex items-center w-full px-3 py-2 text-xs font-semibold uppercase tracking-wide
          rounded-lg transition-all duration-200 group
          ${hasActiveItem || isOpen
            ? `text-${section.color}-700 bg-${section.color}-50/40`
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        <span className="flex-1 text-left">{section.title}</span>
        
        {/* Badge total */}
        {totalBadges > 0 && (
          <span className="mx-1.5 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
            {totalBadges}
          </span>
        )}
        
        {/* Icono de collapse */}
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <HiChevronDown className="w-3 h-3" />
        </div>
      </button>
      
      {/* Contenido de sección */}
      <div className={`
        overflow-hidden transition-all duration-300 ease-out
        ${isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}
      `}>
        <div className="pl-1 space-y-0.5">
          {section.items.map(item => (
            <SidebarLink
              key={item.id}
              item={item}
              isActive={isActive(item.href)}
              collapsed={false}
              sectionColor={section.color}
              onClick={onItemClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SidebarHeader({ shouldExpand, isMobile, onToggle, onClose }: {
  shouldExpand: boolean;
  isMobile: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className={`flex items-center p-4 border-b border-gray-200/60 bg-gradient-to-r from-blue-50/30 to-emerald-50/30 ${shouldExpand ? 'justify-between' : 'justify-center'}`}>
      {shouldExpand && (
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
            <HiHeart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">Sistema Percápita</h1>
            <p className="text-xs text-gray-600">CESFAM Dr. Alberto Reyes</p>
          </div>
        </div>
      )}
      {/* Botón colapsar animado */}
      <button
        onClick={isMobile ? onClose : onToggle}
        className={`p-1.5 rounded-lg hover:bg-white/60 transition-all duration-200 hover:scale-105
          relative flex items-center justify-center
          ${shouldExpand ? 'order-2 ml-auto' : 'order-1 mr-auto'}
        `}
        aria-label={shouldExpand ? 'Colapsar barra lateral' : 'Expandir barra lateral'}
      >
        {isMobile ? (
          <HiXMark className="w-4 h-4 text-gray-600" />
        ) : (
          <span
            className={`inline-block transition-transform duration-300 ease-in-out
              ${shouldExpand ? 'rotate-0' : 'rotate-180'}
            `}
          >
            {shouldExpand ? (
              <HiChevronLeft className="w-4 h-4 text-gray-600" />
            ) : (
              <HiChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </span>
        )}
      </button>
    </div>
  );
}

function ToggleAllButton({ allOpen, onToggle }: {
  allOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="px-4 py-2 border-b border-gray-200/40">
      <button
        onClick={onToggle}
        className="flex items-center space-x-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
      >
        {allOpen ? (
          <>
            <HiOutlineMinus className="w-3 h-3" />
            <span>Colapsar</span>
          </>
        ) : (
          <>
            <HiOutlinePlus className="w-3 h-3" />
            <span>Expandir</span>
          </>
        )}
      </button>
    </div>
  );
}

function LogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="p-4 border-t border-gray-200/60 bg-gradient-to-r from-gray-50/30 to-red-50/30">
      <button
        onClick={onLogout}
        className="
          group flex items-center w-full space-x-2 px-3 py-2 text-sm font-medium 
          text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 
          hover:scale-[1.01]
        "
      >
        <HiArrowRightOnRectangle className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
        <span>Cerrar Sesión</span>
      </button>
    </div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================
export function Sidebar() {
  // Estados
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [sectionStates, setSectionStates] = useState<Record<string, boolean>>({});
  
  // Hooks
  const pathname = usePathname();
  const router = useRouter();

  // Efectos
  useEffect(() => {
    const initialStates: Record<string, boolean> = {};
    nestedSections.forEach(section => {
      initialStates[section.title] = false;
    });
    setSectionStates(initialStates);
  }, []);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(true);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Funciones
  const isActive = (href: string) => pathname === href;
  const shouldExpand = !isMobile && (isHovered || !isCollapsed);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const toggleAllSections = () => {
    const allOpen = Object.values(sectionStates).every(state => state);
    const newStates: Record<string, boolean> = {};
    nestedSections.forEach(section => {
      newStates[section.title] = !allOpen;
    });
    setSectionStates(newStates);
  };

  const toggleSection = (title: string) => {
    setSectionStates(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <>
      {/* Overlay móvil */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Botón hamburguesa móvil */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 lg:hidden transition-all duration-200 hover:shadow-xl"
        >
          <HiBars3 className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* Sidebar principal */}
      <aside
        className={`
          bg-white/95 backdrop-blur-lg border-r border-gray-200/60 flex flex-col h-screen 
          transition-all duration-300 ease-out shadow-xl
          ${isMobile
            ? `fixed top-0 left-0 z-50 h-full transform ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : shouldExpand
            ? 'w-64'
            : 'w-16'
          }
        `}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
        {/* Header */}
        <SidebarHeader
          shouldExpand={shouldExpand}
          isMobile={isMobile}
          onToggle={() => setIsCollapsed(c => !c)}
          onClose={() => setIsOpen(false)}
        />

        {/* Botón toggle all */}
        {shouldExpand && (
          <ToggleAllButton
            allOpen={Object.values(sectionStates).every(state => state)}
            onToggle={toggleAllSections}
          />
        )}

        {/* Navegación */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {/* Sección Inicio */}
          <div>
            {shouldExpand && (
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2 px-3">
                Inicio
              </h3>
            )}
            <div className="space-y-0.5">
              {inicioItems.map(item => (
                <SidebarLink
                  key={item.id}
                  item={item}
                  isActive={isActive(item.href)}
                  collapsed={!shouldExpand}
                  sectionColor="blue"
                  onClick={() => isMobile && setIsOpen(false)}
                />
              ))}
            </div>
          </div>

          {/* Secciones principales */}
          {nestedSections.map(section => (
            <MenuSection
              key={section.title}
              section={section}
              collapsed={!shouldExpand}
              isActive={isActive}
              isOpen={sectionStates[section.title] || false}
              onToggle={() => toggleSection(section.title)}
              onItemClick={() => isMobile && setIsOpen(false)}
            />
          ))}
        </div>

        {/* Footer */}
        {shouldExpand && <LogoutButton onLogout={handleLogout} />}
      </aside>

      {/* Estilos personalizados */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(241, 245, 249, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.8);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.9);
        }
      `}</style>
    </>
  );
}