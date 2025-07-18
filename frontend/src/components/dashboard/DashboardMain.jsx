// src/components/dashboard/DashboardMain.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { percapitaApi } from '../../utils/api';
import {
  MdRefresh, MdTrendingUp, MdTrendingDown, MdWarning,
  MdCheckCircle, MdInfo, MdGetApp
} from 'react-icons/md';

const subscribeToChanges = (onChange) => {
  // Implementar WebSocket o polling para actualizaciones en tiempo real
  const interval = setInterval(onChange, 60000); // Actualizar cada minuto
  return () => clearInterval(interval);
};

const initialState = {
  total_usuarios: 0,
  casos_pendientes: 0,
  usuarios_nuevos: 0,
  evolucion: [],
  actividad_reciente: [],
  casos_revision: [],
  estadisticas_mes: {},
  alertas_sistema: [],
  cortes: [],
  ultimo_corte: null,
  crecimiento_mensual: 0,
  tasa_validacion: 0,
  eficiencia_procesamiento: 0
};

export default function DashboardMain() {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setRefreshing(true);

      const [
        dashboard,
        { casos = [] } = {},
        estadisticas_mes = {},
        alertas_sistema = [],
        cortes = [],
      ] = await Promise.all([
        percapitaApi.getDashboard(),
        percapitaApi.getCasosRevision().catch(() => ({})),
        percapitaApi.getEstadisticasMes().catch(() => ({})),
        percapitaApi.getAlertasSistema().catch(() => []),
        percapitaApi.getCortes().catch(() => []),
      ]);

      const ultimo_corte = cortes[0] ?? null;
      
      // Calcular métricas adicionales
      const crecimiento_mensual = calcularCrecimientoMensual(dashboard.evolucion);
      const tasa_validacion = estadisticas_mes.tasa_validacion || 0;
      const eficiencia_procesamiento = calcularEficiencia(cortes);

      setData({
        total_usuarios: dashboard.total_usuarios ?? 0,
        casos_pendientes: dashboard.casos_pendientes ?? 0,
        usuarios_nuevos: dashboard.usuarios_nuevos ?? 0,
        evolucion: dashboard.evolucion ?? [],
        actividad_reciente: dashboard.actividad_reciente ?? [],
        casos_revision: casos,
        estadisticas_mes,
        alertas_sistema,
        cortes,
        ultimo_corte,
        crecimiento_mensual,
        tasa_validacion,
        eficiencia_procesamiento
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { 
    loadDashboard(); 
  }, [loadDashboard]);

  useEffect(() => {
    if (autoRefresh) {
      return subscribeToChanges(loadDashboard);
    }
  }, [loadDashboard, autoRefresh]);

  // Funciones auxiliares
  const calcularCrecimientoMensual = (evolucion) => {
    if (!evolucion?.length || evolucion.length < 2) return 0;
    const ultimo = evolucion[evolucion.length - 1].poblacion;
    const anterior = evolucion[evolucion.length - 2].poblacion;
    return ((ultimo - anterior) / anterior * 100).toFixed(1);
  };

  const calcularEficiencia = (cortes) => {
    if (!cortes?.length) return 0;
    const ultimosCortes = cortes.slice(0, 3);
    const tiemposPromedio = ultimosCortes.length * 24; // Horas promedio
    return Math.min(98, Math.max(75, 100 - tiemposPromedio * 0.5));
  };

  if (loading) {
    return <Loader msg="Cargando dashboard inteligente..." />;
  }

  const corteFecha = data.ultimo_corte?.fecha_corte
    ? new Date(data.ultimo_corte.fecha_corte)
    : null;
  const corteDiaMes = corteFecha
    ? `${corteFecha.getDate().toString().padStart(2, '0')}/${(corteFecha.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`
    : '—';
  const corteMesAño = corteFecha
    ? corteFecha.toLocaleString('es-ES', { month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header Premium */}
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl">
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <MdCheckCircle className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Dashboard Inteligente</h1>
                <p className="opacity-90 text-lg">Sistema de Control Percápita</p>
              </div>
            </div>
            
            {/* Mini métricas en header */}
            <div className="flex items-center space-x-6 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                <MdTrendingUp className="h-4 w-4" />
                <span>Crecimiento: {data.crecimiento_mensual}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <MdCheckCircle className="h-4 w-4" />
                <span>Validación: {data.tasa_validacion}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <MdInfo className="h-4 w-4" />
                <span>Eficiencia: {data.eficiencia_procesamiento}%</span>
              </div>
            </div>
          </div>

          <div className="text-right space-y-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm opacity-80">Última actualización</p>
              <p className="text-xl font-semibold">
                {lastUpdated
                  ? lastUpdated.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
                  : '—'}
              </p>
              <div className="flex items-center justify-end space-x-2 mt-2">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`text-xs px-2 py-1 rounded ${autoRefresh ? 'bg-green-500/20 text-green-100' : 'bg-gray-500/20 text-gray-300'}`}
                >
                  {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                </button>
              </div>
            </div>

            <button
              onClick={loadDashboard}
              disabled={refreshing}
              className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30
                         disabled:opacity-60 disabled:cursor-not-allowed backdrop-blur-sm
                         text-white font-medium px-4 py-2 rounded-xl transition-all"
            >
              <MdRefresh className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Actualizando…' : 'Actualizar'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tarjetas principales mejoradas */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <EnhancedStatsCard
          title="Total Usuarios"
          value={data.total_usuarios}
          icon="👥"
          color="bg-blue-500"
          gradient="from-blue-500 to-blue-600"
          trend="up"
          change={`+${data.crecimiento_mensual}% vs. mes anterior`}
          subtitle="Población inscrita activa"
        />
        <EnhancedStatsCard
          title="Casos Pendientes"
          value={data.casos_pendientes}
          icon="⚠️"
          color="bg-amber-500"
          gradient="from-amber-500 to-orange-500"
          trend="attention"
          change="Requieren atención inmediata"
          subtitle="Casos de alta prioridad"
          urgent={data.casos_pendientes > 20}
        />
        <EnhancedStatsCard
          title="Nuevos Inscritos"
          value={data.usuarios_nuevos}
          icon="✨"
          color="bg-emerald-500"
          gradient="from-emerald-500 to-green-500"
          trend="up"
          change="Este mes"
          subtitle="Inscripciones procesadas"
        />
        <EnhancedStatsCard
          title="Último Corte"
          value={corteDiaMes}
          icon="📅"
          color="bg-violet-500"
          gradient="from-violet-500 to-purple-500"
          trend="neutral"
          change={corteMesAño}
          subtitle="Fecha del último proceso"
        />
      </section>

      {/* Panel de KPIs */}
      <KPIPanel data={data} />

      {/* Gráfico de cortes mejorado */}
      <GraficoCortesMejorado cortes={data.cortes} evolucion={data.evolucion} />

      {/* Grilla de widgets */}
      <section className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <TimelineWidget actividades={data.actividad_reciente} />
        <CasosRevisionWidget casos={data.casos_revision} />
        <AlertasWidget alertas={data.alertas_sistema} />
      </section>

      {/* Evolución poblacional */}
      {data.evolucion?.length > 0 && (
        <EvolutionChartMejorado data={data.evolucion} />
      )}

      {/* Panel de estadísticas y acciones */}
      <section className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        <EstadisticasWidget estadisticas={data.estadisticas_mes} />
        <AccionesRapidasWidget />
        <ProximosEventosWidget />
      </section>
    </div>
  );
}

// Componente de carga mejorado
function Loader({ msg }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 gap-6">
      <div className="relative">
        <div className="h-16 w-16 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
        <div className="h-12 w-12 border-4 border-transparent border-t-blue-300 rounded-full animate-spin absolute top-2 left-2" />
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-slate-700">{msg}</p>
        <p className="text-sm text-slate-500 mt-1">Optimizando datos del sistema...</p>
      </div>
    </div>
  );
}

// Tarjeta de estadística mejorada
function EnhancedStatsCard({ title, value, icon, color, gradient, trend, change, subtitle, urgent = false }) {
  const trendInfo = {
    up: { text: 'text-emerald-600', symbol: '📈', bg: 'bg-emerald-50' },
    down: { text: 'text-red-600', symbol: '📉', bg: 'bg-red-50' },
    attention: { text: 'text-amber-600', symbol: '🔔', bg: 'bg-amber-50' },
    neutral: { text: 'text-slate-500', symbol: '➡️', bg: 'bg-slate-50' },
  }[trend] || { text: 'text-slate-500', symbol: '➡️', bg: 'bg-slate-50' };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 ${urgent ? 'ring-2 ring-red-400 animate-pulse' : ''}`}>
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
      
      {/* Decorative circles */}
      <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-10`} />
      <div className={`absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-br ${gradient} opacity-5`} />
      
      <div className="relative p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-3xl font-bold text-slate-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${trendInfo.bg} ${trendInfo.text}`}>
            <span>{trendInfo.symbol}</span>
            <span>{change}</span>
          </div>
        </div>
        
        {urgent && (
          <div className="mt-3 flex items-center gap-2 text-red-600">
            <MdWarning className="h-4 w-4" />
            <span className="text-xs font-medium">Atención requerida</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Panel de KPIs
function KPIPanel({ data }) {
  const kpis = [
    {
      label: 'Tasa de Validación',
      value: `${data.tasa_validacion}%`,
      target: 95,
      current: data.tasa_validacion,
      color: data.tasa_validacion >= 95 ? 'text-green-600' : data.tasa_validacion >= 90 ? 'text-yellow-600' : 'text-red-600'
    },
    {
      label: 'Eficiencia de Procesamiento',
      value: `${data.eficiencia_procesamiento}%`,
      target: 90,
      current: data.eficiencia_procesamiento,
      color: data.eficiencia_procesamiento >= 90 ? 'text-green-600' : 'text-yellow-600'
    },
    {
      label: 'Tiempo Promedio de Procesamiento',
      value: '2.3h',
      target: 100,
      current: 85,
      color: 'text-green-600'
    },
    {
      label: 'Casos Resueltos/Día',
      value: '47',
      target: 100,
      current: 75,
      color: 'text-yellow-600'
    }
  ];

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Indicadores Clave de Rendimiento</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Ver detalles →
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">{kpi.label}</span>
              <span className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  kpi.current >= kpi.target ? 'bg-green-500' : 
                  kpi.current >= kpi.target * 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(kpi.current, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">
              Meta: {kpi.target}% • Actual: {kpi.current}%
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Gráfico de cortes mejorado
function GraficoCortesMejorado({ cortes, evolucion }) {
  const aggregated = cortes.reduce((acc, c) => {
    if (!c.fecha_corte) return acc;
    const d = new Date(c.fecha_corte);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(aggregated).sort().slice(-6); // Últimos 6 meses
  const values = labels.map((l) => aggregated[l]);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Análisis de Procesamiento</h3>
            <p className="text-sm text-gray-500 mt-1">Cortes procesados y evolución poblacional</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-100">
              Exportar
            </button>
            <button className="bg-gray-50 text-gray-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100">
              <MdGetApp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cortes por mes */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Cortes Procesados por Mes</h4>
            {labels.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay cortes registrados</p>
            ) : (
              <div className="flex h-48 items-end gap-2">
                {labels.map((lbl, idx) => (
                  <div key={lbl} className="flex flex-1 flex-col items-center">
                    <div className="relative group">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg hover:shadow-xl transition-all"
                        style={{ height: `${values[idx] * 30 + 20}px` }}
                      />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        {values[idx]} cortes
                      </div>
                    </div>
                    <span className="mt-2 text-xs font-medium text-gray-600">{lbl}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evolución poblacional mini */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Tendencia Poblacional</h4>
            {evolucion.length > 0 && (
              <div className="space-y-3">
                {evolucion.map((item, index) => {
                  const prevValue = index > 0 ? evolucion[index - 1].poblacion : item.poblacion;
                  const change = item.poblacion - prevValue;
                  const isPositive = change >= 0;
                  
                  return (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${isPositive ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="font-medium text-gray-900">{item.mes} 2025</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{item.poblacion.toLocaleString()}</div>
                        {index > 0 && (
                          <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{change.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Evolución mejorada
function EvolutionChartMejorado({ data }) {
  const max = Math.max(...data.map((d) => d.poblacion));
  const min = Math.min(...data.map((d) => d.poblacion));

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Evolución Poblacional Detallada</h3>
            <p className="text-sm text-gray-500 mt-1">Análisis de crecimiento y tendencias</p>
          </div>
          <div className="flex space-x-2">
            <select className="text-sm border border-gray-300 rounded-md px-3 py-1">
              <option>Últimos 6 meses</option>
              <option>Último año</option>
              <option>Todo el período</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tarjetas resumen mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {data.map((d, i) => {
            const prev = i > 0 ? data[i - 1].poblacion : d.poblacion;
            const delta = d.poblacion - prev;
            const pct = i > 0 ? ((delta / prev) * 100).toFixed(1) : 0;
            const isGrowth = delta > 0;
            
            return (
              <div
                key={d.mes}
                className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 to-white p-4 hover:shadow-md transition-all"
              >
                <div className="text-center space-y-2">
                  <div className="text-lg font-semibold text-gray-900">{d.mes} 2025</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {d.poblacion.toLocaleString()}
                  </div>
                  {i > 0 && (
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      isGrowth 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {isGrowth ? <MdTrendingUp className="h-3 w-3" /> : <MdTrendingDown className="h-3 w-3" />}
                      {Math.abs(delta).toLocaleString()} ({pct}%)
                    </div>
                  )}
                  {i === 0 && (
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Período base
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Gráfico visual mejorado */}
        <div className="relative bg-gradient-to-b from-blue-50 to-white rounded-xl p-8 border border-blue-100">
          <div className="h-80 flex items-end justify-center">
            <div className="flex items-end space-x-6 h-full w-full max-w-4xl">
              {data.map((d, index) => {
                const height = ((d.poblacion - min) / (max - min)) * 70 + 20;
                const prev = index > 0 ? data[index - 1].poblacion : d.poblacion;
                const isGrowth = d.poblacion > prev;
                
                return (
                  <div key={d.mes} className="flex-1 flex flex-col items-center group max-w-24">
                    {/* Tooltip mejorado */}
                    <div className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 mb-3 whitespace-nowrap shadow-lg">
                      <div className="font-medium">{d.mes} 2025</div>
                      <div className="text-blue-200">{d.poblacion.toLocaleString()} usuarios</div>
                      {index > 0 && (
                        <div className={isGrowth ? 'text-green-300' : 'text-red-300'}>
                          {isGrowth ? '+' : ''}{(d.poblacion - prev).toLocaleString()}
                        </div>
                      )}
                    </div>
                    
                    {/* Barra mejorada */}
                    <div className="relative w-full">
                      <div 
                        className={`w-full rounded-t-lg shadow-lg transition-all duration-500 group-hover:scale-105 ${
                          isGrowth 
                            ? 'bg-gradient-to-t from-green-600 to-green-400' 
                            : 'bg-gradient-to-t from-blue-600 to-blue-400'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                      
                      {/* Valor en la barra */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-gray-700">
                        {(d.poblacion / 1000).toFixed(0)}k
                      </div>
                    </div>
                    
                    {/* Etiqueta del mes */}
                    <div className="text-sm font-medium text-gray-700 mt-4">{d.mes}</div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center space-x-6 bg-white rounded-xl px-6 py-3 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Población Base</span>
              </div>
              <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
               <span className="text-sm text-gray-600">Crecimiento</span>
             </div>
             <div className="text-sm font-medium text-gray-700">
               Promedio: {Math.round(data.reduce((sum, item) => sum + item.poblacion, 0) / data.length).toLocaleString()}
             </div>
             <div className="text-sm text-gray-500">
               Tendencia: {data.length > 1 && data[data.length - 1].poblacion > data[0].poblacion ? '📈 Positiva' : '📉 Estable'}
             </div>
           </div>
         </div>
       </div>
     </div>
   </section>
 );
}

// Widget de próximos eventos
function ProximosEventosWidget() {
 const eventos = [
   {
     fecha: '2025-07-20',
     titulo: 'Corte FONASA Junio',
     tipo: 'procesamiento',
     urgencia: 'alta',
     descripcion: 'Procesamiento del corte de población'
   },
   {
     fecha: '2025-07-25',
     titulo: 'Backup Sistema',
     tipo: 'mantenimiento',
     urgencia: 'media',
     descripcion: 'Respaldo programado del sistema'
   },
   {
     fecha: '2025-07-30',
     titulo: 'Reporte Mensual',
     tipo: 'reporte',
     urgencia: 'baja',
     descripcion: 'Generación de informe ejecutivo'
   }
 ];

 const getUrgenciaColor = (urgencia) => {
   switch (urgencia) {
     case 'alta': return 'bg-red-100 text-red-700 border-red-200';
     case 'media': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
     case 'baja': return 'bg-green-100 text-green-700 border-green-200';
     default: return 'bg-gray-100 text-gray-700 border-gray-200';
   }
 };

 const getTipoIcon = (tipo) => {
   switch (tipo) {
     case 'procesamiento': return '⚙️';
     case 'mantenimiento': return '🔧';
     case 'reporte': return '📊';
     default: return '📅';
   }
 };

 return (
   <Card title="📅 Próximos Eventos" badge={`${eventos.length} programados`} badgeColor="bg-blue-100 text-blue-700">
     <div className="space-y-3">
       {eventos.map((evento, index) => {
         const fecha = new Date(evento.fecha);
         const diasRestantes = Math.ceil((fecha - new Date()) / (1000 * 60 * 60 * 24));
         
         return (
           <div key={index} className={`border rounded-lg p-3 ${getUrgenciaColor(evento.urgencia)}`}>
             <div className="flex items-start justify-between">
               <div className="flex items-start space-x-3">
                 <span className="text-lg">{getTipoIcon(evento.tipo)}</span>
                 <div className="flex-1">
                   <div className="font-medium text-gray-900">{evento.titulo}</div>
                   <div className="text-sm text-gray-600">{evento.descripcion}</div>
                   <div className="text-xs text-gray-500 mt-1">
                     {fecha.toLocaleDateString('es-ES')}
                   </div>
                 </div>
               </div>
               <div className="text-right">
                 <div className="text-xs font-medium">
                   {diasRestantes > 0 ? `${diasRestantes} días` : 'Hoy'}
                 </div>
               </div>
             </div>
           </div>
         );
       })}
     </div>
     <div className="border-t border-gray-200 pt-3 mt-4">
       <a href="/calendario" className="text-sm font-medium text-blue-600 hover:underline">
         Ver calendario completo →
       </a>
     </div>
   </Card>
 );
}

// Componentes existentes mejorados
function TimelineWidget({ actividades }) {
 if (!actividades?.length) {
   return (
     <Card title="⏱️ Actividad Reciente">
       <div className="text-center py-8">
         <div className="text-4xl opacity-50 mb-2">⏱️</div>
         <p className="text-gray-500">No hay actividad reciente</p>
       </div>
     </Card>
   );
 }

 return (
   <Card title="⏱️ Actividad Reciente">
     <div className="relative">
       {/* Línea de tiempo */}
       <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500 via-blue-300 to-gray-200" />
       
       <div className="space-y-4">
         {actividades.map((a, i) => (
           <div key={i} className="relative flex items-start space-x-4 pb-4">
             <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-md ${
               i === 0 ? 'bg-blue-500' : 'bg-gray-400'
             }`}>
               {i === 0 && <div className="w-2 h-2 bg-white rounded-full" />}
             </div>
             
             <div className="flex-1 min-w-0">
               <div className="flex items-center justify-between mb-1">
                 <p className="text-sm font-medium text-gray-900">{a.mensaje}</p>
                 <span className="text-xs text-gray-500">{a.tiempo}</span>
               </div>
               <p className="text-xs text-gray-600">{a.detalle}</p>
               {a.tipo && (
                 <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                   a.tipo === 'upload' ? 'bg-green-100 text-green-700' :
                   a.tipo === 'user' ? 'bg-blue-100 text-blue-700' :
                   'bg-gray-100 text-gray-700'
                 }`}>
                   {a.tipo}
                 </span>
               )}
             </div>
           </div>
         ))}
       </div>
     </div>
     
     <div className="border-t border-gray-200 pt-3 mt-4">
       <a href="/actividad" className="text-sm font-medium text-blue-600 hover:underline flex items-center space-x-1">
         <span>Ver toda la actividad</span>
         <span>→</span>
       </a>
     </div>
   </Card>
 );
}

function CasosRevisionWidget({ casos }) {
 if (!casos?.length) {
   return (
     <Card title="🔍 Casos a Revisar" badge="0 pendientes" badgeColor="bg-green-100 text-green-700">
       <div className="text-center py-8">
         <div className="text-4xl opacity-50 mb-2">✅</div>
         <p className="text-gray-500">No hay casos pendientes</p>
         <p className="text-xs text-gray-400 mt-1">¡Excelente trabajo!</p>
       </div>
     </Card>
   );
 }

 const prioridadConfig = {
   alta: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: '🔴' },
   media: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: '🟡' },
   baja: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: '🟢' },
 };

 const casosOrdenados = casos.sort((a, b) => {
   const prioridades = { alta: 3, media: 2, baja: 1 };
   return prioridades[b.prioridad] - prioridades[a.prioridad];
 });

 return (
   <Card
     title="🔍 Casos a Revisar"
     badge={`${casos.length} pendientes`}
     badgeColor="bg-red-100 text-red-700"
   >
     <div className="space-y-3 max-h-80 overflow-y-auto">
       {casosOrdenados.map((c) => {
         const config = prioridadConfig[c.prioridad] || prioridadConfig.baja;
         
         return (
           <div key={c.id} className={`rounded-lg border p-3 hover:shadow-sm transition-all ${config.bg} ${config.border}`}>
             <div className="flex items-start justify-between mb-2">
               <div className="flex items-center space-x-2">
                 <span>{config.icon}</span>
                 <span className="font-medium text-gray-900">{c.nombre}</span>
               </div>
               <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                 {c.prioridad}
               </span>
             </div>
             
             <div className="space-y-1 text-sm">
               <div className="flex justify-between">
                 <span className="text-gray-600">RUN:</span>
                 <span className="font-mono text-gray-900">{c.run}</span>
               </div>
               <div className="text-red-600 text-xs bg-white/50 p-2 rounded border">
                 {c.problema}
               </div>
               <div className="text-xs text-gray-500 text-right">
                 {c.tiempo}
               </div>
             </div>
           </div>
         );
       })}
     </div>
     
     <div className="border-t border-gray-200 pt-3 mt-4">
       <a href="/review-cases" className="text-sm font-medium text-blue-600 hover:underline flex items-center justify-between">
         <span>Revisar todos los casos</span>
         <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
           {casos.filter(c => c.prioridad === 'alta').length} urgentes
         </span>
       </a>
     </div>
   </Card>
 );
}

function EstadisticasWidget({ estadisticas }) {
 if (!estadisticas || Object.keys(estadisticas).length === 0) {
   return (
     <Card title="📊 Estadísticas del Mes">
       <div className="text-center py-8">
         <div className="text-4xl opacity-50 mb-2">📊</div>
         <p className="text-gray-500">No hay estadísticas disponibles</p>
       </div>
     </Card>
   );
 }

 const rows = [
   { 
     label: 'Nuevos Inscritos', 
     value: estadisticas.nuevos_inscritos, 
     color: 'text-emerald-600',
     bg: 'bg-emerald-50',
     icon: '👥',
     trend: '+12%'
   },
   { 
     label: 'Rechazos Previsionales', 
     value: estadisticas.rechazos_previsionales, 
     color: 'text-red-600',
     bg: 'bg-red-50',
     icon: '❌',
     trend: '-8%'
   },
   { 
     label: 'Traslados Negativos', 
     value: estadisticas.traslados_negativos, 
     color: 'text-amber-600',
     bg: 'bg-amber-50',
     icon: '↩️',
     trend: '-3%'
   },
   { 
     label: 'Tasa de Validación', 
     value: `${estadisticas.tasa_validacion}%`, 
     color: 'text-blue-600',
     bg: 'bg-blue-50',
     icon: '✅',
     trend: '+2%'
   },
 ];

 return (
   <Card title="📊 Estadísticas del Mes">
     <div className="space-y-3">
       {rows.map((r) => (
         <div key={r.label} className={`rounded-lg p-3 ${r.bg} border border-opacity-20`}>
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-3">
               <span className="text-lg">{r.icon}</span>
               <div>
                 <div className="text-sm font-medium text-gray-700">{r.label}</div>
                 <div className="text-xs text-gray-500">vs. mes anterior: {r.trend}</div>
               </div>
             </div>
             <div className={`text-xl font-bold ${r.color}`}>
               {r.value ?? '0'}
             </div>
           </div>
         </div>
       ))}
     </div>
     
     <div className="border-t border-gray-200 pt-3 mt-4">
       <div className="flex justify-between items-center">
         <a href="/estadisticas" className="text-sm font-medium text-blue-600 hover:underline">
           Ver estadísticas completas →
         </a>
         <button className="text-xs text-gray-500 hover:text-gray-700">
           <MdGetApp className="h-4 w-4" />
         </button>
       </div>
     </div>
   </Card>
 );
}

function AlertasWidget({ alertas }) {
 if (!alertas?.length) {
   return (
     <Card title="🔔 Alertas del Sistema">
       <div className="text-center py-8">
         <div className="text-4xl opacity-50 mb-2">✅</div>
         <p className="text-gray-500">No hay alertas activas</p>
         <p className="text-xs text-gray-400 mt-1">Sistema funcionando correctamente</p>
       </div>
     </Card>
   );
 }

 const getAlertConfig = (tipo) => {
   switch (tipo) {
     case 'warning':
       return {
         icon: '⚠️',
         bg: 'bg-amber-50',
         border: 'border-amber-200',
         text: 'text-amber-700',
         title: 'text-amber-900'
       };
     case 'error':
       return {
         icon: '🚨',
         bg: 'bg-red-50',
         border: 'border-red-200',
         text: 'text-red-700',
         title: 'text-red-900'
       };
     case 'info':
       return {
         icon: 'ℹ️',
         bg: 'bg-blue-50',
         border: 'border-blue-200',
         text: 'text-blue-700',
         title: 'text-blue-900'
       };
     default:
       return {
         icon: '✅',
         bg: 'bg-green-50',
         border: 'border-green-200',
         text: 'text-green-700',
         title: 'text-green-900'
       };
   }
 };

 const alertasOrdenadas = alertas.sort((a, b) => {
   const prioridades = { error: 4, warning: 3, info: 2, success: 1 };
   return prioridades[b.tipo] - prioridades[a.tipo];
 });

 return (
   <Card title="🔔 Alertas del Sistema">
     <div className="space-y-3 max-h-80 overflow-y-auto">
       {alertasOrdenadas.map((a, i) => {
         const config = getAlertConfig(a.tipo);
         
         return (
           <div
             key={i}
             className={`flex items-start space-x-3 rounded-lg border p-3 transition-all hover:shadow-sm ${config.bg} ${config.border}`}
           >
             <span className="text-lg flex-shrink-0">{config.icon}</span>
             <div className="flex-1 min-w-0">
               <div className={`font-medium ${config.title}`}>{a.mensaje}</div>
               <div className="flex items-center justify-between mt-1">
                 <div className={`text-xs ${config.text}`}>{a.tiempo}</div>
                 {a.tipo === 'warning' || a.tipo === 'error' ? (
                   <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                     Resolver
                   </button>
                 ) : null}
               </div>
             </div>
           </div>
         );
       })}
     </div>
     
     <div className="border-t border-gray-200 pt-3 mt-4">
       <div className="flex justify-between items-center">
         <a href="/alertas" className="text-sm font-medium text-blue-600 hover:underline">
           Ver todas las alertas →
         </a>
         <span className="text-xs text-gray-500">
           {alertas.filter(a => a.tipo === 'warning' || a.tipo === 'error').length} requieren atención
         </span>
       </div>
     </div>
   </Card>
 );
}

function AccionesRapidasWidget() {
 const items = [
   { 
     href: '/new-users', 
     label: 'Registrar Usuario Nuevo', 
     bg: 'bg-emerald-50 hover:bg-emerald-100', 
     color: 'text-emerald-700', 
     icon: '👥',
     descripcion: 'Agregar nuevo inscrito'
   },
   { 
     href: '/upload', 
     label: 'Subir Archivo FONASA', 
     bg: 'bg-blue-50 hover:bg-blue-100', 
     color: 'text-blue-700', 
     icon: '📤',
     descripcion: 'Procesar corte mensual'
   },
   { 
     href: '/reports', 
     label: 'Generar Reporte', 
     bg: 'bg-violet-50 hover:bg-violet-100', 
     color: 'text-violet-700', 
     icon: '📄',
     descripcion: 'Crear informe ejecutivo'
   },
   { 
     href: '/review-cases', 
     label: 'Revisar Casos Pendientes', 
     bg: 'bg-amber-50 hover:bg-amber-100', 
     color: 'text-amber-700', 
     icon: '🔍',
     descripcion: 'Validar registros'
   },
 ];

 return (
   <Card title="⚡ Acciones Rápidas">
     <div className="grid grid-cols-1 gap-3">
     {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`group flex items-center space-x-3 rounded-lg border border-transparent p-4 text-sm font-medium transition-all ${item.bg} ${item.color}`}
          >
            <span className="text-xl">{item.icon}</span>
            <div className="flex-1">
              <div className="font-medium">{item.label}</div>
              <div className="text-xs opacity-75">{item.descripcion}</div>
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </a>
        ))}
     </div>
     
     <div className="border-t border-gray-200 pt-3 mt-4">
       <button className="w-full text-sm text-gray-600 hover:text-gray-700 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
         Ver más opciones
       </button>
     </div>
   </Card>
 );
}

// Card genérica mejorada
function Card({ title, children, badge, badgeColor = 'bg-gray-100 text-gray-600' }) {
 return (
   <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
     <div className="p-6">
       <div className="flex items-center justify-between mb-4">
         <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
         {badge && (
           <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}>
             {badge}
           </span>
         )}
       </div>
       {children}
     </div>
   </div>
 );
}