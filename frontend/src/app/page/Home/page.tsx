// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  MdTrendingUp, 
  MdTrendingDown,
  MdPeople,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdRefresh,
  MdMoreVert,
  MdNotifications,
  MdLightbulb,
  MdSchedule,
  MdAssignment
} from 'react-icons/md';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

interface Stats {
  total: number;
  aceptados: number;
  rechazados: number;
  nuevosInscritos: number;
  pendientesRevision: number;
}

// Datos mock para el gráfico
const chartData = [
  { week: 'Sem 1', usuarios: 850, meta: 900 },
  { week: 'Sem 2', usuarios: 920, meta: 900 },
  { week: 'Sem 3', usuarios: 780, meta: 900 },
  { week: 'Sem 4', usuarios: 1050, meta: 900 },
  { week: 'Sem 5', usuarios: 1150, meta: 900 },
  { week: 'Sem 6', usuarios: 980, meta: 900 },
  { week: 'Sem 7', usuarios: 1200, meta: 900 },
  { week: 'Sem 8', usuarios: 1180, meta: 900 },
];

const pieData = [
  { name: 'Aceptados', value: 3400, color: '#10B981' },
  { name: 'Rechazados', value: 1200, color: '#EF4444' },
  { name: 'Pendientes', value: 800, color: '#F59E0B' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    aceptados: 0,
    rechazados: 0,
    nuevosInscritos: 0,
    pendientesRevision: 0
  });
  const [loading, setLoading] = useState(true);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.assign("/login");
        return;
      }

      // Simular datos mientras conectas con tu API
      setTimeout(() => {
        setStats({
          total: 5400,
          aceptados: 3400,
          rechazados: 1200,
          nuevosInscritos: 185,
          pendientesRevision: 47
        });
        setLoading(false);
      }, 1000);

    } catch (err) {
      console.error("Error cargando datos:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Usuarios"
                value={stats.total}
                change={+8.2}
                color="blue"
                icon={<MdPeople className="w-6 h-6" />}
                loading={loading}
              />
              <StatCard
                title="Aceptados"
                value={stats.aceptados}
                change={+12.5}
                color="green"
                icon={<MdCheckCircle className="w-6 h-6" />}
                loading={loading}
              />
              <StatCard
                title="Rechazados"
                value={stats.rechazados}
                change={-3.2}
                color="red"
                icon={<MdCancel className="w-6 h-6" />}
                loading={loading}
              />
              <StatCard
                title="Pendientes"
                value={stats.pendientesRevision}
                change={+5.1}
                color="yellow"
                icon={<MdPending className="w-6 h-6" />}
                loading={loading}
              />
            </div>

            {/* Progress Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Progreso Semanal de Usuarios</h3>
                  <p className="text-gray-500 text-sm">Seguimiento vs meta semanal</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">1,180</div>
                    <div className="text-sm text-green-600 flex items-center">
                      <MdTrendingUp className="w-4 h-4 mr-1" />
                      +8.2% vs semana anterior
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <MdMoreVert className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="week" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="usuarios" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 0, r: 6 }}
                      activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="meta" 
                      stroke="#e5e7eb" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Macro Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Macro Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">Inscripciones</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">3400/3200 total</div>
                      <div className="text-xs text-green-600">+6.2% vs objetivo</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600">Validaciones</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">1201/1350g</div>
                      <div className="text-xs text-red-600">-11.1% vs objetivo</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">364g</div>
                        <div className="text-xs text-gray-500">Carbohidratos<br />+9.8% vs anterior</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">77/100g</div>
                        <div className="text-xs text-gray-500">Grasas<br />+8.4% vs anterior</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Checklist Hoy</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    6/8 completado • 86%
                  </span>
                </div>

                <div className="space-y-3">
                  <ChecklistItem 
                    completed={true}
                    text="Plan diario validado"
                    subtext="8am daily catch-up completo"
                  />
                  <ChecklistItem 
                    completed={true}
                    text="Entrenamiento cardiovascular completado"
                    subtext="Carrera de tempo - 20 minutos con Intervals (2×4 Min)"
                  />
                  <ChecklistItem 
                    completed={false}
                    text="8 horas de sueño"
                    subtext="Dormir antes de las 10:30 PM y despertar normalmente"
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-2">AI mejorado por Macro</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Probablemente deberías comer más carbohidratos. Considera agregar más alimentos con carga glucémica.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">AI Smart Suggestions</h3>
                <MdLightbulb className="w-5 h-5 text-yellow-500" />
              </div>

              <div className="space-y-4">
                <SuggestionItem
                  icon="🎯"
                  title="Auto Insights"
                  subtitle="Análisis de tendencias automático"
                  trend="up"
                />
                <SuggestionItem
                  icon="💡"
                  title="Smart Workflow Suggestion"
                  subtitle="Optimización de procesos detectada"
                  trend="up"
                />
                <SuggestionItem
                  icon="⚡"
                  title="Sleep Adjustment"
                  subtitle="Ajuste de horarios de sueño"
                  trend="neutral"
                />
                <SuggestionItem
                  icon="📊"
                  title="Math Reminder"
                  subtitle="Recordatorio matemático pendiente"
                  trend="neutral"
                />
                <SuggestionItem
                  icon="🎯"
                  title="Auto Gout/Per"
                  subtitle="Seguimiento automático de métricas"
                  trend="up"
                />
                <SuggestionItem
                  icon="💤"
                  title="Assessment Tip"
                  subtitle="Consejos para mejorar evaluaciones"
                  trend="neutral"
                />
              </div>

              <button className="w-full mt-4 text-blue-600 text-sm font-medium hover:text-blue-700">
                Ver más insights
              </button>
            </div>

            {/* Distribution Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Estados</h3>
              
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componentes auxiliares
function StatCard({ title, value, change, color, icon, loading }: any) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color as keyof typeof colorClasses]} text-white`}>
          {icon}
        </div>
        <div className={`text-sm font-medium flex items-center ${
          change > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {change > 0 ? <MdTrendingUp className="w-4 h-4 mr-1" /> : <MdTrendingDown className="w-4 h-4 mr-1" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function ChecklistItem({ completed, text, subtext }: any) {
  return (
    <div className="flex items-start space-x-3">
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 ${
        completed 
          ? 'bg-green-500 border-green-500' 
          : 'border-gray-300'
      }`}>
        {completed && (
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${completed ? 'text-gray-900' : 'text-gray-700'}`}>
          {text}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {subtext}
        </p>
      </div>
    </div>
  );
}

function SuggestionItem({ icon, title, subtitle, trend }: any) {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="text-2xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-500 truncate">{subtitle}</p>
      </div>
      <div className="text-right">
        {trend === 'up' && <MdTrendingUp className="w-4 h-4 text-green-500" />}
        {trend === 'down' && <MdTrendingDown className="w-4 h-4 text-red-500" />}
        {trend === 'neutral' && <div className="w-4 h-4 bg-gray-300 rounded-full"></div>}
        <button className="text-blue-600 text-xs mt-1 hover:text-blue-800">→</button>
      </div>
    </div>
  );
}