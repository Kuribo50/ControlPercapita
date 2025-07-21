// src/components/dashboard/MetricCard.tsx
'use client';
import React from 'react';
import { MdTrendingUp, MdTrendingDown, MdInfo } from 'react-icons/md';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  loading?: boolean;
}

export function MetricCard({ title, value, change, trend, subtitle, loading }: MetricCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded-full w-4"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <MdInfo className="w-4 h-4 text-gray-400" />
      </div>
      
      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        
        {change && (
          <div className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}>
            {trend === 'up' && <MdTrendingUp className="w-4 h-4" />}
            {trend === 'down' && <MdTrendingDown className="w-4 h-4" />}
            <span>{change}</span>
          </div>
        )}
        
        {subtitle && (
          <div className="text-sm text-gray-500">{subtitle}</div>
        )}
      </div>
    </div>
  );
}