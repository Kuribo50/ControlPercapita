// src/components/layout/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  MdDashboard, MdPeople, MdSearch, MdUpload, MdAssessment,
  MdNotifications, MdSettings, MdLogout, MdPerson,
  MdMenu, MdClose, MdKeyboardArrowDown,
} from 'react-icons/md';

export default function Navbar({ currentPage = 'dashboard', user = {}, onLogout }) {
  const [openMain, setOpenMain] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const navRef  = useRef(null);
  const userRef = useRef(null);

  // Cerrar menús si haces click fuera
  useEffect(() => {
    const handler = (e) => {
      if (
        !navRef.current?.contains(e.target) &&
        !userRef.current?.contains(e.target)
      ) {
        setOpenMain(false);
        setOpenUser(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const links = [
    { id: 'dashboard',    href: '/',           label: 'Dashboard',      icon: MdDashboard,    grad:'from-blue-500 to-blue-600' },
    { id: 'new-users',    href: '/new-users',  label: 'Usuarios Nuevos',icon: MdPeople,       grad:'from-emerald-500 to-emerald-600' },
    { id: 'review-cases', href: '/review-cases',label:'Casos a Revisar',icon: MdSearch,       grad:'from-amber-500 to-amber-600' },
    { id: 'upload',       href: '/upload',      label: 'Subir Archivo',  icon: MdUpload,       grad:'from-violet-500 to-violet-600' },
    { id: 'reports',      href: '/reports',     label: 'Reportes',       icon: MdAssessment,   grad:'from-cyan-500 to-cyan-600' },
  ];
  const active = (id) => id === currentPage;

  return (
    <nav ref={navRef} className="w-full backdrop-blur-md bg-white/70 border-b border-slate-200 shadow-lg">
      <div className="flex items-center justify-between h-16 px-3 sm:px-5 lg:px-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
            <MdDashboard className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight select-none">
            <h1 className="font-bold text-slate-800 whitespace-nowrap">Sistema Percápita</h1>
            <p className="text-[11px] text-slate-500 -mt-1">CESFAM Dr. Alberto Reyes</p>
          </div>
        </a>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-2">
          {links.map(({ id, href, label, icon: Icon, grad }) => (
            <li key={id} className="group relative">
              <a
                href={href}
                aria-current={active(id) ? 'page' : undefined}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${active(id)
                    ? `text-white bg-gradient-to-r ${grad}`
                    : `text-slate-600 hover:text-blue-600`}
                `}
              >
                <Icon className={`h-[18px] w-[18px] ${active(id) ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'}`} />
                {label}
              </a>
              {/* subrayado animado */}
              {!active(id) && (
                <span className="absolute left-0 -bottom-0.5 h-0.5 w-full origin-left scale-x-0 bg-blue-500 transition-transform duration-300 group-hover:scale-x-100" />
              )}
            </li>
          ))}
        </ul>

        {/* Acción derecha: notificaciones + usuario + burger */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Notificaciones"
            className="p-2 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
          >
            <MdNotifications className="h-5 w-5" />
          </button>

          {/* Usuario */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setOpenUser(!openUser)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-800">
                {user?.name || 'Usuario'}
              </span>
              <MdKeyboardArrowDown className={`h-4 w-4 transition-transform ${openUser ? 'rotate-180' : ''}`} />
            </button>
            {/* Dropdown usuario */}
            {openUser && (
              <div className="absolute right-0 mt-2 w-56 animate-fade-in bg-white rounded-xl border border-slate-200 shadow-lg z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="font-medium text-slate-800">{user?.name || 'Usuario'}</p>
                  <p className="text-xs text-slate-500">{user?.email || '—'}</p>
                </div>
                <a href="/profile"   className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50"><MdPerson   className="h-4 w-4"/> Perfil</a>
                <a href="/settings"  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50"><MdSettings className="h-4 w-4"/> Configuración</a>
                <hr className="my-1 border-slate-100" />
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <MdLogout className="h-4 w-4" /> Cerrar sesión
                </button>
              </div>
            )}
          </div>

          {/* Menú móvil */}
          <button
            onClick={() => setOpenMain(!openMain)}
            aria-label="Menú móvil"
            className="lg:hidden p-2 text-slate-500 hover:text-blue-600 transition-colors"
          >
            {openMain ? <MdClose className="h-6 w-6" /> : <MdMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {openMain && (
        <div className="lg:hidden animate-slide-down bg-white border-t border-slate-200">
          <ul className="px-4 py-4 space-y-1">
            {links.map(({ id, href, label, icon: Icon, grad }) => (
              <li key={id}>
                <a
                  href={href}
                  aria-current={active(id) ? 'page' : undefined}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-md font-medium transition-colors
                    ${active(id)
                      ? `text-white bg-gradient-to-r ${grad}`
                      : `text-slate-700 hover:text-blue-600 hover:bg-slate-100`}
                  `}
                >
                  <Icon className="h-5 w-5" /> {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
