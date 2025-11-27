/**
 * Componente Select - selector dropdown.
 */

import React from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  label?: string;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  label,
  className = '',
}: SelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    // Intentar convertir a número si es posible
    const parsedValue = isNaN(Number(newValue)) ? newValue : Number(newValue);
    onChange(parsedValue);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={handleChange}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
