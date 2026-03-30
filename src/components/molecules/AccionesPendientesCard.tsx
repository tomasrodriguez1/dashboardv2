/**
 * Card de acciones pendientes por vendedor.
 * Muestra clientes en riesgo y repuestos próximos de forma expandible.
 */

import { useState } from 'react';
import type { VendedorAcciones } from '@domain/types';
import { Card } from '@components/atoms/Card';
import { Badge } from '@components/atoms/Badge';
import { formatPercent, formatMillions } from '@utils/formatters';

interface AccionesPendientesCardProps {
  vendedores: VendedorAcciones[];
}

interface VendedorRowProps {
  vendedor: VendedorAcciones;
}

function VendedorRow({ vendedor }: VendedorRowProps) {
  const [expanded, setExpanded] = useState(false);
  const totalAcciones = vendedor.clientesEnRiesgo.length + vendedor.repuestosProximos.length;
  const sinAcciones = totalAcciones === 0;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header del vendedor */}
      <button
        onClick={() => !sinAcciones && setExpanded(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white text-left transition-colors ${
          sinAcciones ? 'cursor-default' : 'hover:bg-gray-50 cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-900">{vendedor.vendedor}</span>
          <div className="flex gap-1">
            {vendedor.paises.map(p => (
              <Badge key={p} color={p === 'Chile' ? 'blue' : 'green'} size="sm">
                {p}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {sinAcciones ? (
            <Badge color="green" size="sm">Sin acciones urgentes</Badge>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {vendedor.clientesEnRiesgo.length > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  {vendedor.clientesEnRiesgo.length} cliente{vendedor.clientesEnRiesgo.length !== 1 ? 's' : ''} en riesgo
                </span>
              )}
              {vendedor.clientesEnRiesgo.length > 0 && vendedor.repuestosProximos.length > 0 && (
                <span className="text-gray-300">·</span>
              )}
              {vendedor.repuestosProximos.length > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                  {vendedor.repuestosProximos.length} repuesto{vendedor.repuestosProximos.length !== 1 ? 's' : ''} próximo{vendedor.repuestosProximos.length !== 1 ? 's' : ''}
                </span>
              )}
              <span className="text-gray-400 ml-1">{expanded ? '▲' : '▼'}</span>
            </div>
          )}
        </div>
      </button>

      {/* Detalle expandible */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clientes en riesgo */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Clientes en riesgo
            </h4>
            {vendedor.clientesEnRiesgo.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Sin clientes en riesgo</p>
            ) : (
              <div className="space-y-2">
                {vendedor.clientesEnRiesgo.map(c => (
                  <div
                    key={c.cliente}
                    className="flex items-center justify-between bg-white rounded-md px-3 py-2 border border-gray-100"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.cliente}</p>
                      <p className="text-xs text-gray-500">{formatMillions(c.potencial)} potencial</p>
                    </div>
                    <Badge color={c.conversion < 0.2 ? 'red' : 'yellow'} size="sm">
                      {formatPercent(c.conversion)} conv.
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Repuestos próximos */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Repuestos próximos (45 días)
            </h4>
            {vendedor.repuestosProximos.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Sin repuestos próximos</p>
            ) : (
              <div className="space-y-2">
                {vendedor.repuestosProximos.map((r, idx) => (
                  <div
                    key={`${r.cliente}-${r.repuesto}-${idx}`}
                    className="flex items-center justify-between bg-white rounded-md px-3 py-2 border border-gray-100"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-sm font-medium text-gray-800 truncate">{r.repuesto}</p>
                      <p className="text-xs text-gray-500 truncate">{r.cliente} · {r.equipo}</p>
                    </div>
                    <Badge color={r.urgente ? 'red' : 'yellow'} size="sm" className="shrink-0">
                      {r.diasRestantes === 0 ? 'Hoy' : `${r.diasRestantes}d`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AccionesPendientesCard({ vendedores }: AccionesPendientesCardProps) {
  const totalClientes = vendedores.reduce((s, v) => s + v.clientesEnRiesgo.length, 0);
  const totalRepuestos = vendedores.reduce((s, v) => s + v.repuestosProximos.length, 0);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Acciones Pendientes</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Clientes con baja conversión y repuestos con fecha próxima por vendedor
          </p>
        </div>
        <div className="flex gap-2 text-sm text-gray-600">
          {totalClientes > 0 && (
            <span className="flex items-center gap-1.5 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              {totalClientes} clientes en riesgo
            </span>
          )}
          {totalRepuestos > 0 && (
            <span className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" />
              {totalRepuestos} repuestos próximos
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {vendedores.map(v => (
          <VendedorRow key={v.vendedor} vendedor={v} />
        ))}
      </div>
    </Card>
  );
}
