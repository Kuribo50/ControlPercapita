// src/components/dashboard/StatsCard.jsx
import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiBell, FiArrowRight } from 'react-icons/fi';

const trendMap = {
  up:        { icon: <FiTrendingUp />, color: 'text-emerald-600' },
  down:      { icon: <FiTrendingDown />, color: 'text-red-600' },
  attention: { icon: <FiBell />,       color: 'text-amber-600' },
  neutral:   { icon: <FiArrowRight />, color: 'text-slate-500' },
};

export default function StatsCard({ title, value, icon, color, trend, change }) {
  const { icon: TrendIcon, color: trendColor } = trendMap[trend] || trendMap.neutral;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-200">
      {/* decor circular */}
      <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-10 ${color}`} />
      <div className="relative flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value?.toLocaleString?.() ?? value}</p>
          <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            {TrendIcon}
            <span>{change}</span>
          </div>
        </div>
        <div className="text-3xl opacity-70">{icon}</div>
      </div>
    </div>
  );
}
