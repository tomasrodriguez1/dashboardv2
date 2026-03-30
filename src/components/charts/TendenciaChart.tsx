/**
 * Gráfico de tendencia semestral de ventas vs potencial y conversión.
 */

import { useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { TendenciaSemestral } from '@domain/types';
import { Card } from '@components/atoms/Card';
import { SegmentedControl } from '@components/molecules/SegmentedControl';
import { formatMillions, formatPercent } from '@utils/formatters';

interface TendenciaChartProps {
  data: TendenciaSemestral[];
}

type TendenciaMode = 'volumen' | 'conversion';

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  mode: TendenciaMode;
}

function CustomTooltip({ active, payload, label, mode }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-gray-900">
            {mode === 'conversion'
              ? formatPercent(entry.value, 1)
              : formatMillions(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TendenciaChart({ data }: TendenciaChartProps) {
  const [mode, setMode] = useState<TendenciaMode>('volumen');

  const chartData = data.map(d => ({
    ...d,
    conversion_pct: d.conversion * 100,
  }));

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Evolución Histórica</h3>
          <p className="text-xs text-gray-500 mt-0.5">Tendencia semestral de captura del mercado</p>
        </div>
        <SegmentedControl
          value={mode}
          onChange={(v) => setMode(v as TendenciaMode)}
          options={[
            { value: 'volumen', label: 'Venta vs Potencial' },
            { value: 'conversion', label: '% Conversión' },
          ]}
        />
      </div>

      <ResponsiveContainer width="100%" height={280}>
        {mode === 'volumen' ? (
          <ComposedChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}M`}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip content={<CustomTooltip mode={mode} />} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              formatter={(value) => <span className="text-gray-600">{value}</span>}
            />
            <Bar dataKey="ingreso_potencial" name="Potencial" fill="#e5e7eb" radius={[3, 3, 0, 0]} />
            <Bar dataKey="venta" name="Venta" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          </ComposedChart>
        ) : (
          <ComposedChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => `${v.toFixed(0)}%`}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 60]}
              width={44}
            />
            <Tooltip content={<CustomTooltip mode={mode} />} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              formatter={(value) => <span className="text-gray-600">{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="conversion_pct"
              name="% Conversión"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              dot={{ fill: '#8b5cf6', r: 5, strokeWidth: 0 }}
              activeDot={{ r: 7, strokeWidth: 0 }}
            />
          </ComposedChart>
        )}
      </ResponsiveContainer>
    </Card>
  );
}
