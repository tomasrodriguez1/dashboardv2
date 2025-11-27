/**
 * Componente ProgressBar - barra de progreso vertical u horizontal.
 */

export interface ProgressBarProps {
  label: string;
  value: number; // 0-1
  color?: string;
  orientation?: 'horizontal' | 'vertical';
  height?: string;
  showPercentage?: boolean;
}

export function ProgressBar({
  label,
  value,
  color = '#3b82f6',
  orientation = 'vertical',
  height = '120px',
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = Math.round(value * 100);
  
  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col items-center gap-2 h-full">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div
          className="relative bg-gray-200 rounded-full overflow-hidden flex-1 w-[40px]"
          style={{ maxHeight: height }}
        >
          <div
            className="absolute bottom-0 w-full transition-all duration-500 ease-out"
            style={{
              height: `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>
        {showPercentage && (
          <span className="text-lg font-bold" style={{ color }}>
            {percentage}%
          </span>
        )}
      </div>
    );
  }

  // Horizontal
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {showPercentage && (
          <span className="text-sm font-bold" style={{ color }}>
            {percentage}%
          </span>
        )}
      </div>
      <div className="relative bg-gray-200 rounded-full overflow-hidden h-4">
        <div
          className="absolute left-0 h-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

