import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  trend = 'neutral', 
  icon,
  className = '' 
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 truncate">
            {title}
          </p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {value}
          </p>
          {change && (
            <div className="flex items-center mt-2">
              {getTrendIcon()}
              <span className={`ml-1 text-sm ${getTrendColor()}`}>
                {change}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;