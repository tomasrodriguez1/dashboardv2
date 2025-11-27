/**
 * Tabla jerárquica de necesidades por Cliente → Equipo → Mantención → Repuestos.
 */

import { useState } from 'react';
import { Card } from '@components/atoms/Card';
import { NeedBadge } from '@components/atoms/NeedBadge';
import { leadTimeAlert, diasRestantes } from '@domain/metrics.needs';
import type { ClienteNeedsGroup } from '@domain/metrics.needs';
import type { MantencionRow } from '@domain/types';

export interface ClientEquipmentNeedsTableProps {
  data: ClienteNeedsGroup[];
}

const PRECIO_PROMEDIO_REPUESTO_USD = 24;

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const ingresoPotencialAprox = (cantidad: number): string =>
  usdFormatter.format(cantidad * PRECIO_PROMEDIO_REPUESTO_USD);

type EquipoNeedsGroup = ClienteNeedsGroup['equipos'][number];
type MantencionNeedsGroup = EquipoNeedsGroup['mantenciones'][number];

const getSkuKey = (repuesto: MantencionRow): string =>
  repuesto.repuesto_codigo || repuesto.repuesto_nombre;

const formatSkuCount = (count: number): string =>
  `${count} SKU${count === 1 ? '' : 's'}`;

const countMantencionSkus = (mantencion: MantencionNeedsGroup): number => {
  const skuSet = new Set<string>();
  mantencion.repuestos.forEach(repuesto => skuSet.add(getSkuKey(repuesto)));
  return skuSet.size;
};

const countEquipoSkus = (equipo: EquipoNeedsGroup): number => {
  const skuSet = new Set<string>();
  equipo.mantenciones.forEach(mantencion => {
    mantencion.repuestos.forEach(repuesto => skuSet.add(getSkuKey(repuesto)));
  });
  return skuSet.size;
};

const countClienteSkus = (cliente: ClienteNeedsGroup): number => {
  const skuSet = new Set<string>();
  cliente.equipos.forEach(equipo => {
    equipo.mantenciones.forEach(mantencion => {
      mantencion.repuestos.forEach(repuesto => skuSet.add(getSkuKey(repuesto)));
    });
  });
  return skuSet.size;
};

export function ClientEquipmentNeedsTable({ data }: ClientEquipmentNeedsTableProps) {
  const [expandedClientes, setExpandedClientes] = useState<Set<string>>(new Set());
  const [expandedEquipos, setExpandedEquipos] = useState<Set<string>>(new Set());
  const [expandedMantenciones, setExpandedMantenciones] = useState<Set<string>>(new Set());

  const hoy = new Date().toISOString().split('T')[0];

  const toggleCliente = (clienteId: string) => {
    const newExpanded = new Set(expandedClientes);
    if (newExpanded.has(clienteId)) {
      newExpanded.delete(clienteId);
    } else {
      newExpanded.add(clienteId);
    }
    setExpandedClientes(newExpanded);
  };

  const toggleEquipo = (equipoId: string) => {
    const newExpanded = new Set(expandedEquipos);
    if (newExpanded.has(equipoId)) {
      newExpanded.delete(equipoId);
    } else {
      newExpanded.add(equipoId);
    }
    setExpandedEquipos(newExpanded);
  };

  const toggleMantencion = (mantencionKey: string) => {
    const newExpanded = new Set(expandedMantenciones);
    if (newExpanded.has(mantencionKey)) {
      newExpanded.delete(mantencionKey);
    } else {
      newExpanded.add(mantencionKey);
    }
    setExpandedMantenciones(newExpanded);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (data.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Plan de Repuestos Detallado
        </h3>
        <div className="flex items-center justify-center h-32 text-gray-500">
          No hay necesidades de repuestos en el horizonte seleccionado
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        📋 Plan de Repuestos Detallado
      </h3>
      <p className="text-sm text-gray-600 mb-2">
        Haz clic para expandir y ver: Cliente → Equipo → Mantención → Repuestos requeridos
      </p>
      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-md mb-4 inline-block">
        ℹ️ Mostrando todas las mantenciones entre 500h y 3500h, sin límite de fecha
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Cliente / Equipo / Mantención / Repuesto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Sistema / Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                SKU visibles
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Ingreso Potencial Aprox
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((cliente) => {
              const isClienteExpanded = expandedClientes.has(cliente.cliente_id);
              const clienteSkuCount = countClienteSkus(cliente);

              return (
                <>
                  {/* Fila de Cliente */}
                  <tr
                    key={`cliente-${cliente.cliente_id}`}
                    className="bg-blue-50 hover:bg-blue-100 cursor-pointer"
                    onClick={() => toggleCliente(cliente.cliente_id)}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      <span className="inline-flex items-center gap-2">
                        <span>{isClienteExpanded ? '▼' : '▶'}</span>
                        <span>👤 {cliente.cliente_nombre}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {cliente.equipos.length} equipo(s)
                    </td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {cliente.total_repuestos}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      {formatSkuCount(clienteSkuCount)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">
                      {ingresoPotencialAprox(cliente.total_repuestos)}
                    </td>
                    <td className="px-4 py-3"></td>
                  </tr>

                  {/* Equipos del Cliente (si está expandido) */}
                  {isClienteExpanded &&
                    cliente.equipos.map((equipo) => {
                      const isEquipoExpanded = expandedEquipos.has(equipo.equipo_id);
                      const equipoSkuCount = countEquipoSkus(equipo);

                      return (
                        <>
                          {/* Fila de Equipo */}
                          <tr
                            key={`equipo-${equipo.equipo_id}`}
                            className="bg-green-50 hover:bg-green-100 cursor-pointer"
                            onClick={() => toggleEquipo(equipo.equipo_id)}
                          >
                            <td className="px-4 py-3 pl-12 font-medium text-gray-900">
                              <span className="inline-flex items-center gap-2">
                                <span>{isEquipoExpanded ? '▼' : '▶'}</span>
                                <span>⚙️ {equipo.equipo_modelo}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {equipo.mantenciones.length} mantención(es)
                            </td>
                            <td className="px-4 py-3"></td>
                            <td className="px-4 py-3 text-right font-medium text-gray-900">
                              {equipo.total_repuestos}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-gray-700">
                              {formatSkuCount(equipoSkuCount)}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-green-700">
                              {ingresoPotencialAprox(equipo.total_repuestos)}
                            </td>
                            <td className="px-4 py-3"></td>
                          </tr>

                          {/* Mantenciones del Equipo (si está expandido) */}
                          {isEquipoExpanded &&
                            equipo.mantenciones.map((mantencion, mantIdx) => {
                              const mantencionKey = `${equipo.equipo_id}-${mantencion.mantencion_horas}-${mantencion.fecha_estimada}-${mantIdx}`;
                              const isMantencionExpanded = expandedMantenciones.has(mantencionKey);
                              const nivel = leadTimeAlert(mantencion.fecha_estimada, hoy);
                              const dias = diasRestantes(mantencion.fecha_estimada, hoy);
                              const ingresoMantencion = ingresoPotencialAprox(mantencion.total_repuestos);
                              const mantencionSkuCount = countMantencionSkus(mantencion);

                              return (
                                <>
                                  {/* Fila de Mantención */}
                                  <tr
                                    key={mantencionKey}
                                    className="bg-yellow-50 hover:bg-yellow-100 cursor-pointer"
                                    onClick={() => toggleMantencion(mantencionKey)}
                                  >
                                    <td className="px-4 py-2 pl-20 font-medium text-gray-900">
                                      <span className="inline-flex items-center gap-2">
                                        <span>{isMantencionExpanded ? '▼' : '▶'}</span>
                                        <span>🔧 Mantención {mantencion.mantencion_horas}h</span>
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600">
                                      {mantencion.tipo}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                      {formatDate(mantencion.fecha_estimada)}
                                    </td>
                                    <td className="px-4 py-2 text-right font-medium text-gray-900">
                                      {mantencion.total_repuestos} repuesto(s)
                                    </td>
                                    <td className="px-4 py-2 text-right text-sm text-gray-700">
                                      {formatSkuCount(mantencionSkuCount)}
                                    </td>
                                    <td className="px-4 py-2 text-right font-semibold text-green-700">
                                      {ingresoMantencion}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                      <NeedBadge level={nivel} diasRestantes={dias} />
                                    </td>
                                  </tr>

                                  {/* Repuestos de la Mantención (si está expandido) */}
                                  {isMantencionExpanded &&
                                    mantencion.repuestos.map((repuesto, idx) => {
                                      return (
                                        <tr
                                          key={`rep-${mantencionKey}-${idx}`}
                                          className="hover:bg-gray-50"
                                        >
                                          <td className="px-4 py-2 pl-28 text-sm text-gray-900">
                                            📦 {repuesto.repuesto_nombre}
                                            <span className="text-xs text-gray-500 ml-2">
                                              ({repuesto.repuesto_codigo})
                                            </span>
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-600">
                                            {repuesto.sistema}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-500">
                                            Int. {repuesto.intervalo_repuesto}h
                                          </td>
                                          <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                                            {repuesto.cantidad}
                                          </td>
                                      <td className="px-4 py-2 text-right text-sm text-gray-700">
                                        {formatSkuCount(1)}
                                      </td>
                                      <td className="px-4 py-2 text-right text-sm font-medium text-green-700">
                                        {ingresoPotencialAprox(repuesto.cantidad)}
                                      </td>
                                          <td className="px-4 py-2"></td>
                                        </tr>
                                      );
                                    })}
                                </>
                              );
                            })}
                        </>
                      );
                    })}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
