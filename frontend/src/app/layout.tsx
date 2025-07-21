// src/app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'
import { Sidebar } from './components/layout/Sidebar'

export const metadata = {
  title: 'Sistema Percápita',
  description: 'Dashboard y herramientas de gestión',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head />
      <body>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar fijo */}
          <Sidebar />

          {/* Contenedor principal */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
