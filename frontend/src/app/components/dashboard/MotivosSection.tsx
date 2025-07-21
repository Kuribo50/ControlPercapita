// src/components/dashboard/MotivosSection.tsx
import { Bar, Pie } from 'react-chartjs-2';

interface Motivo {
  motivo: string;
  count: number;
}

interface MotivosSectionProps {
  motivos: Motivo[];
  loading?: boolean;
}

const chartColors = [
  '#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#a78bfa',
  '#fb923c', '#2dd4bf', '#f87171', '#818cf8', '#d1d5db',
];

const motivoColors = [
  'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-pink-200', 'bg-purple-200',
  'bg-orange-200', 'bg-teal-200', 'bg-red-200', 'bg-indigo-200', 'bg-gray-200',
];

export function MotivosSection({ motivos, loading = false }: MotivosSectionProps) {
  if (loading) {
    return (
      <section className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-80"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-24 animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  const chartData = {
    labels: motivos.map(m => m.motivo || 'Sin motivo'),
    datasets: [{
      label: 'Cantidad',
      data: motivos.map(m => m.count),
      backgroundColor: chartColors,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
  };

  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-800 flex items-center">
        <span className="mr-3">📊</span>
        Motivos de Rechazo / Aceptación
      </h2>
      
      {/* Cards de motivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {motivos.map(({ motivo, count }, i) => (
          <div
            key={motivo || 'Sin motivo'}
            className={`rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 flex flex-col items-center ${
              motivoColors[i % motivoColors.length]
            }`}
          >
            <span className="text-lg font-semibold text-gray-700 mb-2 text-center">
              {motivo || 'Sin motivo'}
            </span>
            <span className="text-3xl font-extrabold text-gray-800">{count}</span>
            <div className="w-full bg-white/30 rounded-full h-2 mt-3">
              <div 
                className="bg-white/60 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (count / Math.max(...motivos.map(m => m.count))) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-blue-700 flex items-center">
            <span className="mr-2">📊</span>
            Distribución por motivo (Barras)
          </h3>
          <div className="h-80">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-blue-700 flex items-center">
            <span className="mr-2">🥧</span>
            Distribución por motivo (Pastel)
          </h3>
          <div className="h-80">
            <Pie 
              data={chartData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: { position: 'bottom' as const, display: true },
                }
              }} 
            />
          </div>
        </div>
      </div>
    </section>
  );
}