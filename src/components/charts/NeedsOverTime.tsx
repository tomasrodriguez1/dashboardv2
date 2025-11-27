/**
 * Gráfico de necesidades de repuestos a lo largo del tiempo.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@components/atoms/Card';
import type { SparePartSeries } from '@services/selectors.needs';

export interface NeedsOverTimeProps {
  data: SparePartSeries[];
}

export function NeedsOverTime({ data }: NeedsOverTimeProps) {
  // Formatear fecha para el eje X
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  // Formatear tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900">
            Semana del {formatDate(data.periodo)}
          </p>
          <p className="text-sm text-blue-600 font-medium">
            Repuestos: {data.cantidad}
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📈 Demanda de Repuestos en el Tiempo
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No hay datos disponibles para el horizonte seleccionado
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📈 Demanda de Repuestos en el Tiempo
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Cantidad de repuestos requeridos por semana
      </p>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="periodo"
            tickFormatter={formatDate}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ 
              value: 'Cantidad', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: '12px', fill: '#6b7280' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="cantidad"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

