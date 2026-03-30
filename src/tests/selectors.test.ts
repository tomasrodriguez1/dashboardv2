/**
 * Tests para selectores.
 * 
 * Prueba que los selectores apliquen filtros correctamente
 * y que los cálculos sean consistentes.
 */

import { describe, it, expect } from 'vitest';
import type { AppData } from '@domain/types';
import {
  getGlobalKPIs,
  getCountryKPIs,
  getCategorySeries,
  getTopClients,
  getAllCategorias,
  type Filtros,
} from '@services/selectors';

// Datos de prueba simplificados
const mockData: AppData = {
  paises: [
    { pais: 'Chile', ingreso_potencial: 1000, venta: 500 },
    { pais: 'Peru', ingreso_potencial: 500, venta: 200 },
  ],
  categorias: [
    { categoria: 'Cat A', pais: 'Chile', ingreso_potencial: 600, venta: 300 },
    { categoria: 'Cat A', pais: 'Peru', ingreso_potencial: 300, venta: 120 },
    { categoria: 'Cat B', pais: 'Chile', ingreso_potencial: 400, venta: 200 },
    { categoria: 'Cat B', pais: 'Peru', ingreso_potencial: 200, venta: 80 },
  ],
  clientes: [
    { pais: 'Chile', cliente: 'Cliente 1', ingreso_potencial: 500, venta: 250, vendedor: 'Vendedor 1' },
    { pais: 'Chile', cliente: 'Cliente 2', ingreso_potencial: 300, venta: 150, vendedor: 'Vendedor 1' },
    { pais: 'Chile', cliente: 'Cliente 3', ingreso_potencial: 200, venta: 100, vendedor: 'Vendedor 2' },
    { pais: 'Peru', cliente: 'Cliente 4', ingreso_potencial: 300, venta: 120, vendedor: 'Vendedor 2' },
    { pais: 'Peru', cliente: 'Cliente 5', ingreso_potencial: 200, venta: 80, vendedor: 'Vendedor 3' },
  ],
  mantenciones: [],
  tendencia: [],
};

const filtrosSinFiltrar: Filtros = {
  pais: 'Ambos',
  categorias: [],
  topN: 10,
};

const filtrosChile: Filtros = {
  pais: 'Chile',
  categorias: [],
  topN: 10,
};

const filtrosPeru: Filtros = {
  pais: 'Peru',
  categorias: [],
  topN: 10,
};

describe('getGlobalKPIs', () => {
  it('calcula KPIs globales correctamente sin filtros', () => {
    const kpis = getGlobalKPIs(mockData, filtrosSinFiltrar);

    // Suma total de ventas de todos los clientes
    expect(kpis.venta_total).toBe(700); // 250+150+100+120+80
    
    // Suma total de ingreso potencial de todos los clientes
    expect(kpis.ingreso_potencial_total).toBe(1500); // 500+300+200+300+200
    
    // Conversión global
    expect(kpis.conversion).toBeCloseTo(700 / 1500, 5);
    
    // Venta por país
    expect(kpis.venta_chile).toBe(500); // 250+150+100
    expect(kpis.venta_peru).toBe(200); // 120+80
  });

  it('filtra correctamente por Chile', () => {
    const kpis = getGlobalKPIs(mockData, filtrosChile);

    expect(kpis.venta_total).toBe(500);
    expect(kpis.ingreso_potencial_total).toBe(1000);
    expect(kpis.venta_peru).toBe(0);
  });

  it('filtra correctamente por Perú', () => {
    const kpis = getGlobalKPIs(mockData, filtrosPeru);

    expect(kpis.venta_total).toBe(200);
    expect(kpis.ingreso_potencial_total).toBe(500);
    expect(kpis.venta_chile).toBe(0);
  });

  it('mantiene consistencia: suma de países = total global', () => {
    const kpis = getGlobalKPIs(mockData, filtrosSinFiltrar);

    const sumaVentaPaises = kpis.venta_chile + kpis.venta_peru;
    expect(sumaVentaPaises).toBe(kpis.venta_total);
  });
});

describe('getCountryKPIs', () => {
  it('retorna KPIs de ambos países sin filtro', () => {
    const kpis = getCountryKPIs(mockData, filtrosSinFiltrar);

    expect(kpis).toHaveLength(2);
    
    const chileKPI = kpis.find(k => k.pais === 'Chile');
    const peruKPI = kpis.find(k => k.pais === 'Peru');

    expect(chileKPI?.venta).toBe(500);
    expect(peruKPI?.venta).toBe(200);
  });

  it('calcula participación correctamente', () => {
    const kpis = getCountryKPIs(mockData, filtrosSinFiltrar);

    const chileKPI = kpis.find(k => k.pais === 'Chile');
    const peruKPI = kpis.find(k => k.pais === 'Peru');

    // Chile: 500 / 700 = 0.714...
    expect(chileKPI?.participacion_venta).toBeCloseTo(500 / 700, 5);
    
    // Perú: 200 / 700 = 0.285...
    expect(peruKPI?.participacion_venta).toBeCloseTo(200 / 700, 5);
  });

  it('suma de participaciones es 1', () => {
    const kpis = getCountryKPIs(mockData, filtrosSinFiltrar);

    const sumaParticipaciones = kpis.reduce((sum, k) => sum + k.participacion_venta, 0);
    expect(sumaParticipaciones).toBeCloseTo(1, 5);
  });
});

describe('getCategorySeries', () => {
  it('retorna datos de todas las categorías', () => {
    const series = getCategorySeries(mockData, filtrosSinFiltrar);

    expect(series).toHaveLength(2);
    
    const catA = series.find(s => s.categoria === 'Cat A');
    const catB = series.find(s => s.categoria === 'Cat B');

    expect(catA?.venta_chile).toBe(300);
    expect(catA?.venta_peru).toBe(120);
    expect(catB?.venta_chile).toBe(200);
    expect(catB?.venta_peru).toBe(80);
  });

  it('calcula conversiones por categoría correctamente', () => {
    const series = getCategorySeries(mockData, filtrosSinFiltrar);

    const catA = series.find(s => s.categoria === 'Cat A');

    // Cat A Chile: 300 / 600 = 0.5
    expect(catA?.conversion_chile).toBeCloseTo(0.5, 5);
    
    // Cat A Peru: 120 / 300 = 0.4
    expect(catA?.conversion_peru).toBeCloseTo(0.4, 5);
  });

  it('suma de ventas por categoría = venta total', () => {
    const series = getCategorySeries(mockData, filtrosSinFiltrar);

    const sumaVentaChile = series.reduce((sum, s) => sum + s.venta_chile, 0);
    const sumaVentaPeru = series.reduce((sum, s) => sum + s.venta_peru, 0);

    expect(sumaVentaChile).toBe(500);
    expect(sumaVentaPeru).toBe(200);
  });
});

describe('getTopClients', () => {
  it('retorna Top N clientes ordenados por potencial', () => {
    const top3 = getTopClients(mockData, { ...filtrosSinFiltrar, topN: 3 });

    expect(top3).toHaveLength(3);
    
    // Deberían estar ordenados por ingreso_potencial descendente
    expect(top3[0].ingreso_potencial).toBeGreaterThanOrEqual(top3[1].ingreso_potencial);
    expect(top3[1].ingreso_potencial).toBeGreaterThanOrEqual(top3[2].ingreso_potencial);
    
    // El primero debería ser Cliente 1 con 500
    expect(top3[0].cliente).toBe('Cliente 1');
    expect(top3[0].ingreso_potencial).toBe(500);
  });

  it('calcula conversión de clientes correctamente', () => {
    const topClients = getTopClients(mockData, filtrosSinFiltrar);

    const cliente1 = topClients.find(c => c.cliente === 'Cliente 1');
    
    // Cliente 1: venta 250, potencial 500 → conversión 0.5
    expect(cliente1?.conversion).toBeCloseTo(0.5, 5);
  });

  it('marca todos los clientes retornados como es_top_n', () => {
    const topClients = getTopClients(mockData, { ...filtrosSinFiltrar, topN: 3 });

    topClients.forEach(cliente => {
      expect(cliente.es_top_n).toBe(true);
    });
  });

  it('respeta el filtro de país', () => {
    const topChile = getTopClients(mockData, { ...filtrosChile, topN: 10 });

    topChile.forEach(cliente => {
      expect(cliente.pais).toBe('Chile');
    });
  });
});

describe('getAllCategorias', () => {
  it('retorna todas las categorías únicas', () => {
    const categorias = getAllCategorias(mockData);

    expect(categorias).toHaveLength(2);
    expect(categorias).toContain('Cat A');
    expect(categorias).toContain('Cat B');
  });

  it('retorna categorías ordenadas', () => {
    const categorias = getAllCategorias(mockData);

    // Deberían estar en orden alfabético
    expect(categorias[0]).toBe('Cat A');
    expect(categorias[1]).toBe('Cat B');
  });
});

describe('Consistencia entre selectores', () => {
  it('suma de clientes por país = KPI de país', () => {
    const globalKPIs = getGlobalKPIs(mockData, filtrosSinFiltrar);
    const countryKPIs = getCountryKPIs(mockData, filtrosSinFiltrar);

    const chileKPI = countryKPIs.find(k => k.pais === 'Chile');

    expect(chileKPI?.venta).toBe(globalKPIs.venta_chile);
  });

  it('suma de categorías = venta total', () => {
    const globalKPIs = getGlobalKPIs(mockData, filtrosSinFiltrar);
    const categorySeries = getCategorySeries(mockData, filtrosSinFiltrar);

    const sumaCategoriasChile = categorySeries.reduce((sum, s) => sum + s.venta_chile, 0);
    const sumaCategoriasperu = categorySeries.reduce((sum, s) => sum + s.venta_peru, 0);

    expect(sumaCategoriasChile + sumaCategoriasperu).toBe(globalKPIs.venta_total);
  });
});

