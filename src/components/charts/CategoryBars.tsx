/**
 * Componente CategoryBars - gráfico de barras agrupadas por categoría.
 */

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { CategoryBarData } from '@domain/types';
import { formatCurrency, formatPercent } from '@utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@components/atoms/Card';
import { SegmentedControl } from '@components/molecules/SegmentedControl';

export interface CategoryBarsProps {
  data: CategoryBarData[];
  onCategoryClick?: (category: string) => void;
}

type ViewMode = 'venta' | 'conversion';

const COLORS = {
  chile: '#3b82f6', // blue-500
  peru: '#10b981', // green-500
};

export function CategoryBars({ data, onCategoryClick }: CategoryBarsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('venta');

  // Preparar datos según el modo de vista
  const chartData = data.map(item => ({
    categoria: item.categoria,
    Chile: viewMode === 'venta' ? item.venta_chile : item.conversion_chile,
    Peru: viewMode === 'venta' ? item.venta_peru : item.conversion_peru,
  }));

  const handleBarClick = (data: any) => {
    if (onCategoryClick && data && data.categoria) {
      onCategoryClick(data.categoria);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Ventas por Categoría</CardTitle>
          <SegmentedControl
            options={[
              { value: 'venta', label: 'Venta' },
              { value: 'conversion', label: '% Conversión' },
            ]}
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={450}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            onClick={handleBarClick}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="categoria"
              angle={0}
              textAnchor="middle"
              height={120}
              interval={0}
              style={{ fontSize: '11px' }}
              tick={(props) => {
                const { x, y, payload } = props;
                const words = payload.value.split(' ');
                const lines: string[] = [];
                let currentLine = '';

                // Agrupar palabras en líneas de máximo 15 caracteres
                words.forEach((word: string) => {
                  if (currentLine.length + word.length + 1 <= 15) {
                    currentLine += (currentLine ? ' ' : '') + word;
                  } else {
                    if (currentLine) lines.push(currentLine);
                    currentLine = word;
                  }
                });
                if (currentLine) lines.push(currentLine);

                return (
                  <g transform={`translate(${x},${y})`}>
                    {lines.map((line, index) => (
                      <text
                        key={index}
                        x={0}
                        y={0}
                        dy={index * 12 + 16}
                        textAnchor="middle"
                        fill="#666"
                        fontSize="11px"
                      >
                        {line}
                      </text>
                    ))}
                  </g>
                );
              }}
            />
            <YAxis
              tickFormatter={viewMode === 'venta' ? formatCurrency : (val) => formatPercent(val)}
              tick={{ fontSize: 13 }}
            />
            <Tooltip
              formatter={(value: number) =>
                viewMode === 'venta' ? formatCurrency(value) : formatPercent(value)
              }
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '0.5rem',
              }}
            />
            <Legend />
            <Bar
              dataKey="Chile"
              fill={COLORS.chile}
              cursor={onCategoryClick ? 'pointer' : 'default'}
            />
            <Bar
              dataKey="Peru"
              fill={COLORS.peru}
              cursor={onCategoryClick ? 'pointer' : 'default'}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

