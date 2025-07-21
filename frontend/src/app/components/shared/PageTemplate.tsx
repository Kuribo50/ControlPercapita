// src/app/components/shared/PageTemplate.tsx
"use client";

import React from 'react';

interface PageTemplateProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageTemplate({ 
  title, 
  icon: Icon, 
  color = "blue", 
  children, 
  actions 
}: PageTemplateProps) {
  const colorClasses = {
    blue: "text-blue-600",
    emerald: "text-emerald-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
    slate: "text-slate-600"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Icon className={`w-6 h-6 mr-3 ${colorClasses[color as keyof typeof colorClasses]}`} />
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
            {actions && (
              <div className="flex items-center space-x-4">
                {actions}
              </div>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}