import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) => {
  const colorMap = {
    blue: 'text-light-blue bg-light-blue-soft',
    purple: 'text-light-purple bg-light-purple-soft',
    green: 'text-emerald-500 bg-emerald-100',
    red: 'text-red-500 bg-red-100',
    orange: 'text-orange-500 bg-orange-100'
  };

  const iconClasses = colorMap[color] || colorMap.blue;

  return (
    <div className="glass-card group relative overflow-hidden">
      {/* Decorative gradient blob on hover */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl ${colorMap[color].split(' ')[1]}`}></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-light-text-secondary mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-light-text-primary tracking-tight">{value}</h3>
          
          {trend && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-semibold ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
              <span className="text-xs text-light-text-secondary">vs mes pasado</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-2xl ${iconClasses} shadow-inner`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
