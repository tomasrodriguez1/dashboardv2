/**
 * Componente FiltersBar - barra de filtros globales (solo país).
 */

import { Select } from '@components/atoms/Select';
import { Badge } from '@components/atoms/Badge';
import { useFiltersStore } from '@state/filters.store';

export function FiltersBar() {
  const { pais, setPais } = useFiltersStore();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Filtro de país */}
        <Select
          label="País"
          value={pais}
          onChange={(value) => setPais(value as 'Ambos' | 'Chile' | 'Peru')}
          options={[
            { value: 'Ambos', label: 'Ambos Países' },
            { value: 'Chile', label: 'Chile' },
            { value: 'Peru', label: 'Perú' },
          ]}
          className="min-w-[150px]"
        />

        {/* Indicador de filtro activo */}
        {pais !== 'Ambos' && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-600">Filtro activo:</span>
            <Badge color="blue" size="sm">
              {pais}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
