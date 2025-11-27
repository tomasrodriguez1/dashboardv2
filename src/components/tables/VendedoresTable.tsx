/**
 * Componente VendedoresTable - tabla de performance por vendedor.
 */

import type { VendedorKPIs } from '@domain/types';
import { formatCurrency, formatPercent } from '@utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@components/atoms/Card';
import { Badge } from '@components/atoms/Badge';
import { UMBRAL_CONV_BAJA_CLIENTE } from '@domain/thresholds';

export interface VendedoresTableProps {
  vendedores: VendedorKPIs[];
  p75Potencial?: number;
}

export function VendedoresTable({ vendedores, p75Potencial = 0 }: VendedoresTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance por Vendedor</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Métricas de venta y conversión por vendedor
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Vendedor</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">País(es)</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Ing. Potencial</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Venta</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">% Conv.</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Clientes</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Estado</th>
            </tr>
          </thead>
          <tbody>
            {vendedores.map((vendedor, index) => {
              // Evaluar alertas
              const conversionBaja = vendedor.conversion < UMBRAL_CONV_BAJA_CLIENTE;
              const altoPotencial = vendedor.ingreso_potencial >= p75Potencial;

              let alertLevel: 'none' | 'warning' | 'danger' = 'none';
              
              if (conversionBaja && altoPotencial) {
                alertLevel = 'danger';
              } else if (conversionBaja) {
                alertLevel = 'warning';
              }

              const rowClasses = alertLevel === 'danger'
                ? 'bg-red-50'
                : alertLevel === 'warning'
                ? 'bg-yellow-50'
                : '';

              return (
                <tr
                  key={`${vendedor.vendedor}-${index}`}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${rowClasses}`}
                >
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {vendedor.vendedor}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {vendedor.paises.map(pais => (
                        <Badge
                          key={pais}
                          color={pais === 'Chile' ? 'blue' : 'green'}
                          size="sm"
                        >
                          {pais}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700">
                    {formatCurrency(vendedor.ingreso_potencial)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700">
                    {formatCurrency(vendedor.venta)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={
                        conversionBaja
                          ? 'text-red-600 font-semibold'
                          : 'text-green-600'
                      }
                    >
                      {formatPercent(vendedor.conversion)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">
                    {vendedor.cantidad_clientes}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {alertLevel === 'danger' ? (
                      <Badge color="red" size="sm">
                        Crítico
                      </Badge>
                    ) : alertLevel === 'warning' ? (
                      <Badge color="yellow" size="sm">
                        Atención
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

        {vendedores.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay datos de vendedores disponibles
          </div>
        )}
      </CardContent>
    </Card>
  );
}

