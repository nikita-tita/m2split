import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/validations';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  format?: 'currency' | 'percent' | 'number';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  format = 'number',
}) => {
  const formattedValue = React.useMemo(() => {
    if (format === 'currency' && typeof value === 'number') {
      return formatCurrency(value);
    }
    if (format === 'percent' && typeof value === 'number') {
      return `${value.toFixed(2)}%`;
    }
    return value;
  }, [value, format]);

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{formattedValue}</p>
          {trend && (
            <p className={`mt-2 text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '+' : '-'}{Math.abs(trend.value)}%
              <span className="text-gray-500 ml-1">vs прошлый период</span>
            </p>
          )}
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-primary-50 rounded-lg">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
      </div>
    </Card>
  );
};
