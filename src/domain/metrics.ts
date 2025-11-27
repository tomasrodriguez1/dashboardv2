/**
 * Módulo de métricas y funciones de agregación.
 * 
 * REGLA CRÍTICA: Todas las sumas numéricas en la aplicación DEBEN usar safeSum o sumBy.
 * Prohibido usar .reduce((a, b) => a + b, 0) en lógica de negocio.
 */

// ===========================
// Función de Suma Segura (Kahan Summation)
// ===========================

/**
 * Suma segura usando el algoritmo de Kahan para minimizar errores de punto flotante.
 * Ignora valores null, undefined, NaN y trata no numéricos como 0.
 * 
 * @param values Array de números a sumar
 * @returns Suma total con compensación de error
 */
export function safeSum(values: number[]): number {
  if (!Array.isArray(values) || values.length === 0) {
    return 0;
  }

  let sum = 0;
  let compensation = 0; // Compensación de error acumulada

  for (const value of values) {
    // Ignorar valores inválidos
    if (value == null || !isFinite(value)) {
      continue;
    }

    // Convertir a número si no lo es
    const num = typeof value === 'number' ? value : Number(value);
    
    if (!isFinite(num)) {
      continue;
    }

    // Algoritmo de Kahan
    const y = num - compensation;
    const temp = sum + y;
    compensation = (temp - sum) - y;
    sum = temp;
  }

  return sum;
}

/**
 * Suma segura de un campo específico de un array de objetos.
 * 
 * @param items Array de objetos
 * @param selector Función que extrae el valor numérico de cada objeto
 * @returns Suma total usando safeSum
 */
export function sumBy<T>(items: T[], selector: (item: T) => number): number {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }

  const values = items.map(selector);
  return safeSum(values);
}

// ===========================
// Funciones de cálculo de métricas
// ===========================

/**
 * Calcula el porcentaje de conversión (venta / ingreso potencial).
 * 
 * @param venta Venta realizada
 * @param potencial Ingreso potencial
 * @returns Porcentaje de conversión (0-1)
 */
export function conversion(venta: number, potencial: number): number {
  if (!isFinite(venta) || !isFinite(potencial) || potencial <= 0) {
    return 0;
  }
  return venta / potencial;
}

/**
 * Calcula el porcentaje de participación (parte / total).
 * 
 * @param part Parte individual
 * @param total Total general
 * @returns Porcentaje de participación (0-1)
 */
export function participation(part: number, total: number): number {
  if (!isFinite(part) || !isFinite(total) || total <= 0) {
    return 0;
  }
  return part / total;
}

// ===========================
// Funciones estadísticas
// ===========================

/**
 * Calcula el percentil 75 de un array de valores.
 * 
 * @param values Array de números
 * @returns Valor en el percentil 75
 */
export function percentile75(values: number[]): number {
  if (!Array.isArray(values) || values.length === 0) {
    return 0;
  }

  // Filtrar valores válidos
  const validValues = values.filter(v => isFinite(v));
  
  if (validValues.length === 0) {
    return 0;
  }

  // Ordenar los valores
  const sorted = [...validValues].sort((a, b) => a - b);
  
  // Calcular el índice del percentil 75
  const index = Math.ceil(sorted.length * 0.75) - 1;
  
  return sorted[Math.max(0, index)];
}

/**
 * Obtiene los N elementos con mayor valor según un selector.
 * 
 * @param items Array de objetos
 * @param selector Función que extrae el valor para comparar
 * @param n Número de elementos a retornar
 * @returns Array de los top N elementos
 */
export function topNBy<T>(
  items: T[],
  selector: (item: T) => number,
  n: number
): T[] {
  if (!Array.isArray(items) || items.length === 0 || n <= 0) {
    return [];
  }

  // Crear copias con sus valores
  const itemsWithValues = items.map(item => ({
    item,
    value: selector(item)
  }));

  // Ordenar por valor descendente
  itemsWithValues.sort((a, b) => b.value - a.value);

  // Retornar los top N
  return itemsWithValues.slice(0, n).map(x => x.item);
}

/**
 * Calcula la media aritmética de un array de valores.
 * 
 * @param values Array de números
 * @returns Media aritmética
 */
export function mean(values: number[]): number {
  if (!Array.isArray(values) || values.length === 0) {
    return 0;
  }

  const validValues = values.filter(v => isFinite(v));
  
  if (validValues.length === 0) {
    return 0;
  }

  return safeSum(validValues) / validValues.length;
}

/**
 * Calcula la desviación estándar de un array de valores.
 * 
 * @param values Array de números
 * @returns Desviación estándar
 */
export function stdDev(values: number[]): number {
  if (!Array.isArray(values) || values.length === 0) {
    return 0;
  }

  const validValues = values.filter(v => isFinite(v));
  
  if (validValues.length === 0) {
    return 0;
  }

  const avg = mean(validValues);
  const squaredDiffs = validValues.map(v => Math.pow(v - avg, 2));
  const variance = safeSum(squaredDiffs) / validValues.length;
  
  return Math.sqrt(variance);
}

// ===========================
// Funciones de concentración
// ===========================

/**
 * Calcula el porcentaje de concentración de venta en los Top N clientes.
 * 
 * @param clientes Array de objetos con venta
 * @param ventaSelector Función que extrae la venta de cada cliente
 * @param n Número de clientes top
 * @returns Porcentaje de concentración (0-1)
 */
export function concentracionTopN<T>(
  clientes: T[],
  ventaSelector: (item: T) => number,
  n: number
): number {
  if (!Array.isArray(clientes) || clientes.length === 0) {
    return 0;
  }

  const topClientes = topNBy(clientes, ventaSelector, n);
  const ventaTopN = sumBy(topClientes, ventaSelector);
  const ventaTotal = sumBy(clientes, ventaSelector);

  return participation(ventaTopN, ventaTotal);
}
