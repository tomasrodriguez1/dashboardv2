/**
 * Utilidades para parsear y formatear números, porcentajes y monedas.
 */

// ===========================
// Funciones de parseo
// ===========================

/**
 * Parsea un número en formato de locale (con puntos como separadores de miles).
 * Ejemplos: "13.654.935" → 13654935, "2.434.069" → 2434069
 * 
 * @param input String con formato de número con separadores
 * @returns Número parseado
 */
export function parseLocaleNumber(input: string | number): number {
  if (typeof input === 'number') {
    return isFinite(input) ? input : 0;
  }

  if (typeof input !== 'string') {
    return 0;
  }

  // Eliminar espacios
  let cleaned = input.trim();

  // Si está vacío, retornar 0
  if (cleaned === '' || cleaned === '-') {
    return 0;
  }

  // Eliminar puntos (separadores de miles)
  cleaned = cleaned.replace(/\./g, '');

  // Reemplazar coma por punto (separador decimal)
  cleaned = cleaned.replace(/,/g, '.');

  // Eliminar cualquier carácter que no sea número, punto o signo negativo
  cleaned = cleaned.replace(/[^\d.-]/g, '');

  const parsed = parseFloat(cleaned);

  return isFinite(parsed) ? parsed : 0;
}

/**
 * Parsea un porcentaje en formato "18%" a número decimal (0.18).
 * 
 * @param input String con formato de porcentaje
 * @returns Número decimal (0-1)
 */
export function parsePercent(input: string | number): number {
  if (typeof input === 'number') {
    return isFinite(input) ? input : 0;
  }

  if (typeof input !== 'string') {
    return 0;
  }

  // Eliminar el símbolo de porcentaje
  const cleaned = input.replace('%', '').trim();

  // Parsear como número
  const num = parseLocaleNumber(cleaned);

  // Convertir a decimal (dividir entre 100)
  return num / 100;
}

// ===========================
// Funciones de formateo
// ===========================

/**
 * Formatea un número con separadores de miles.
 * Ejemplo: 13654935 → "13.654.935"
 * 
 * @param value Número a formatear
 * @param decimals Número de decimales (default: 0)
 * @returns String formateado
 */
export function formatNumber(value: number, decimals: number = 0): string {
  if (!isFinite(value)) {
    return '0';
  }

  return value.toLocaleString('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formatea un número como porcentaje.
 * Ejemplo: 0.18 → "18%", 0.3756 → "37.56%"
 * 
 * @param value Número decimal (0-1)
 * @param decimals Número de decimales (default: 0)
 * @returns String formateado como porcentaje
 */
export function formatPercent(value: number, decimals: number = 0): string {
  if (!isFinite(value)) {
    return '0%';
  }

  const percentage = value * 100;

  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Formatea un número como moneda (sin símbolo de moneda).
 * Ejemplo: 13654935 → "13.654.935"
 * 
 * @param value Número a formatear
 * @returns String formateado como moneda
 */
export function formatCurrency(value: number): string {
  return formatNumber(value, 0);
}

/**
 * Formatea un número de manera compacta (K, M, B).
 * Ejemplo: 1500000 → "1.5M", 2500 → "2.5K"
 * 
 * @param value Número a formatear
 * @returns String formateado de manera compacta
 */
export function formatCompact(value: number): string {
  if (!isFinite(value)) {
    return '0';
  }

  const absValue = Math.abs(value);

  if (absValue >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (absValue >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (absValue >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return value.toFixed(0);
}

/**
 * Formatea un número en millones con formato USD.
 * Ejemplo: 21700000 → "21,7 MM USD"
 * 
 * @param value Número a formatear
 * @returns String formateado en millones USD
 */
export function formatMillions(value: number): string {
  if (!isFinite(value)) {
    return '0 MM USD';
  }

  const millions = value / 1_000_000;
  
  // Usar coma como separador decimal
  const formatted = millions.toLocaleString('es-CL', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return `${formatted} MM USD`;
}

/**
 * Formatea un valor de conversión con color semántico.
 * 
 * @param conversion Valor de conversión (0-1)
 * @returns Objeto con valor formateado y clase de color
 */
export function formatConversionWithColor(conversion: number): {
  formatted: string;
  colorClass: string;
} {
  const formatted = formatPercent(conversion, 0);

  let colorClass = 'text-gray-600';

  if (conversion >= 0.4) {
    colorClass = 'text-green-600';
  } else if (conversion >= 0.3) {
    colorClass = 'text-yellow-600';
  } else {
    colorClass = 'text-red-600';
  }

  return { formatted, colorClass };
}

/**
 * Trunca un texto largo y añade "..." al final.
 * 
 * @param text Texto a truncar
 * @param maxLength Longitud máxima
 * @returns Texto truncado
 */
export function truncateText(text: string, maxLength: number = 30): string {
  if (!text || text.length <= maxLength) {
    return text;
  }

  return `${text.substring(0, maxLength)}...`;
}
