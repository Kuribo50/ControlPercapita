  // src/app/dashboard/page.tsx (corregido)
  "use client";

  import { useState, useEffect, useCallback } from 'react';
  import { TopBar } from '../components/dashboard/TopBar';
  import { StatsCards } from '../components/dashboard/StatsCard';
  import { UsersTable } from '../components/dashboard/UsersTable';
  import { QuickActions } from '../components/dashboard/QuickActions';
  import axios from 'axios';

  interface Registro {
    id: string;
    run: string;
    dv: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    fecha_nacimiento: string;
    genero: string;
    tramo: string;
    fecha_corte: string;
    cod_centro: string;
    nombre_centro: string;
    motivo: string;
    aceptado_rechazado: string;
  }

  interface Stats {
    total: number;
    aceptados: number;
    rechazados: number;
    nuevosInscritos: number;
    rechazosPrevisionales: number;
    trasladosNegativos: number;
    pendientesRevision: number;
  }

  export default function DashboardPage() {
    const [registros, setRegistros] = useState<Registro[]>([]);
    const [stats, setStats] = useState<Stats>({
      total: 0,
      aceptados: 0,
      rechazados: 0,
      nuevosInscritos: 0,
      rechazosPrevisionales: 0,
      trasladosNegativos: 0,
      pendientesRevision: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);

    const cargarDatos = useCallback(async () => {
      try {
        setLoading(true);
        setError("");
        
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.assign("/login");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;

        // Cargar datos en paralelo
        const [registrosRes, statsRes] = await Promise.all([
          axios.get(`${baseUrl}/api/v1/percapita/registros`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${baseUrl}/api/v1/percapita/stats`, { headers }).catch(() => ({ 
            data: { 
              total: 0, 
              aceptados: 0, 
              rechazados: 0, 
              nuevos_inscritos: 0,
              rechazos_previsionales: 0,
              traslados_negativos: 0,
              pendientes_revision: 0
            } 
          }))
        ]);

        setRegistros(registrosRes.data.registros || []);
        setStats({
          total: statsRes.data.total || 0,
          aceptados: statsRes.data.aceptados || 0,
          rechazados: statsRes.data.rechazados || 0,
          nuevosInscritos: statsRes.data.nuevos_inscritos || 0,
          rechazosPrevisionales: statsRes.data.rechazos_previsionales || 0,
          trasladosNegativos: statsRes.data.traslados_negativos || 0,
          pendientesRevision: statsRes.data.pendientes_revision || 0
        });
        
        setUltimaActualizacion(new Date());
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("No se pudieron cargar los datos del dashboard");
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.assign("/login");
        return;
      }
      cargarDatos();
    }, [cargarDatos]);

    // Agrupar registros por motivo
    const registrosPorMotivo = registros.reduce((acc: { [motivo: string]: Registro[] }, registro) => {
      const motivo = registro.motivo || 'Sin motivo';
      if (!acc[motivo]) acc[motivo] = [];
      acc[motivo].push(registro);
      return acc;
    }, {});

    const handleUsuarioClick = (usuario: Registro) => {
      console.log('Ver detalles del usuario:', usuario);
      // Aquí puedes abrir un modal o navegar a la página de detalles
    };

    return (
      <div className="min-h-screen flex">
              
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar 
            onRefresh={cargarDatos}
            loading={loading}
            totalRegistros={stats.total}
            ultimaActualizacion={ultimaActualizacion}
          />
          
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <span className="mr-2">⚠️</span>
                    {error}
                    <button 
                      onClick={cargarDatos}
                      className="ml-4 text-sm underline hover:no-underline"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              )}

              {/* Cards de Estadísticas */}
              <StatsCards stats={stats} loading={loading} />
              
              {/* Acciones Rápidas */}
              <QuickActions />
              
              {/* Tabla de Usuarios por Motivo */}
              <UsersTable 
                registrosPorMotivo={registrosPorMotivo} 
                loading={loading}
                onUsuarioClick={handleUsuarioClick}
              />
            </div>
          </main>
        </div>
      </div>
    );
  }