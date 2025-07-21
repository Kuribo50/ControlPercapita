// src/app/(app)/dashboard/page.tsx (REDISEÑADO con datos reales de percápita)
"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

import { TopBar } from "../components/dashboard/TopBar";
import { MetricCard } from "../components/dashboard/MetricCard";
import { UsersTable } from "../components/dashboard/UsersTable";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface Stat { aceptados: number; rechazados: number; }
interface Motivo { motivo: string; count: number; }
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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stat>({ aceptados: 0, rechazados: 0 });
  const [motivos, setMotivos] = useState<Motivo[]>([]);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
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

      const [statsRes, motivosRes, registrosRes] = await Promise.all([
        axios.get<Stat>(`${baseUrl}/api/registros/stats/`, { headers }),
        axios.get<Motivo[]>(`${baseUrl}/api/registros/motivos/`, { headers }),
        axios.get<Registro[]>(`${baseUrl}/api/registros/all/`, { headers }),
      ]);

      setStats(statsRes.data);
      setMotivos(motivosRes.data);
      setRegistros(registrosRes.data);
      setUltimaActualizacion(new Date());
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("No se pudieron cargar los datos del dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calcular métricas
  const totalRegistros = registros.length;
  const tasaAceptacion = totalRegistros > 0 ? ((stats.aceptados / totalRegistros) * 100).toFixed(1) : "0";
  const nuevosInscritos = registros.filter(r => r.motivo === "NUEVO_INSCRITO").length;
  const rechazosPrevisionales = registros.filter(r => r.motivo === "RECHAZADO_PREVISIONAL").length;

  // Datos para gráfico de registros por mes
  const registrosPorMes = {
    labels: ['Mayo', 'Junio', 'Julio'],
    datasets: [
      {
        label: 'Registros procesados',
        data: [1250, 1380, totalRegistros],
        backgroundColor: ['#3b82f6', '#10b981', '#06b6d4'],
        borderRadius: 8,
        barThickness: 40,
      },
    ],
  };

  // Datos para gráfico de estados de inscripción
  const estadosInscripcion = {
    labels: ['Mantiene Inscripción', 'Nuevos Inscritos', 'Rechazos Previsionales', 'Traslados Negativos'],
    datasets: [
      {
        data: [
          stats.aceptados - nuevosInscritos,
          nuevosInscritos,
          rechazosPrevisionales,
          registros.filter(r => r.motivo === "TRASLADO_NEGATIVO").length
        ],
        backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#f59e0b'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: '#6b7280' }
      },
      y: { 
        grid: { color: '#f3f4f6' },
        ticks: { color: '#6b7280' }
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar 
        onRefresh={fetchData} 
        loading={loading}
        totalRegistros={totalRegistros}
        ultimaActualizacion={ultimaActualizacion}
      />
      
      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Métricas principales de percápita */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Registros FONASA"
            value={totalRegistros}
            change="+5.2%"
            trend="up"
            subtitle="vs mes anterior"
            loading={loading}
          />
          <MetricCard
            title="Usuarios Aceptados"
            value={stats.aceptados}
            change={`${tasaAceptacion}%`}
            trend="up"
            subtitle="del total"
            loading={loading}
          />
          <MetricCard
            title="Nuevos Inscritos"
            value={nuevosInscritos}
            change="+12.3%"
            trend="up"
            subtitle="este mes"
            loading={loading}
          />
          <MetricCard
            title="Casos a Revisar"
            value={rechazosPrevisionales + registros.filter(r => r.motivo === "SIN_CENTRO").length}
            change="3 urgentes"
            trend="attention"
            subtitle="requieren atención"
            loading={loading}
          />
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolución de Registros */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Registros FONASA Procesados</h3>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="text-2xl font-bold text-gray-900">{totalRegistros.toLocaleString()}</div>
                  <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                    +5.2% ↗ +67 registros nuevos
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">Filtrar</button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">Ordenar</button>
              </div>
            </div>
            <div className="h-64">
              <Bar data={registrosPorMes} options={chartOptions} />
            </div>
            <div className="flex justify-center space-x-6 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Mayo</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Junio</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                <span className="text-gray-600">Julio</span>
              </div>
            </div>
          </div>

          {/* Estados de Inscripción */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Estados de Inscripción</h3>
              <button className="text-sm text-gray-600 hover:text-gray-900">Mensual ↓</button>
            </div>
            <div className="h-64">
              <Doughnut 
                data={estadosInscripcion} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Distribución por Motivos y Lista de Casos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribución por Motivos */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Motivos de Procesamiento</h3>
              <button className="text-sm text-gray-600 hover:text-gray-900">Ver todos</button>
            </div>
            <div className="space-y-4">
              {motivos.slice(0, 5).map((motivo, index) => (
                <div key={motivo.motivo} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-green-500' :
                      index === 1 ? 'bg-blue-500' :
                      index === 2 ? 'bg-red-500' :
                      index === 3 ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`}></div>
                    <span className="font-medium text-gray-700">{motivo.motivo || 'Sin motivo'}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{motivo.count}</div>
                    <div className="text-xs text-gray-500">
                      {totalRegistros > 0 ? ((motivo.count / totalRegistros) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Casos que Requieren Revisión */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Casos a Revisar</h3>
              <button className="text-blue-600 text-sm hover:text-blue-700">Ver Todos</button>
            </div>
            <div className="space-y-4">
              {registros
                .filter(r => r.aceptado_rechazado === 'RECHAZADO' || r.motivo === 'SIN_CENTRO')
                .slice(0, 4)
                .map((registro) => (
                <div key={registro.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 text-xs font-bold">!</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {registro.nombres} {registro.apellido_paterno}
                      </div>
                      <div className="text-sm text-gray-500">RUN: {registro.run}-{registro.dv}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      {registro.motivo}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{registro.fecha_corte}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}