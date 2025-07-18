// src/components/dashboard/Card.jsx
import React from 'react';

export default function Card({ title, badge, badgeColor = 'bg-slate-100 text-slate-600', children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        {badge && (
          <span className={`rounded px-2 py-0.5 text-xs font-semibold ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
