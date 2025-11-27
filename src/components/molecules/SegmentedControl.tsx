/**
 * Componente SegmentedControl - toggle entre múltiples opciones.
 */

export interface SegmentedControlOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps) {
  return (
    <div className={`inline-flex rounded-lg border border-gray-300 bg-white p-1 ${className}`}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isSelected
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
