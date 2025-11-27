/**
 * Componente Legend - leyenda para gráficos.
 */

export interface LegendItem {
  label: string;
  color: string;
}

export interface LegendProps {
  items: LegendItem[];
  className?: string;
}

export function Legend({ items, className = '' }: LegendProps) {
  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm text-gray-700">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

