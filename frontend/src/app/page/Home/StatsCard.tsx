// src/app/components/dashboard/StatsCard.tsx
"use client";

import { 
  MdPeople, 
  MdPersonAdd, 
  MdBlock, 
  MdAssignment,
  MdCheckCircle
} from 'react-icons/md';

interface Stats {
  total: number;
  aceptados: number;
  rechazados: number;
  nuevosInscritos: number;
  rechazosPrevisionales: number;
  trasladosNegativos: number;
  pendientesRevision: number;
}

interface StatsCardsProps {
  stats: Stats;
  loading: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Usuarios',
      value: stats.total,
      icon: MdPeople,
      color: 'from-blue-500 to-blue-600',
      change: '+5.2%',
      trend: 'up'
    },
    {
      title: 'Aceptados',
      value: stats.aceptados,
      icon: MdCheckCircle,
      color: 'from-green-500 to-green-600',
      change: `${stats.total > 0 ? Math.round((stats.aceptados / stats.total) * 100) : 0}%`,
      trend: 'up'
    },
    {
      title: 'Nuevos Inscritos',
      value: stats.nuevosInscritos,
      icon: MdPersonAdd,
      color: 'from-purple-500 to-purple-600',
      change: '+12.5%',
      trend: 'up'
    },
    {
      title: 'Rechazos Previsionales',
      value: stats.rechazosPrevisionales,
      icon: MdBlock,
      color: 'from-red-500 to-red-600',
      change: '-8.1%',
      trend: 'down'
    },
    {
      title: 'Pendientes Revisión',
      value: stats.pendientesRevision,
      icon: MdAssignment,
      color: 'from-orange-500 to-orange-600',
      change: '+3.7%',
      trend: 'up'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="animate-pulse space-y-4">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className={`bg-gradient-to-br ${card.color} rounded-xl p-6 shadow-sm text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02]`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
              <card.icon className="w-6 h-6" />
            </div>
            <div className="flex items-center space-x-1 bg-white bg-opacity-20 px-2 py-1 rounded-full">
              <span className={`text-xs font-medium ${
                card.trend === 'up' ? 'text-green-100' : 'text-red-100'
              }`}>
                {card.change}
              </span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium opacity-90 mb-1">
              {card.title}
            </h3>
            <p className="text-2xl font-bold">
              {card.value.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}