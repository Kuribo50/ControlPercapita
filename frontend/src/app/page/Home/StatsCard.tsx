// src/app/components/dashboard/StatsCard.tsx
"use client";

import { MdPeople, MdPersonAdd, MdBlock, MdAssignment, MdCheckCircle } from 'react-icons/md';
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';

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
      title: 'Validados',
      value: stats.aceptados,
      icon: MdCheckCircle,
      border: 'border-green-500',
      bg: 'bg-green-100',
      text: 'text-green-500',
      change: `${stats.total > 0 ? Math.round((stats.aceptados / stats.total) * 100) : 0}%`,
      trend: 'up'
    },
    {
      title: 'Pendientes',
      value: stats.pendientesRevision,
      icon: MdAssignment,
      border: 'border-yellow-500',
      bg: 'bg-yellow-100',
      text: 'text-yellow-500',
      change: stats.pendientesRevision != null ? `${stats.pendientesRevision}%` : '0%',
      trend: 'up'
    },
    {
      title: 'Rechazos Previs.',
      value: stats.rechazosPrevisionales,
      icon: MdBlock,
      border: 'border-red-500',
      bg: 'bg-red-100',
      text: 'text-red-500',
      change: stats.rechazosPrevisionales != null ? `-${stats.rechazosPrevisionales}%` : '0%',
      trend: 'down'
    },
    {
      title: 'Nuevos Inscritos',
      value: stats.nuevosInscritos,
      icon: MdPersonAdd,
      border: 'border-blue-500',
      bg: 'bg-blue-100',
      text: 'text-blue-500',
      change: stats.nuevosInscritos != null ? `+${stats.nuevosInscritos}%` : '0%',
      trend: 'up'
    },
    {
      title: 'Total Registros',
      value: stats.total,
      icon: MdPeople,
      border: 'border-gray-500',
      bg: 'bg-gray-100',
      text: 'text-gray-500',
      change: '',
      trend: 'up'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-2xl h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const displayValue = (card.value ?? 0).toLocaleString();
        return (
          <div
            key={idx}
            className={`border-l-4 ${card.border} bg-white rounded-2xl p-5 shadow hover:shadow-lg transition`}
          >
            <div className="flex justify-between items-center mb-4">
              <div className={`${card.bg} p-2 rounded-md`}>
                <Icon className={`${card.text} w-6 h-6`} />
              </div>
              <div className="flex items-center space-x-1">
                {card.trend === 'up' ? (
                  <FiArrowUpRight className={card.text + ' w-4 h-4'} />
                ) : (
                  <FiArrowDownRight className={card.text + ' w-4 h-4'} />
                )}
                <span className={`text-sm font-medium ${card.text}`}>
                  {card.change}
                </span>
              </div>
            </div>
            <h4 className="text-xs uppercase text-gray-400 mb-1">{card.title}</h4>
            <p className="text-2xl font-semibold text-gray-800">
              {displayValue}
            </p>
          </div>
        );
      })}
    </div>
  );
}
