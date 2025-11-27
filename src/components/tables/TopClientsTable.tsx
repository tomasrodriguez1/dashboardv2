/**
 * Componente TopClientsTable - tabla de Top N clientes con formato condicional.
 */

import type { ClienteKPIs } from '@domain/types';
import { formatCurrency, formatPercent } from '@utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@components/atoms/Card';
import { Badge } from '@components/atoms/Badge';
import { Select } from '@components/atoms/Select';
import {
  UMBRAL_CONV_BAJA_CLIENTE,
  evaluarAlertaConcentracion,
  getBadgeColor,
  TOP_N_OPTIONS,
} from '@domain/thresholds';

export interface TopClientsTableProps {
  clientes: ClienteKPIs[];
  p75Potencial: number;
  topN: number;
  onTopNChange: (value: number) => void;
}

export function TopClientsTable({ clientes, p75Potencial, topN, onTopNChange }: TopClientsTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Top Clientes por Ingreso Potencial</CardTitle>
          <Select
            label=""
            value={topN}
            onChange={(value) => onTopNChange(Number(value))}
            options={TOP_N_OPTIONS.map(n => ({ value: n, label: `Top ${n}` }))}
            className="min-w-[100px]"
          />
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">País</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Cliente</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Ing. Potencial</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Venta</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">% Conv.</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">% Partic.</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Estado</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente, index) => {
              // Evaluar alertas
              const conversionBaja = cliente.conversion < UMBRAL_CONV_BAJA_CLIENTE;
              const altoPotencial = cliente.ingreso_potencial >= p75Potencial;
              const alertaConcentracion = evaluarAlertaConcentracion(cliente.participacion_venta);

              // Determinar el nivel de alerta más crítico
              let alertLevel: 'none' | 'warning' | 'danger' = 'none';
              let alertReason = '';

              if (conversionBaja && altoPotencial) {
                alertLevel = 'danger';
                alertReason = 'Baja conversión + Alto potencial';
              } else if (conversionBaja) {
                alertLevel = 'warning';
                alertReason = 'Baja conversión';
              }

              if (alertaConcentracion === 'danger') {
                alertLevel = 'danger';
                alertReason = alertReason
                  ? `${alertReason}, Alta concentración`
                  : 'Alta concentración';
              } else if (alertaConcentracion === 'warning' && alertLevel !== 'danger') {
                alertLevel = 'warning';
                alertReason = alertReason
                  ? `${alertReason}, Concentración moderada`
                  : 'Concentración moderada';
              }

              const rowClasses = alertLevel === 'danger'
                ? 'bg-red-50'
                : alertLevel === 'warning'
                ? 'bg-yellow-50'
                : '';

              return (
                <tr
                  key={`${cliente.pais}-${cliente.cliente}-${index}`}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${rowClasses}`}
                >
                  <td className="py-3 px-4">
                    <Badge
                      color={cliente.pais === 'Chile' ? 'blue' : 'green'}
                      size="sm"
                    >
                      {cliente.pais}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {cliente.cliente}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700">
                    {formatCurrency(cliente.ingreso_potencial)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700">
                    {formatCurrency(cliente.venta)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={
                        conversionBaja
                          ? 'text-red-600 font-semibold'
                          : 'text-green-600'
                      }
                    >
                      {formatPercent(cliente.conversion)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700">
                    {formatPercent(cliente.participacion_venta)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {alertLevel !== 'none' ? (
                      <Badge
                        color={getBadgeColor(alertLevel)}
                        size="sm"
                      >
                        {alertLevel === 'danger' ? 'Crítico' : 'Atención'}
                      </Badge>
                    ) : (
                      <Badge color="green" size="sm">
                        OK
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {clientes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay datos de clientes disponibles
          </div>
        )}
      </CardContent>
    </Card>
  );
}

