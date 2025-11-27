/**
 * Componente VendedoresBars - gráfico de barras por vendedor.
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
import type { VendedorKPIs } from '@domain/types';
import { formatCurrency, formatPercent } from '@utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@components/atoms/Card';
import { SegmentedControl } from '@components/molecules/SegmentedControl';

export interface VendedoresBarsProps {
  vendedores: VendedorKPIs[];
}

type ViewMode = 'venta' | 'conversion';

const COLOR = '#8b5cf6'; // purple-500

export function VendedoresBars({ vendedores }: VendedoresBarsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('venta');

  // Preparar datos según el modo de vista
  const chartData = vendedores.map(v => ({
    vendedor: v.vendedor,
    value: viewMode === 'venta' ? v.venta : v.conversion,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Performance por Vendedor</CardTitle>
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
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="vendedor"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              style={{ fontSize: '15px' }}
            />
            <YAxis
              tickFormatter={viewMode === 'venta' ? formatCurrency : (val) => formatPercent(val)}
              tick={{ fontSize: 10 }}
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
              dataKey="value"
              name={viewMode === 'venta' ? 'Venta' : '% Conversión'}
              fill={COLOR}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

