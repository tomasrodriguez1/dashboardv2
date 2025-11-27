/**
 * Componente CountryMixChart - gráfico de composición por país (Pie/Donut).
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { CountryMixData } from '@domain/types';
import { formatCurrency, formatPercent } from '@utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@components/atoms/Card';

export interface CountryMixChartProps {
  data: CountryMixData[];
  onCountryClick?: (country: string) => void;
}

const COLORS: Record<string, string> = {
  Chile: '#3b82f6', // blue-500
  Peru: '#10b981', // green-500
};

export function CountryMixChart({ data, onCountryClick }: CountryMixChartProps) {
  const handleClick = (entry: any) => {
    if (onCountryClick) {
      onCountryClick(entry.name);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Composición del Ingreso por País</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${formatPercent(entry.percentage)}`}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              onClick={handleClick}
              style={{ cursor: onCountryClick ? 'pointer' : 'default' }}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name] || '#94a3b8'}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '0.5rem',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

