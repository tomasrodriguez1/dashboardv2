/**
 * Selectores para necesidades de repuestos.
 * 
 * REGLA CRÍTICA: Todos los cálculos usan EXCLUSIVAMENTE safeSum/sumBy.
 */

import type { AppData, MantencionRow } from '@domain/types';
import { sumBy } from '@domain/metrics';
import {
  filterByDateRange,
  countUpcomingByPeriod,
  groupNeedsByClientAndEquipment,
  porcentajeEnAlerta,
  getUniqueClientes,
  getUniqueEquipos,
  type ClienteNeedsGroup,
} from '@domain/metrics.needs';

// ===========================
// Tipos de filtros extendidos
// ===========================

export interface NeedsFiltros {
  pais: 'Ambos' | 'Chile' | 'Peru';
  cliente: string | 'Todos';
  equipo: string | 'Todos';
  repuesto: string | 'Todos';
  horizonte: '30d' | '90d' | '180d';
}

export interface NeedsKPIs {
  total_30d: number;
  total_90d: number;
  total_180d: number;
  porcentaje_alerta: number;
  total_clientes: number;
  total_equipos: number;
}

export interface SparePartSeries {
  periodo: string; // Semana o mes
  cantidad: number;
}

// ===========================
// Funciones auxiliares
// ===========================

/**
 * Calcula la fecha de fin según el horizonte.
 */
function calcularFechaFin(hoy: string, horizonte: '30d' | '90d' | '180d'): string {
  const fecha = new Date(hoy);
  
  switch (horizonte) {
    case '30d':
      fecha.setDate(fecha.getDate() + 30);
      break;
    case '90d':
      fecha.setDate(fecha.getDate() + 90);
      break;
    case '180d':
      fecha.setDate(fecha.getDate() + 180);
      break;
  }
  
  return fecha.toISOString().split('T')[0];
}

/**
 * Aplica filtros a mantenciones.
 */
function aplicarFiltros(
  mantenciones: MantencionRow[],
  filtros: NeedsFiltros
): MantencionRow[] {
  let resultado = mantenciones;
  
  // Filtrar por rango de horas de mantención (500-3500 horas)
  resultado = resultado.filter(m => m.mantencion_horas >= 500 && m.mantencion_horas <= 3500);
  
  // Filtrar por cliente
  if (filtros.cliente && filtros.cliente !== 'Todos') {
    resultado = resultado.filter(m => m.cliente_id === filtros.cliente);
  }
  
  // Filtrar por equipo
  if (filtros.equipo && filtros.equipo !== 'Todos') {
    resultado = resultado.filter(m => m.equipo_id === filtros.equipo);
  }
  
  // Filtrar por repuesto
  if (filtros.repuesto && filtros.repuesto !== 'Todos') {
    resultado = resultado.filter(m => m.repuesto_nombre === filtros.repuesto);
  }
  
  return resultado;
}

// ===========================
// Selectores principales
// ===========================

/**
 * Obtiene necesidades próximas en el horizonte temporal.
 * Para el rango de horas 500-3500, se muestran TODAS las fechas futuras.
 */
export function getUpcomingNeeds(
  data: AppData,
  filtros: NeedsFiltros
): MantencionRow[] {
  const hoy = new Date().toISOString().split('T')[0];
  
  // Aplicar filtros (incluye filtro de horas 500-3500)
  const filtradas = aplicarFiltros(data.mantenciones, filtros);
  
  // Filtrar solo por fecha de inicio (desde hoy en adelante)
  // NO aplicamos límite de fecha final para mostrar todas las mantenciones futuras
  return filtradas.filter(m => m.fecha_estimada >= hoy);
}

/**
 * Obtiene estructura jerárquica cliente → equipo → repuestos.
 */
export function getClientEquipmentNeeds(
  data: AppData,
  filtros: NeedsFiltros
): ClienteNeedsGroup[] {
  const needs = aplicarFiltros(data.mantenciones, filtros);
  return groupNeedsByClientAndEquipment(needs);
}

/**
 * Obtiene serie temporal para gráfico (por semana).
 * Agrupa todas las mantenciones futuras por semana.
 */
export function getSparePartsCalendarSeries(
  data: AppData,
  filtros: NeedsFiltros
): SparePartSeries[] {
  const needs = getUpcomingNeeds(data, filtros);
  
  if (needs.length === 0) {
    return [];
  }
  
  // Agrupar por semana
  const weekMap = new Map<string, MantencionRow[]>();
  
  needs.forEach(item => {
    const fecha = new Date(item.fecha_estimada);
    
    // Calcular inicio de la semana (lunes)
    const day = fecha.getDay();
    const diff = fecha.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(fecha.setDate(diff));
    
    const weekKey = monday.toISOString().split('T')[0];
    
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, []);
    }
    weekMap.get(weekKey)!.push(item);
  });
  
  // Convertir a array y ordenar
  const series: SparePartSeries[] = [];
  
  weekMap.forEach((items, weekKey) => {
    const cantidad = sumBy(items, item => item.cantidad);
    series.push({
      periodo: weekKey,
      cantidad,
    });
  });
  
  return series.sort((a, b) => a.periodo.localeCompare(b.periodo));
}

/**
 * Calcula KPIs de necesidades.
 */
export function getNeedsKPIs(
  data: AppData,
  filtros: NeedsFiltros
): NeedsKPIs {
  const hoy = new Date().toISOString().split('T')[0];
  
  // Aplicar filtros de cliente/equipo
  const filtradas = aplicarFiltros(data.mantenciones, filtros);
  
  // Calcular totales por periodo
  const fecha30 = calcularFechaFin(hoy, '30d');
  const fecha90 = calcularFechaFin(hoy, '90d');
  const fecha180 = calcularFechaFin(hoy, '180d');
  
  const total_30d = countUpcomingByPeriod(filtradas, hoy, fecha30);
  const total_90d = countUpcomingByPeriod(filtradas, hoy, fecha90);
  const total_180d = countUpcomingByPeriod(filtradas, hoy, fecha180);
  
  // Porcentaje en alerta (para el horizonte seleccionado)
  const fechaFin = calcularFechaFin(hoy, filtros.horizonte);
  const needsHorizonte = filterByDateRange(filtradas, hoy, fechaFin);
  const porcentaje_alerta = porcentajeEnAlerta(needsHorizonte, hoy);
  
  // Totales únicos
  const total_clientes = getUniqueClientes(filtradas).length;
  const total_equipos = getUniqueEquipos(filtradas).length;
  
  return {
    total_30d,
    total_90d,
    total_180d,
    porcentaje_alerta,
    total_clientes,
    total_equipos,
  };
}

/**
 * Obtiene lista de clientes disponibles.
 */
export function getAvailableClientes(data: AppData): Array<{ id: string; nombre: string }> {
  const clientesMap = new Map<string, string>();
  
  data.mantenciones.forEach(m => {
    if (!clientesMap.has(m.cliente_id)) {
      clientesMap.set(m.cliente_id, m.cliente_nombre);
    }
  });
  
  const result: Array<{ id: string; nombre: string }> = [];
  clientesMap.forEach((nombre, id) => {
    result.push({ id, nombre });
  });
  
  return result.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Obtiene lista de equipos disponibles (filtrado por cliente si aplica).
 */
export function getAvailableEquipos(
  data: AppData,
  clienteId?: string
): Array<{ id: string; modelo: string }> {
  let mantenciones = data.mantenciones;
  
  if (clienteId && clienteId !== 'Todos') {
    mantenciones = mantenciones.filter(m => m.cliente_id === clienteId);
  }
  
  const equiposMap = new Map<string, string>();
  
  mantenciones.forEach(m => {
    if (!equiposMap.has(m.equipo_id)) {
      equiposMap.set(m.equipo_id, m.equipo_modelo);
    }
  });
  
  const result: Array<{ id: string; modelo: string }> = [];
  equiposMap.forEach((modelo, id) => {
    result.push({ id, modelo });
  });
  
  return result.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Obtiene lista de repuestos disponibles (filtrado por cliente y equipo si aplica).
 */
export function getAvailableRepuestos(
  data: AppData,
  clienteId?: string,
  equipoId?: string
): Array<{ nombre: string; codigo: string }> {
  let mantenciones = data.mantenciones;
  
  if (clienteId && clienteId !== 'Todos') {
    mantenciones = mantenciones.filter(m => m.cliente_id === clienteId);
  }
  
  if (equipoId && equipoId !== 'Todos') {
    mantenciones = mantenciones.filter(m => m.equipo_id === equipoId);
  }
  
  const repuestosMap = new Map<string, string>();
  
  mantenciones.forEach(m => {
    if (!repuestosMap.has(m.repuesto_nombre)) {
      repuestosMap.set(m.repuesto_nombre, m.repuesto_codigo);
    }
  });
  
  const result: Array<{ nombre: string; codigo: string }> = [];
  repuestosMap.forEach((codigo, nombre) => {
    result.push({ nombre, codigo });
  });
  
  return result.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

