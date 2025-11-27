/**
 * Selectores que aplican filtros y calculan métricas.
 * 
 * REGLA CRÍTICA: Todos los cálculos usan EXCLUSIVAMENTE safeSum/sumBy.
 * No hay .reduce((a, b) => a + b, 0) en este módulo.
 */

import type {
  AppData,
  GlobalKPIs,
  PaisKPIs,
  CategoriaKPIs,
  ClienteKPIs,
  CountryMixData,
  CategoryBarData,
  ClientScatterPoint,
  Pais,
  CategoriaPaisRow,
  VendedorKPIs,
  ClienteRowNormalizado,
} from '@domain/types';
import {
  sumBy,
  conversion,
  participation,
  percentile75,
  topNBy,
} from '@domain/metrics';

// ===========================
// Tipos de filtros
// ===========================

export interface Filtros {
  pais: 'Ambos' | 'Chile' | 'Peru';
  categorias: string[]; // Array vacío = todas
  topN: number;
}

// ===========================
// Funciones de filtrado
// ===========================

function filtrarPorPais<T extends { pais: Pais }>(
  items: T[],
  filtro: 'Ambos' | 'Chile' | 'Peru'
): T[] {
  if (filtro === 'Ambos') {
    return items;
  }
  return items.filter(item => item.pais === filtro);
}

function filtrarPorCategorias(
  items: CategoriaPaisRow[],
  categorias: string[]
): CategoriaPaisRow[] {
  if (categorias.length === 0) {
    return items;
  }
  return items.filter(item => categorias.includes(item.categoria));
}

// ===========================
// Selectores de KPIs globales
// ===========================

/**
 * Calcula KPIs globales aplicando filtros.
 */
export function getGlobalKPIs(data: AppData, filtros: Filtros): GlobalKPIs {
  // Filtrar categorías
  const categoriasFiltradas = filtrarPorCategorias(
    data.categorias,
    filtros.categorias
  );

  // Aplicar filtro de país a las categorías
  const categoriasFiltradasPorPais = filtrarPorPais(categoriasFiltradas, filtros.pais);

  // Calcular totales usando sumBy desde categorías (que tienen toda la info)
  const venta_total = sumBy(categoriasFiltradasPorPais, c => c.venta);
  const ingreso_potencial_total = sumBy(categoriasFiltradasPorPais, c => c.ingreso_potencial);

  // Calcular por país desde categorías
  const categoriasChile = categoriasFiltradasPorPais.filter(c => c.pais === 'Chile');
  const categoriasPeru = categoriasFiltradasPorPais.filter(c => c.pais === 'Peru');

  const venta_chile = sumBy(categoriasChile, c => c.venta);
  const venta_peru = sumBy(categoriasPeru, c => c.venta);

  const potencial_chile = sumBy(categoriasChile, c => c.ingreso_potencial);
  const potencial_peru = sumBy(categoriasPeru, c => c.ingreso_potencial);

  return {
    venta_total,
    ingreso_potencial_total,
    conversion: conversion(venta_total, ingreso_potencial_total),
    venta_chile,
    venta_peru,
    conversion_chile: conversion(venta_chile, potencial_chile),
    conversion_peru: conversion(venta_peru, potencial_peru),
  };
}

/**
 * Calcula KPIs por país.
 */
export function getCountryKPIs(data: AppData, filtros: Filtros): PaisKPIs[] {
  // Filtrar categorías
  const categoriasFiltradas = filtrarPorCategorias(
    data.categorias,
    filtros.categorias
  );

  // Aplicar filtro de país
  const categoriasFiltradasPorPais = filtrarPorPais(categoriasFiltradas, filtros.pais);

  const paises: Pais[] = filtros.pais === 'Ambos' 
    ? ['Chile', 'Peru'] 
    : [filtros.pais];

  const venta_total = sumBy(categoriasFiltradasPorPais, c => c.venta);

  return paises.map(pais => {
    const categoriasPais = categoriasFiltradasPorPais.filter(c => c.pais === pais);
    const venta = sumBy(categoriasPais, c => c.venta);
    const ingreso_potencial = sumBy(categoriasPais, c => c.ingreso_potencial);

    return {
      pais,
      venta,
      ingreso_potencial,
      conversion: conversion(venta, ingreso_potencial),
      participacion_venta: participation(venta, venta_total),
    };
  });
}

// ===========================
// Selectores para gráficos
// ===========================

/**
 * Obtiene datos para el gráfico de mix por país (donut/pie).
 */
export function getCountryMixData(data: AppData, filtros: Filtros): CountryMixData[] {
  const paisKPIs = getCountryKPIs(data, filtros);

  return paisKPIs.map(p => ({
    name: p.pais,
    value: p.venta,
    percentage: p.participacion_venta,
  }));
}

/**
 * Obtiene datos para el gráfico de barras por categoría.
 */
export function getCategorySeries(
  data: AppData,
  filtros: Filtros
): CategoryBarData[] {
  const categoriasFiltradas = filtrarPorCategorias(
    data.categorias,
    filtros.categorias
  );

  // Agrupar por categoría
  const categorias = Array.from(
    new Set(categoriasFiltradas.map(c => c.categoria))
  );

  return categorias.map(categoria => {
    const catChile = categoriasFiltradas.filter(
      c => c.categoria === categoria && c.pais === 'Chile'
    );
    const catPeru = categoriasFiltradas.filter(
      c => c.categoria === categoria && c.pais === 'Peru'
    );

    const venta_chile = sumBy(catChile, c => c.venta);
    const venta_peru = sumBy(catPeru, c => c.venta);

    const potencial_chile = sumBy(catChile, c => c.ingreso_potencial);
    const potencial_peru = sumBy(catPeru, c => c.ingreso_potencial);

    return {
      categoria,
      venta_chile,
      venta_peru,
      conversion_chile: conversion(venta_chile, potencial_chile),
      conversion_peru: conversion(venta_peru, potencial_peru),
    };
  });
}

/**
 * Obtiene KPIs por categoría.
 */
export function getCategoryKPIs(data: AppData, filtros: Filtros): CategoriaKPIs[] {
  const categoriasFiltradas = filtrarPorCategorias(
    data.categorias,
    filtros.categorias
  );

  const clientesFiltrados = filtrarPorPais(data.clientes, filtros.pais);
  const venta_total = sumBy(clientesFiltrados, c => c.venta);

  // Agrupar por categoría
  const categorias = Array.from(
    new Set(categoriasFiltradas.map(c => c.categoria))
  );

  return categorias.map(categoria => {
    const catItems = categoriasFiltradas.filter(c => c.categoria === categoria);

    const venta = sumBy(catItems, c => c.venta);
    const ingreso_potencial = sumBy(catItems, c => c.ingreso_potencial);

    const catChile = catItems.filter(c => c.pais === 'Chile');
    const catPeru = catItems.filter(c => c.pais === 'Peru');

    const venta_chile = sumBy(catChile, c => c.venta);
    const venta_peru = sumBy(catPeru, c => c.venta);

    const potencial_chile = sumBy(catChile, c => c.ingreso_potencial);
    const potencial_peru = sumBy(catPeru, c => c.ingreso_potencial);

    return {
      categoria,
      venta,
      ingreso_potencial,
      conversion: conversion(venta, ingreso_potencial),
      participacion_venta: participation(venta, venta_total),
      venta_chile,
      venta_peru,
      conversion_chile: conversion(venta_chile, potencial_chile),
      conversion_peru: conversion(venta_peru, potencial_peru),
    };
  });
}

/**
 * Obtiene datos para el scatter de clientes.
 */
export function getClientScatterData(
  data: AppData,
  filtros: Filtros
): ClientScatterPoint[] {
  const clientesFiltrados = filtrarPorPais(data.clientes, filtros.pais);

  // Obtener top N clientes
  const topClientes = topNBy(
    clientesFiltrados,
    c => c.ingreso_potencial,
    filtros.topN
  );

  const topClientesSet = new Set(topClientes.map(c => c.cliente));

  return clientesFiltrados.map(cliente => ({
    cliente: cliente.cliente,
    pais: cliente.pais,
    x: cliente.ingreso_potencial,
    y: cliente.venta,
    conversion: conversion(cliente.venta, cliente.ingreso_potencial),
    es_top_n: topClientesSet.has(cliente.cliente),
  }));
}

/**
 * Obtiene los Top N clientes con KPIs completos.
 */
export function getTopClients(data: AppData, filtros: Filtros): ClienteKPIs[] {
  const clientesFiltrados = filtrarPorPais(data.clientes, filtros.pais);

  // Obtener top N por potencial
  const topClientes = topNBy(
    clientesFiltrados,
    c => c.ingreso_potencial,
    filtros.topN
  );

  // Calcular totales por país para participación
  const totalesPorPais: Record<Pais, number> = {
    Chile: sumBy(
      clientesFiltrados.filter(c => c.pais === 'Chile'),
      c => c.venta
    ),
    Peru: sumBy(
      clientesFiltrados.filter(c => c.pais === 'Peru'),
      c => c.venta
    ),
  };

  return topClientes.map(cliente => ({
    pais: cliente.pais,
    cliente: cliente.cliente,
    ingreso_potencial: cliente.ingreso_potencial,
    venta: cliente.venta,
    conversion: conversion(cliente.venta, cliente.ingreso_potencial),
    participacion_venta: participation(cliente.venta, totalesPorPais[cliente.pais]),
    es_top_n: true,
  }));
}

/**
 * Obtiene el percentil 75 de ingreso potencial de clientes filtrados.
 */
export function getP75Potencial(data: AppData, filtros: Filtros): number {
  const clientesFiltrados = filtrarPorPais(data.clientes, filtros.pais);
  const potenciales = clientesFiltrados.map(c => c.ingreso_potencial);
  return percentile75(potenciales);
}

/**
 * Obtiene todas las categorías únicas disponibles.
 */
export function getAllCategorias(data: AppData): string[] {
  const categorias = Array.from(
    new Set(data.categorias.map(c => c.categoria))
  );
  return categorias.sort();
}

// ===========================
// Selectores para Vendedores
// ===========================

/**
 * Obtiene KPIs por vendedor aplicando filtros.
 */
export function getVendedoresKPIs(data: AppData, filtros: Filtros): VendedorKPIs[] {
  // Filtrar clientes por país
  const clientesFiltrados = filtrarPorPais(data.clientes, filtros.pais);

  // Agrupar por vendedor
  const vendedoresMap = new Map<string, ClienteRowNormalizado[]>();
  
  clientesFiltrados.forEach(cliente => {
    const vendedor = cliente.vendedor;
    if (!vendedoresMap.has(vendedor)) {
      vendedoresMap.set(vendedor, []);
    }
    vendedoresMap.get(vendedor)!.push(cliente);
  });

  // Calcular KPIs por cada vendedor
  const vendedoresKPIs: VendedorKPIs[] = [];

  vendedoresMap.forEach((clientes, vendedor) => {
    const venta = sumBy(clientes, c => c.venta);
    const ingreso_potencial = sumBy(clientes, c => c.ingreso_potencial);
    
    // Obtener países únicos donde opera el vendedor
    const paisesSet = new Set<Pais>(clientes.map(c => c.pais));
    const paises = Array.from(paisesSet);

    vendedoresKPIs.push({
      vendedor,
      paises,
      ingreso_potencial,
      venta,
      conversion: conversion(venta, ingreso_potencial),
      cantidad_clientes: clientes.length,
      clientes: clientes.map(c => c.cliente),
    });
  });

  // Ordenar por venta descendente
  return vendedoresKPIs.sort((a, b) => b.venta - a.venta);
}

/**
 * Obtiene los Top N vendedores por venta.
 */
export function getTopVendedores(data: AppData, filtros: Filtros, n: number = 10): VendedorKPIs[] {
  const vendedores = getVendedoresKPIs(data, filtros);
  return vendedores.slice(0, n);
}

/**
 * Obtiene vendedores con baja conversión y alto potencial.
 */
export function getVendedoresBajaConversion(
  data: AppData,
  filtros: Filtros,
  umbralConversion: number = 0.30
): VendedorKPIs[] {
  const vendedores = getVendedoresKPIs(data, filtros);
  
  // Calcular percentil 75 del potencial
  const potenciales = vendedores.map(v => v.ingreso_potencial);
  const p75 = percentile75(potenciales);

  // Filtrar vendedores con baja conversión y alto potencial
  return vendedores
    .filter(v => v.conversion < umbralConversion && v.ingreso_potencial >= p75)
    .sort((a, b) => a.conversion - b.conversion); // Ordenar por conversión ascendente
}
