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
  centerValue?: boolean;
}

export function KPIStat({
  label,
  value,
  subtitle,
  icon,
  trend,
  className = '',
  valueClassName = '',
  centerValue = false,
}: KPIStatProps) {
  const contentClasses = centerValue
    ? 'flex-1 flex flex-col h-full'
    : 'flex-1';
  const valueWrapperClasses = centerValue
    ? 'flex-1 flex items-center justify-center w-full'
    : '';
  const valueTextClasses = centerValue ? 'w-full text-center' : '';

  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div className={contentClasses}>
          <p className="text-l font-medium text-gray-600 mb-1">
            {label}
          </p>
          <div className={valueWrapperClasses}>
            <p
              className={`text-4xl font-bold text-gray-900 ${valueClassName} ${valueTextClasses}`}
            >
              {value}
            </p>
          </div>
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
