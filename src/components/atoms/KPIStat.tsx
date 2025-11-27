/**
 * Componente KPIStat - tarjeta de KPI con valor principal y opcional subtítulo.
 */

import React from 'react';
import { Card } from './Card';

export interface KPIStatProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  valueClassName?: string;
}

export function KPIStat({
  label,
  value,
  subtitle,
  icon,
  trend,
  className = '',
  valueClassName = '',
}: KPIStatProps) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {label}
          </p>
          <p className={`text-3xl font-bold text-gray-900 ${valueClassName}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-3xl font-bold text-gray-900">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-3 text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
