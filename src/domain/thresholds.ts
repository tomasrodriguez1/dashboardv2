/**
 * Configuración de umbrales y reglas de alertas.
 * 
 * Estos valores determinan cuándo se activan las alertas de formato condicional.
 */

// ===========================
// Umbrales de conversión
// ===========================

/**
 * Umbral de conversión baja para categorías.
 * Si una categoría tiene conversión < 30% y alto potencial (>= p75), se marca en rojo.
 */
export const UMBRAL_CONV_BAJA_CATEGORIA = 0.30;

/**
 * Umbral de conversión baja para clientes.
 * Si un cliente Top N tiene conversión < 35%, se marca en rojo.
 */
export const UMBRAL_CONV_BAJA_CLIENTE = 0.35;

/**
 * Umbral de conversión aceptable para países.
 * Si un país tiene conversión < 30%, se considera bajo.
 */
export const UMBRAL_CONV_BAJA_PAIS = 0.30;

// ===========================
// Umbrales de concentración
// ===========================

/**
 * Umbral de concentración de venta crítico (rojo).
 * Si una categoría o grupo de clientes representa > 30% de la venta, es riesgo alto.
 */
export const UMBRAL_CONCENTRACION_ROJO = 0.30;

/**
 * Umbral de concentración de venta moderado (amarillo).
 * Si una categoría o grupo representa > 25% pero <= 30%, es riesgo moderado.
 */
export const UMBRAL_CONCENTRACION_AMARILLO = 0.25;

// ===========================
// Percentiles
// ===========================

/**
 * Percentil usado para determinar "alto potencial".
 * Un ingreso potencial >= p75 se considera alto.
 */
export const PERCENTIL_ALTO_POTENCIAL = 75;

// ===========================
// Top N clientes
// ===========================

/**
 * Número por defecto de clientes top a mostrar.
 */
export const DEFAULT_TOP_N_CLIENTES = 10;

/**
 * Opciones disponibles para Top N clientes.
 */
export const TOP_N_OPTIONS = [5, 10, 15, 20, 25];

// ===========================
// Funciones de evaluación de alertas
// ===========================

/**
 * Determina el nivel de alerta para la conversión de una categoría o cliente.
 * 
 * @param conversion Porcentaje de conversión (0-1)
 * @param potencial Ingreso potencial
 * @param umbralP75 Percentil 75 del potencial en el conjunto filtrado
 * @param umbralConv Umbral de conversión baja
 * @returns Nivel de alerta
 */
export function evaluarAlertaConversion(
  conversion: number,
  potencial: number,
  umbralP75: number,
  umbralConv: number
): "none" | "warning" | "danger" {
  // Conversión baja + alto potencial = alerta roja
  if (conversion < umbralConv && potencial >= umbralP75) {
    return "danger";
  }

  // Solo conversión baja sin alto potencial = advertencia
  if (conversion < umbralConv) {
    return "warning";
  }

  return "none";
}

/**
 * Determina el nivel de alerta para la concentración de venta.
 * 
 * @param participacion Porcentaje de participación (0-1)
 * @returns Nivel de alerta
 */
export function evaluarAlertaConcentracion(
  participacion: number
): "none" | "warning" | "danger" {
  if (participacion > UMBRAL_CONCENTRACION_ROJO) {
    return "danger";
  }

  if (participacion > UMBRAL_CONCENTRACION_AMARILLO) {
    return "warning";
  }

  return "none";
}

/**
 * Obtiene el color asociado a un nivel de alerta para usar en la UI.
 * 
 * @param level Nivel de alerta
 * @returns Color Tailwind CSS
 */
export function getAlertColor(level: "none" | "warning" | "danger"): string {
  switch (level) {
    case "danger":
      return "text-red-600 bg-red-50";
    case "warning":
      return "text-yellow-600 bg-yellow-50";
    default:
      return "text-green-600 bg-green-50";
  }
}

/**
 * Obtiene el color del badge para un nivel de alerta.
 * 
 * @param level Nivel de alerta
 * @returns Clase de color para Badge
 */
export function getBadgeColor(level: "none" | "warning" | "danger"): "red" | "yellow" | "green" {
  switch (level) {
    case "danger":
      return "red";
    case "warning":
      return "yellow";
    default:
      return "green";
  }
}
