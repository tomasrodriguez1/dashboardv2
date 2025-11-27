/**
 * Componente Badge - etiqueta con colores.
 */

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  color?: 'red' | 'yellow' | 'green' | 'blue' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({
  children,
  color = 'gray',
  size = 'md',
  className = '',
}: BadgeProps) {
  const colorClasses = {
    red: 'bg-red-100 text-red-800 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const classes = `inline-flex items-center justify-center font-medium rounded-full border ${colorClasses[color]} ${sizeClasses[size]} ${className}`;

  return (
    <span className={classes}>
      {children}
    </span>
  );
}
