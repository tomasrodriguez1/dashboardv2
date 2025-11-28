/**
 * Página DashboardPage - dashboard ejecutivo principal.
 */

import { useEffect, useState } from 'react';
import { SegmentedControl } from '@components/molecules/SegmentedControl';
import type { AppData } from '@domain/types';
import { loadAllData } from '@services/dataLoader';
import {
  getGlobalKPIs,
  getCountryMixData,
  getCategorySeries,
  getClientScatterData,
  getTopClients,
  getAllCategorias,
  getP75Potencial,
  getVendedoresKPIs,
} from '@services/selectors';
import {
  getNeedsKPIs,
  getClientEquipmentNeeds,
  getSparePartsCalendarSeries,
  getAvailableClientes,
  getAvailableEquipos,
  getAvailableRepuestos,
} from '@services/selectors.needs';
import { useFilters, useFiltersActions } from '@state/filters.store';
import { formatPercent, formatMillions } from '@utils/formatters';
import { KPIStat } from '@components/atoms/KPIStat';
import { Card } from '@components/atoms/Card';
import { ProgressBar } from '@components/atoms/ProgressBar';
import { FiltersBar } from '@components/molecules/FiltersBar';
import { CountryMixChart } from '@components/charts/CountryMixChart';
import { CategoryBars } from '@components/charts/CategoryBars';
import { ClientScatter } from '@components/charts/ClientScatter';
import { TopClientsTable } from '@components/tables/TopClientsTable';
import { VendedoresTable } from '@components/tables/VendedoresTable';
import { VendedoresBars } from '@components/charts/VendedoresBars';
import { NeedsFilters } from '@components/molecules/NeedsFilters';
import { NeedsOverTime } from '@components/charts/NeedsOverTime';
import { ClientEquipmentNeedsTable } from '@components/tables/ClientEquipmentNeedsTable';

type DashboardTab = 'ventas' | 'vendedores' | 'repuestos';

export function DashboardPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('ventas');

  const filtros = useFilters();
  const { setPais, toggleCategoria, setTopN, setCliente, setEquipo, setRepuesto } = useFiltersActions();

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAllData()
      .then((loadedData) => {
        setData(loadedData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Error cargando datos');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error || 'No se pudieron cargar los datos'}</p>
        </div>
      </div>
    );
  }

  // Calcular métricas usando los selectores
  const globalKPIs = getGlobalKPIs(data, filtros);
  const countryMixData = getCountryMixData(data, filtros);
  const categorySeries = getCategorySeries(data, filtros);
  const scatterData = getClientScatterData(data, filtros);
  const topClients = getTopClients(data, filtros);
  const categorias = getAllCategorias(data);
  const p75Potencial = getP75Potencial(data, filtros);
  
  // Métricas de vendedores
  const vendedoresKPIs = getVendedoresKPIs(data, filtros);

  // Métricas de necesidades de repuestos
  const needsFiltros = {
    pais: filtros.pais,
    cliente: filtros.cliente,
    equipo: filtros.equipo,
    repuesto: filtros.repuesto,
    horizonte: filtros.horizonte,
  };
  const needsKPIs = getNeedsKPIs(data, needsFiltros);
  const clientEquipmentNeeds = getClientEquipmentNeeds(data, needsFiltros);
  const needsSeries = getSparePartsCalendarSeries(data, needsFiltros);
  const availableClientes = getAvailableClientes(data);
  const availableEquipos = getAvailableEquipos(data, filtros.cliente);
  const availableRepuestos = getAvailableRepuestos(data, filtros.cliente, filtros.equipo);

  // Handlers para interacciones
  const handleCountryClick = (country: string) => {
    if (country === 'Chile' || country === 'Peru') {
      setPais(country);
    }
  };

  const handleCategoryClick = (category: string) => {
    toggleCategoria(category);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Skava - Análisis de Ventas
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Evaluación de captura de ingreso potencial vs. venta y planificación de repuestos.
          </p>
        </div>
      </header>

      {/* Filtros */}
      <FiltersBar />

      {/* Pestañas principales */}
      <div className="px-6 pt-6">
        <SegmentedControl
          value={activeTab}
          onChange={(value) => setActiveTab(value as DashboardTab)}
          options={[
            { value: 'ventas', label: '📊 Ventas' },
            { value: 'vendedores', label: '👥 Vendedores' },
            { value: 'repuestos', label: '🔧 Repuestos' },
          ]}
        />
      </div>

      {/* Contenido principal */}
      <main className="px-6 py-6 space-y-6">
        {/* PESTAÑA: VENTAS */}
        {activeTab === 'ventas' && (
          <>
            {/* Filtros locales de Ventas */}
            <Card className="mb-6">
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium text-gray-700">🔍 Filtros:</h3>

                {/* Filtro de categorías */}
                {categorias.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categorías
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categorias.map((categoria) => {
                        const isSelected = filtros.categorias.includes(categoria);
                        return (
                          <button
                            key={categoria}
                            onClick={() => toggleCategoria(categoria)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg border-2 transition-colors ${
                              isSelected
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                            }`}
                          >
                            {categoria}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Fila 1: KPIs Globales + Mix por País */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* KPIs Globales */}
          <div className="lg:col-span-8 flex flex-col gap-4 h-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              <KPIStat
                label="Ingresos a la fecha"
                value={formatMillions(globalKPIs.venta_total)}
                centerValue
                className="h-full min-h-[220px]"
              />
              <KPIStat
                label="Ingreso Potencial"
                value={formatMillions(globalKPIs.ingreso_potencial_total)}
                centerValue
                className="h-full min-h-[220px]"
              />
              <KPIStat
                label="% Conversión"
                value={formatPercent(globalKPIs.conversion)}
                centerValue
                className="h-full min-h-[220px]"
                valueClassName={
                  globalKPIs.conversion >= 0.4
                    ? 'text-green-600'
                    : globalKPIs.conversion >= 0.3
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }
              />
            </div>

            <Card className="flex flex-col gap-4 flex-1 h-full">
              <p className="text-sm font-medium text-gray-600">
                Conversión por País
              </p>
              <div className="flex flex-col gap-4">
                <ProgressBar
                  label="Chile"
                  value={globalKPIs.conversion_chile}
                  color="#3b82f6"
                  orientation="horizontal"
                />
                <ProgressBar
                  label="Perú"
                  value={globalKPIs.conversion_peru}
                  color="#10b981"
                  orientation="horizontal"
                />
              </div>
            </Card>
          </div>

          {/* Mix por País */}
          <div className="lg:col-span-4 h-full">
            <CountryMixChart
              data={countryMixData}
              onCountryClick={handleCountryClick}
            />
          </div>
        </div>

        {/* Fila 2: Gráfico por Categoría */}
        <div className="grid grid-cols-1">
          <CategoryBars
            data={categorySeries}
            onCategoryClick={handleCategoryClick}
          />
        </div>

        {/* Fila 3: Scatter de Clientes + Tabla Top Clientes */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ClientScatter data={scatterData} />
          <TopClientsTable 
            clientes={topClients} 
            p75Potencial={p75Potencial}
            topN={filtros.topN}
            onTopNChange={setTopN}
          />
        </div>
          </>
        )}

        {/* PESTAÑA: VENDEDORES */}
        {activeTab === 'vendedores' && (
          <>
        {/* Performance por Vendedor */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📊 Performance por Vendedor
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Análisis de métricas de venta y conversión por vendedor. Los datos respetan los filtros globales aplicados.
          </p>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <VendedoresTable vendedores={vendedoresKPIs} p75Potencial={p75Potencial} />
            <VendedoresBars vendedores={vendedoresKPIs} />
          </div>
        </div>
          </>
        )}

        {/* PESTAÑA: REPUESTOS */}
        {activeTab === 'repuestos' && (
          <>
        {/* Plan de Repuestos */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            🔧 Plan de Repuestos por Equipo/Cliente
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Planificación de necesidades de repuestos según calendario de mantenciones. 
            Navegue desde el filtro de cliente hasta equipos y repuestos específicos con sus fechas estimadas.
          </p>

          {/* Filtros específicos de repuestos */}
          <NeedsFilters
            cliente={filtros.cliente}
            equipo={filtros.equipo}
            repuesto={filtros.repuesto}
            clientes={availableClientes}
            equipos={availableEquipos}
            repuestos={availableRepuestos}
            onClienteChange={setCliente}
            onEquipoChange={setEquipo}
            onRepuestoChange={setRepuesto}
          />

          {/* Gráfico y KPIs de necesidades */}
          <div className="grid grid-cols-1 xl:grid-cols-10 gap-6 mb-6 items-stretch">
            <div className="xl:col-span-3">
              <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
                <KPIStat
                  label="Repuestos próximos 30 días"
                  value={String(needsKPIs.total_30d)}
                  className="h-full"
                />
                <KPIStat
                  label="% en Alerta"
                  value={formatPercent(needsKPIs.porcentaje_alerta)}
                  className="h-full"
                  valueClassName={
                    needsKPIs.porcentaje_alerta >= 0.5
                      ? 'text-red-600'
                      : needsKPIs.porcentaje_alerta >= 0.3
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }
                />
                <KPIStat
                  label="Repuestos próximos 90 días"
                  value={String(needsKPIs.total_90d)}
                  className="h-full"
                />
                <KPIStat
                  label="Repuestos próximos 180 días"
                  value={String(needsKPIs.total_180d)}
                  className="h-full"
                />
              </div>
            </div>
            <div className="xl:col-span-7">
              <NeedsOverTime data={needsSeries} />
            </div>
          </div>

          {/* Tabla de necesidades */}
          <div>
            <ClientEquipmentNeedsTable data={clientEquipmentNeeds} />
          </div>
        </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4 mt-8">
        <p className="text-sm text-gray-600 text-center">
          Dashboard Ejecutivo v1.0 - Análisis de Ventas y Oportunidades
        </p>
      </footer>
    </div>
  );
}

