// src/components/dashboard/DashboardMain.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { percapitaApi } from '../../utils/api';
import Loader from './Loader';
import StatsCard           from './StatsCard';
import TimelineWidget      from './TimelineWidget';
import CasosRevisionWidget from './CasosRevisionWidget';
import EvolutionChart      from './EvolutionChart';
import EstadisticasWidget  from './EstadisticasWidget';
import AlertasWidget       from './AlertasWidget';
import AccionesRapidasWidget from './AccionesRapidasWidget';
import GraficoCortes       from './GraficoCortes';

const initialState = { total_usuarios:0, casos_pendientes:0, usuarios_nuevos:0,
                       evolucion:[], actividad_reciente:[], casos_revision:[],
                       estadisticas_mes:{}, alertas_sistema:[], cortes:[], ultimo_corte:null };

export default function DashboardMain() {
  const [data,setData]         = useState(initialState);
  const [loading,setLoading]   = useState(true);
  const [refreshing,setRefreshing] = useState(false);
  const [lastUpdated,setLastUpdated] = useState(null);

  const loadDashboard = useCallback(async()=>{
    try {
      setRefreshing(true);
      const [
        dash, {casos=[]}={}, stats={}, alerts=[], cortes=[]
      ] = await Promise.all([
        percapitaApi.getDashboard(),
        percapitaApi.getCasosRevision().catch(()=>({})),
        percapitaApi.getEstadisticasMes().catch(()=>({})),
        percapitaApi.getAlertasSistema().catch(()=>[]),
        percapitaApi.getCortes().catch(()=>[]),
      ]);
      setData({
        total_usuarios:dash.total_usuarios||0,
        casos_pendientes:dash.casos_pendientes||0,
        usuarios_nuevos:dash.usuarios_nuevos||0,
        evolucion:dash.evolucion||[],
        actividad_reciente:dash.actividad_reciente||[],
        casos_revision:casos,
        estadisticas_mes:stats,
        alertas_sistema:alerts,
        cortes:cortes,
        ultimo_corte:cortes[0]||null
      });
      setLastUpdated(new Date());
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  },[]);

  useEffect(()=>{ loadDashboard(); },[loadDashboard]);

  if (loading) return <Loader msg="Cargando dashboard…" />;

  const cf = data.ultimo_corte?.fecha_corte ? new Date(data.ultimo_corte.fecha_corte) : null;
  const diaMes = cf ? `${String(cf.getDate()).padStart(2,'0')}/${String(cf.getMonth()+1).padStart(2,'0')}` : '—';
  const mesAnio = cf ? cf.toLocaleString('es-ES',{month:'short',year:'numeric'}) : '—';

  return (
    <div className="flex flex-col gap-8">
      <header className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-8 text-white flex justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold mb-1">📊 Dashboard de Control</h1>
          <p className="opacity-90">Resumen ejecutivo del sistema de percápita</p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-80">Última actualización:</p>
          <p className="text-lg font-semibold">
            { lastUpdated?.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'}) || '—' }
          </p>
          <button onClick={loadDashboard} disabled={refreshing}
            className="mt-2 inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-3 py-1.5 rounded-md transition">
            {refreshing
              ? <span className="animate-spin">🔄</span>
              : <span>🔄 Actualizar</span>
            }
          </button>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Usuarios"   value={data.total_usuarios}   icon="👥" color="bg-blue-500"    trend="up"       change="+2,3 % vs mes ant." />
        <StatsCard title="Casos Pendientes" value={data.casos_pendientes} icon="⚠️" color="bg-amber-500"  trend="attention"change="Requieren atención" />
        <StatsCard title="Usuarios Nuevos"  value={data.usuarios_nuevos}  icon="✨" color="bg-emerald-500" trend="up"       change="Este mes" />
        <StatsCard title="Último Corte"     value={diaMes}               icon="📅" color="bg-violet-500" trend="neutral" change={mesAnio} />
      </section>

      <GraficoCortes cortes={data.cortes} />

      <section className="grid gap-8 lg:grid-cols-2">
        <TimelineWidget actividades={data.actividad_reciente} />
        <CasosRevisionWidget casos={data.casos_revision} />
      </section>

      {data.evolucion.length>0 && <EvolutionChart data={data.evolucion} />}

      <section className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        <EstadisticasWidget estadisticas={data.estadisticas_mes} />
        <AlertasWidget alertas={data.alertas_sistema} />
        <AccionesRapidasWidget />
      </section>
    </div>
  );
}
