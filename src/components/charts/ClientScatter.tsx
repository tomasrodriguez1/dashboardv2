/**
 * Componente ClientScatter - scatter plot de clientes (potencial vs conversión).
 */
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';
import type { ClientScatterPoint } from '@domain/types';
import { formatCurrency, formatPercent } from '@utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@components/atoms/Card';

export interface ClientScatterProps {
  data: ClientScatterPoint[];
}

const COLORS: Record<string, string> = {
  Chile: '#3b82f6',
  Peru: '#10b981',
};

export function ClientScatter({ data }: ClientScatterProps) {
  // Separar datos por país y convertir conversión a porcentaje (0-100)
  const chileData = data.filter(d => d.pais === 'Chile').map(d => ({
    ...d,
    conversionPercent: d.conversion * 100,
  }));
  const peruData = data.filter(d => d.pais === 'Peru').map(d => ({
    ...d,
    conversionPercent: d.conversion * 100,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload as ClientScatterPoint;
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-900">{point.cliente}</p>
          <p className="text-sm text-gray-600">País: {point.pais}</p>
          <p className="text-sm text-gray-600">
            Ingreso Potencial: {formatCurrency(point.x)}
          </p>
          <p className="text-sm text-gray-600">
            Venta: {formatCurrency(point.y)}
          </p>
          <p className="text-sm font-semibold text-gray-900">
            % Conversión: {formatPercent(point.conversion)}
          </p>
          {point.es_top_n && (
            <p className="text-sm font-medium text-primary-600 mt-1">
              ★ Top Cliente
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Oportunidades por Cliente</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Ingreso Potencial vs. % Conversión (★ = Top N)
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={450}>
          <ScatterChart
            margin={{ top: 20, right: 50, left: 30, bottom: 50 }}
          >
            <CartesianGrid 
              strokeDasharray="2 2" 
              stroke="#d1d5db"
              strokeWidth={0.5}
            />
            <XAxis
              type="number"
              dataKey="x"
              name="Ingreso Potencial"
              tickFormatter={formatCurrency}
              label={{
                value: 'Ingreso Potencial',
                position: 'insideBottom',
                offset: -10,
                style: { fontSize: '13px', fontWeight: 600 }
              }}
              tick={{ fontSize: 13 }}
              tickCount={8}
            />
            <YAxis
              type="number"
              dataKey="conversionPercent"
              name="% Conversión"
              tickFormatter={(value) => `${value}%`}
              label={{
                value: '% Conversión',
                angle: -90,
                position: 'insideLeft',
                offset: -20,
                style: { fontSize: '15px', fontWeight: 600 }
              }}
              tick={{ fontSize: 13 }}
              domain={[0, 100]}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
            />
            <ZAxis range={[50, 400]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top"
              height={36}
            />
            <Scatter
              name="Chile"
              data={chileData}
              fill={COLORS.Chile}
              shape={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.es_top_n) {
                  // Estrella para Top N
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r={6} fill={COLORS.Chile} />
                      <text
                        x={cx}
                        y={cy}
                        dy={4}
                        textAnchor="middle"
                        fill="white"
                        fontSize={10}
                      >
                        ★
                      </text>
                    </g>
                  );
                }
                return <circle cx={cx} cy={cy} r={5} fill={COLORS.Chile} />;
              }}
            />
            <Scatter
              name="Peru"
              data={peruData}
              fill={COLORS.Peru}
              shape={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.es_top_n) {
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r={6} fill={COLORS.Peru} />
                      <text
                        x={cx}
                        y={cy}
                        dy={4}
                        textAnchor="middle"
                        fill="white"
                        fontSize={10}
                      >
                        ★
                      </text>
                    </g>
                  );
                }
                return <circle cx={cx} cy={cy} r={5} fill={COLORS.Peru} />;
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

