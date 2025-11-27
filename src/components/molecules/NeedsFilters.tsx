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
  clientes: Array<{ id: string; nombre: string }>;
  equipos: Array<{ id: string; modelo: string }>;
  repuestos: Array<{ nombre: string; codigo: string }>;
  onClienteChange: (cliente: string) => void;
  onEquipoChange: (equipo: string) => void;
  onRepuestoChange: (repuesto: string) => void;
}

export function NeedsFilters({
  cliente,
  equipo,
  repuesto,
  clientes,
  equipos,
  repuestos,
  onClienteChange,
  onEquipoChange,
  onRepuestoChange,
}: NeedsFiltersProps) {
  // Opciones de cliente
  const clienteOptions: SelectOption[] = [
    { value: 'Todos', label: 'Todos los clientes' },
    ...clientes.map(c => ({
      value: c.id,
      label: `${c.id} - ${c.nombre}`,
    })),
  ];

  // Opciones de equipo
  const equipoOptions: SelectOption[] = [
    { value: 'Todos', label: 'Todos los equipos' },
    ...equipos.map(e => ({
      value: e.id,
      label: `${e.id} - ${e.modelo}`,
    })),
  ];

  // Opciones de repuesto
  const repuestoOptions: SelectOption[] = [
    { value: 'Todos', label: 'Todos los repuestos' },
    ...repuestos.map(r => ({
      value: r.nombre,
      label: `${r.nombre} (${r.codigo})`,
    })),
  ];

  const handleClienteChange = (value: string | number) => {
    onClienteChange(String(value));
  };

  const handleEquipoChange = (value: string | number) => {
    onEquipoChange(String(value));
  };

  const handleRepuestoChange = (value: string | number) => {
    onRepuestoChange(String(value));
  };

  return (
    <Card className="mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">🔍 Filtros de Repuestos:</span>
          <span className="text-xs text-gray-500 bg-blue-100 px-3 py-1 rounded-full font-medium">
            📊 Rango: 500 - 3500 horas | 📅 Todas las fechas futuras
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Cliente"
            value={cliente}
            onChange={handleClienteChange}
            options={clienteOptions}
          />
          
          <Select
            label="Equipo"
            value={equipo}
            onChange={handleEquipoChange}
            options={equipoOptions}
          />
          
          <Select
            label="Repuesto"
            value={repuesto}
            onChange={handleRepuestoChange}
            options={repuestoOptions}
          />
        </div>
      </div>
    </Card>
  );
}

