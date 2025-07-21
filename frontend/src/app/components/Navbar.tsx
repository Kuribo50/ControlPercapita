'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()

  const logout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between">
      <div className="space-x-4">
        <Link href="/dashboard" className="font-semibold hover:underline">
          Dashboard
        </Link>
        <Link href="/upload" className="font-semibold hover:underline">
          Subir
        </Link>
      </div>
      <button
        onClick={logout}
        className="text-red-600 hover:underline text-sm"
      >
        Cerrar sesión
      </button>
    </nav>
  )
}
