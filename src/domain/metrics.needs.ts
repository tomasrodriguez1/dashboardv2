/**
 * Módulo de métricas para necesidades de repuestos.
 * 
 * REGLA CRÍTICA: Todas las sumas numéricas DEBEN usar safeSum o sumBy.
 */

import { sumBy } from './metrics';
import type { MantencionRow } from './types';

// ===========================
// Tipos para necesidades
// ===========================

export type AlertLevel = 'OK' | 'AMARILLO' | 'ROJO' | 'COMPLETADA';

export interface ClienteNeedsGroup {
  cliente_id: string;
  cliente_nombre: string;
  total_repuestos: number;
  equipos: EquipoNeedsGroup[];
}

export interface EquipoNeedsGroup {
  equipo_id: string;
  equipo_modelo: string;
  total_repuestos: number;
  mantenciones: MantencionNeedsGroup[];
}

export interface MantencionNeedsGroup {
  mantencion_horas: number;
  fecha_estimada: string;
  tipo: string;
  total_repuestos: number;
  estado: 'pendiente' | 'completada';
  repuestos: MantencionRow[];
}

// ===========================
// Funciones de filtrado temporal
// ===========================

/**
 * Cuenta repuestos en un rango de fechas.
 * 
 * @param items Array de mantenciones
 * @param start Fecha inicio ISO (YYYY-MM-DD)
 * @param end Fecha fin ISO (YYYY-MM-DD)
 * @returns Cantidad total de repuestos usando sumBy
 */
export function countUpcomingByPeriod(
  items: MantencionRow[],
  start: string,
  end: string
): number {
  const filtered = items.filter(item => {
    return item.fecha_estimada >= start && item.fecha_estimada <= end;
  });
  
  return sumBy(filtered, item => item.cantidad);
}

/**
 * Filtra mantenciones por rango de fechas.
 * 
 * @param items Array de mantenciones
 * @param start Fecha inicio ISO
 * @param end Fecha fin ISO
 * @returns Array filtrado
 */
export function filterByDateRange(
  items: MantencionRow[],
  start: string,
  end: string
): MantencionRow[] {
  return items.filter(item => {
    return item.fecha_estimada >= start && item.fecha_estimada <= end;
  });
}

// ===========================
// Funciones de agrupación
// ===========================

/**
 * Agrupa necesidades por cliente.
 * 
 * @param items Array de mantenciones
 * @returns Array de grupos por cliente
 */
export function groupNeedsByClient(items: MantencionRow[]): ClienteNeedsGroup[] {
  const clientesMap = new Map<string, MantencionRow[]>();
  
  items.forEach(item => {
    const key = item.cliente_id;
    if (!clientesMap.has(key)) {
      clientesMap.set(key, []);
    }
    clientesMap.get(key)!.push(item);
  });
  
  const result: ClienteNeedsGroup[] = [];
  
  clientesMap.forEach((mantenciones, cliente_id) => {
    const equipos = groupNeedsByEquipment(mantenciones);
    const total_repuestos = sumBy(mantenciones, m => m.cantidad);
    
    result.push({
      cliente_id,
      cliente_nombre: mantenciones[0].cliente_nombre,
      total_repuestos,
      equipos,
    });
  });
  
  // Ordenar por total de repuestos descendente
  return result.sort((a, b) => b.total_repuestos - a.total_repuestos);
}

/**
 * Agrupa necesidades por cliente y equipo (jerarquía completa).
 * 
 * @param items Array de mantenciones
 * @returns Array de grupos jerárquicos
 */
export function groupNeedsByClientAndEquipment(
  items: MantencionRow[]
): ClienteNeedsGroup[] {
  return groupNeedsByClient(items);
}

/**
 * Agrupa necesidades por equipo (auxiliar).
 * 
 * @param items Array de mantenciones de un mismo cliente
 * @returns Array de grupos por equipo
 */
function groupNeedsByEquipment(items: MantencionRow[]): EquipoNeedsGroup[] {
  const equiposMap = new Map<string, MantencionRow[]>();
  
  items.forEach(item => {
    const key = item.equipo_id;
    if (!equiposMap.has(key)) {
      equiposMap.set(key, []);
    }
    equiposMap.get(key)!.push(item);
  });
  
  const result: EquipoNeedsGroup[] = [];
  
  equiposMap.forEach((mantenciones, equipo_id) => {
    const total_repuestos = sumBy(mantenciones, m => m.cantidad);
    const mantencionesAgrupadas = groupNeedsByMantencion(mantenciones);
    
    result.push({
      equipo_id,
      equipo_modelo: mantenciones[0].equipo_modelo,
      total_repuestos,
      mantenciones: mantencionesAgrupadas,
    });
  });
  
  // Ordenar por total de repuestos descendente
  return result.sort((a, b) => b.total_repuestos - a.total_repuestos);
}

/**
 * Agrupa necesidades por mantención (horas de mantención + fecha + tipo).
 * Cada mantención individual se muestra por separado, incluso si tienen las mismas horas.
 * 
 * @param items Array de mantenciones de un mismo equipo
 * @returns Array de grupos por mantención
 */
function groupNeedsByMantencion(items: MantencionRow[]): MantencionNeedsGroup[] {
  const mantencionesMap = new Map<string, MantencionRow[]>();
  
  items.forEach(item => {
    // Crear una clave única por mantención individual: horas + fecha + tipo
    const key = `${item.mantencion_horas}_${item.fecha_estimada}_${item.tipo}`;
    if (!mantencionesMap.has(key)) {
      mantencionesMap.set(key, []);
    }
    mantencionesMap.get(key)!.push(item);
  });
  
  const result: MantencionNeedsGroup[] = [];
  
  mantencionesMap.forEach((repuestos) => {
    const total_repuestos = sumBy(repuestos, r => r.cantidad);
    
    result.push({
      mantencion_horas: repuestos[0].mantencion_horas,
      fecha_estimada: repuestos[0].fecha_estimada,
      tipo: repuestos[0].tipo,
      total_repuestos,
      estado: repuestos[0].estado ?? 'pendiente',
      repuestos: repuestos.sort((a, b) => a.repuesto_nombre.localeCompare(b.repuesto_nombre)),
    });
  });
  
  // Ordenar por horas de mantención ascendente (progresión natural del plan)
  return result.sort((a, b) => a.mantencion_horas - b.mantencion_horas);
}

// ===========================
// Funciones de alerta
// ===========================

/**
 * Determina el nivel de alerta según días restantes.
 * 
 * @param fechaEstimada Fecha estimada ISO (YYYY-MM-DD)
 * @param hoy Fecha actual ISO (YYYY-MM-DD)
 * @param umbralDias Umbral de días para alerta (default: 30)
 * @returns Nivel de alerta: 'OK', 'AMARILLO', o 'ROJO'
 */
export function leadTimeAlert(
  fechaEstimada: string,
  hoy: string,
  umbralDias: number = 30
): AlertLevel {
  const fechaEst = new Date(fechaEstimada);
  const fechaHoy = new Date(hoy);
  
  // Calcular diferencia en días
  const diffMs = fechaEst.getTime() - fechaHoy.getTime();
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDias < 0) {
    // Fecha pasada
    return 'ROJO';
  } else if (diffDias <= umbralDias / 3) {
    // Menos de 10 días (si umbral es 30)
    return 'ROJO';
  } else if (diffDias <= umbralDias) {
    // Entre 10 y 30 días
    return 'AMARILLO';
  } else {
    // Más de 30 días
    return 'OK';
  }
}

/**
 * Calcula días restantes hasta una fecha.
 * 
 * @param fechaEstimada Fecha estimada ISO
 * @param hoy Fecha actual ISO
 * @returns Días restantes (puede ser negativo si ya pasó)
 */
export function diasRestantes(fechaEstimada: string, hoy: string): number {
  const fechaEst = new Date(fechaEstimada);
  const fechaHoy = new Date(hoy);
  
  const diffMs = fechaEst.getTime() - fechaHoy.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// ===========================
// Funciones estadísticas
// ===========================

/**
 * Calcula el porcentaje de mantenciones en alerta.
 * 
 * @param items Array de mantenciones
 * @param hoy Fecha actual ISO
 * @param umbralDias Umbral para alerta
 * @returns Porcentaje (0-1)
 */
export function porcentajeEnAlerta(
  items: MantencionRow[],
  hoy: string,
  umbralDias: number = 30
): number {
  if (items.length === 0) {
    return 0;
  }
  
  const enAlerta = items.filter(item => {
    const nivel = leadTimeAlert(item.fecha_estimada, hoy, umbralDias);
    return nivel === 'AMARILLO' || nivel === 'ROJO';
  });
  
  return enAlerta.length / items.length;
}

/**
 * Obtiene lista única de clientes.
 * 
 * @param items Array de mantenciones
 * @returns Array de IDs de cliente únicos, ordenados
 */
export function getUniqueClientes(items: MantencionRow[]): string[] {
  const clientesSet = new Set(items.map(item => item.cliente_id));
  return Array.from(clientesSet).sort();
}

/**
 * Obtiene lista única de equipos (opcionalmente filtrada por cliente).
 * 
 * @param items Array de mantenciones
 * @param clienteId Opcional: filtrar por cliente
 * @returns Array de IDs de equipo únicos, ordenados
 */
export function getUniqueEquipos(
  items: MantencionRow[],
  clienteId?: string
): string[] {
  let filtered = items;
  
  if (clienteId && clienteId !== 'Todos') {
    filtered = items.filter(item => item.cliente_id === clienteId);
  }
  
  const equiposSet = new Set(filtered.map(item => item.equipo_id));
  return Array.from(equiposSet).sort();
}

