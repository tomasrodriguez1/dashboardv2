/**
 * Barra de filtros específica para el módulo de Plan de Repuestos.
 */

import { Select } from '@components/atoms/Select';
import { Card } from '@components/atoms/Card';
import type { SelectOption } from '@components/atoms/Select';

export interface NeedsFiltersProps {
  cliente: string;
  equipo: string;
  repuesto: string;
  estadoMantencion: string;
  clientes: Array<{ id: string; nombre: string }>;
  equipos: Array<{ id: string; modelo: string }>;
  repuestos: Array<{ nombre: string; codigo: string }>;
  onClienteChange: (cliente: string) => void;
  onEquipoChange: (equipo: string) => void;
  onRepuestoChange: (repuesto: string) => void;
  onEstadoMantencionChange: (estado: string) => void;
}

export function NeedsFilters({
  cliente,
  equipo,
  repuesto,
  estadoMantencion,
  clientes,
  equipos,
  repuestos,
  onClienteChange,
  onEquipoChange,
  onRepuestoChange,
  onEstadoMantencionChange,
}: NeedsFiltersProps) {
  const clienteOptions: SelectOption[] = [
    { value: 'Todos', label: 'Todos los clientes' },
    ...clientes.map(c => ({
      value: c.id,
      label: `${c.id} - ${c.nombre}`,
    })),
  ];

  const equipoOptions: SelectOption[] = [
    { value: 'Todos', label: 'Todos los equipos' },
    ...equipos.map(e => ({
      value: e.id,
      label: `${e.id} - ${e.modelo}`,
    })),
  ];

  const repuestoOptions: SelectOption[] = [
    { value: 'Todos', label: 'Todos los repuestos' },
    ...repuestos.map(r => ({
      value: r.nombre,
      label: `${r.nombre} (${r.codigo})`,
    })),
  ];

  const estadoOptions: SelectOption[] = [
    { value: 'Todos', label: 'Todos los estados' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'atrasada', label: 'Atrasada' },
    { value: 'completada', label: 'Completada' },
  ];

  return (
    <Card className="mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">🔍 Filtros de Repuestos:</span>
          <span className="text-xs text-gray-500 bg-blue-100 px-3 py-1 rounded-full font-medium">
            📊 Rango: 500 - 3500 horas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Cliente"
            value={cliente}
            onChange={v => onClienteChange(String(v))}
            options={clienteOptions}
          />

          <Select
            label="Equipo"
            value={equipo}
            onChange={v => onEquipoChange(String(v))}
            options={equipoOptions}
          />

          <Select
            label="Repuesto"
            value={repuesto}
            onChange={v => onRepuestoChange(String(v))}
            options={repuestoOptions}
          />

          <Select
            label="Estado"
            value={estadoMantencion}
            onChange={v => onEstadoMantencionChange(String(v))}
            options={estadoOptions}
          />
        </div>
      </div>
    </Card>
  );
}
