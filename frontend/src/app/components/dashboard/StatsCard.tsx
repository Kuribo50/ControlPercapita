// src/app/components/dashboard/StatsCard.tsx (corregir nombre también)
"use client";

import { 
  MdPeople, 
  MdPersonAdd, 
  MdBlock, 
  MdSwapHoriz, 
  MdAssignment,
  MdTrendingUp,
  MdCheckCircle,
  MdError
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
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      change: '+5.2%',
      trend: 'up'
    },
    {
      title: 'Aceptados',
      value: stats.aceptados,
      icon: MdCheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      change: `${stats.total > 0 ? Math.round((stats.aceptados / stats.total) * 100) : 0}%`,
      trend: 'up'
    },
    {
      title: 'Nuevos Inscritos',
      value: stats.nuevosInscritos,
      icon: MdPersonAdd,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      change: '+12.5%',
      trend: 'up'
    },
    {
      title: 'Rechazos Previsionales',
      value: stats.rechazosPrevisionales,
      icon: MdBlock,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      change: '-8.1%',
      trend: 'down'
    },
    {
      title: 'Pendientes Revisión',
      value: stats.pendientesRevision,
      icon: MdAssignment,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      change: '+3.7%',
      trend: 'up'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="animate-pulse space-y-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <div key={index} className={`${card.bgColor} rounded-xl p-6 shadow-sm border transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              <MdTrendingUp className={`w-4 h-4 ${card.trend === 'up' ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
              <span className={`text-xs font-medium ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {card.change}
              </span>
            </div>
          </div>
          
          <div>
            <h3 className={`text-sm font-medium ${card.textColor} mb-1`}>
              {card.title}
            </h3>
            <p className={`text-2xl font-bold ${card.textColor}`}>
              {card.value.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}