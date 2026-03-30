/**
 * Selectores para acciones pendientes por vendedor.
 */

import type {
  AppData,
  Pais,
  VendedorAcciones,
  ClienteEnRiesgo,
  RepuestoProximo,
} from '@domain/types';
import { conversion, percentile75 } from '@domain/metrics';
import type { Filtros } from '@services/selectors';

const UMBRAL_CONVERSION_RIESGO = 0.30;
const DIAS_HORIZONTE_REPUESTOS = 45;

function diasHastaFecha(fechaISO: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(fechaISO);
  fecha.setHours(0, 0, 0, 0);
  return Math.round((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Devuelve acciones pendientes por vendedor:
 * - clientesEnRiesgo: clientes del vendedor con conversión baja y potencial alto
 * - repuestosProximos: mantenciones pendientes en los próximos 45 días de sus clientes
 */
export function getVendedorAcciones(data: AppData, filtros: Filtros): VendedorAcciones[] {
  const clientesFiltrados = filtros.pais === 'Ambos'
    ? data.clientes
    : data.clientes.filter(c => c.pais === filtros.pais);

  // Agrupar clientes por vendedor
  const vendedorMap = new Map<string, typeof clientesFiltrados>();
  clientesFiltrados.forEach(c => {
    if (!vendedorMap.has(c.vendedor)) vendedorMap.set(c.vendedor, []);
    vendedorMap.get(c.vendedor)!.push(c);
  });

  // Calcular P50 de potencial para definir "alto potencial"
  const potenciales = clientesFiltrados.map(c => c.ingreso_potencial);
  const p50 = percentile75(potenciales) * 0.5; // usa la mitad del P75 como proxy del P50

  // Mapa cliente_nombre → vendedor para cruzar con mantenciones
  const clienteAVendedor = new Map<string, string>();
  clientesFiltrados.forEach(c => clienteAVendedor.set(c.cliente.toLowerCase(), c.vendedor));

  // Mantenciones pendientes dentro del horizonte
  const mantencionesProximas = data.mantenciones.filter(m => {
    if (m.estado !== 'pendiente') return false;
    const dias = diasHastaFecha(m.fecha_estimada);
    return dias >= 0 && dias <= DIAS_HORIZONTE_REPUESTOS;
  });

  const resultado: VendedorAcciones[] = [];

  vendedorMap.forEach((clientes, vendedor) => {
    const paisesSet = new Set<Pais>(clientes.map(c => c.pais));

    // Clientes en riesgo
    const clientesEnRiesgo: ClienteEnRiesgo[] = clientes
      .filter(c => {
        const conv = conversion(c.venta, c.ingreso_potencial);
        return conv < UMBRAL_CONVERSION_RIESGO && c.ingreso_potencial >= p50;
      })
      .map(c => ({
        cliente: c.cliente,
        pais: c.pais,
        conversion: conversion(c.venta, c.ingreso_potencial),
        potencial: c.ingreso_potencial,
      }))
      .sort((a, b) => a.conversion - b.conversion);

    // Repuestos próximos: mantenciones de los clientes de este vendedor
    const nombresClientes = new Set(clientes.map(c => c.cliente.toLowerCase()));
    const repuestosProximos: RepuestoProximo[] = mantencionesProximas
      .filter(m => nombresClientes.has(m.cliente_nombre.toLowerCase()))
      .map(m => {
        const dias = diasHastaFecha(m.fecha_estimada);
        return {
          cliente: m.cliente_nombre,
          equipo: m.equipo_modelo,
          repuesto: m.repuesto_nombre,
          fecha: m.fecha_estimada,
          diasRestantes: dias,
          urgente: dias <= 10,
        };
      })
      .sort((a, b) => a.diasRestantes - b.diasRestantes)
      .slice(0, 8); // máximo 8 por vendedor para no saturar la vista

    resultado.push({
      vendedor,
      paises: Array.from(paisesSet),
      clientesEnRiesgo,
      repuestosProximos,
    });
  });

  // Primero los vendedores con más acciones pendientes
  return resultado.sort(
    (a, b) =>
      (b.clientesEnRiesgo.length + b.repuestosProximos.length) -
      (a.clientesEnRiesgo.length + a.repuestosProximos.length)
  );
}
