// src/components/dashboard/StatsCard.tsx
interface StatsCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color: 'green' | 'red' | 'blue' | 'yellow';
    loading?: boolean;
  }
  
  export function StatsCard({ 
    title, 
    value, 
    icon, 
    trend, 
    trendValue, 
    color,
    loading = false 
  }: StatsCardProps) {
    const colorVariants = {
      green: 'from-green-200 to-green-50 text-green-900 text-green-700',
      red: 'from-red-200 to-red-50 text-red-900 text-red-700',
      blue: 'from-blue-200 to-blue-50 text-blue-900 text-blue-700',
      yellow: 'from-yellow-200 to-yellow-50 text-yellow-900 text-yellow-700'
    };
  
    const [bgGradient, titleColor, valueColor] = colorVariants[color].split(' ');
  
    if (loading) {
      return (
        <div className={`bg-gradient-to-br ${bgGradient} p-8 rounded-2xl shadow-lg animate-pulse`}>
          <div className="h-6 bg-white/30 rounded mb-4"></div>
          <div className="h-12 bg-white/30 rounded"></div>
        </div>
      );
    }
  
    return (
      <div className={`bg-gradient-to-br ${bgGradient} p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl font-bold ${titleColor}`}>{title}</h2>
          <div className="text-3xl opacity-80">{icon}</div>
        </div>
        <div className="flex flex-col">
          <p className={`text-5xl font-extrabold ${valueColor} mb-2`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && trendValue && (
            <div className={`flex items-center text-sm ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              <span className="mr-1">
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
              </span>
              {trendValue}
            </div>
          )}
        </div>
      </div>
    );
  }