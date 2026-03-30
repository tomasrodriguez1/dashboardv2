// ===========================
// Tipos de datos normalizados
// ===========================

export type Pais = "Chile" | "Peru";

export interface PaisRow {
  pais: Pais;
  ingreso_potencial: number;
  venta: number;
  participacion_original?: number; // % del CSV original (0-1)
}

export interface CategoriaPaisRow {
  categoria: string;
  pais: Pais;
  ingreso_potencial: number;
  venta: number;
}

export interface ClienteRowNormalizado {
  pais: Pais;
  cliente: string;
  ingreso_potencial: number;
  venta: number;
  porcentaje_relativo?: number; // % del CSV original (0-1)
  vendedor: string;
}

// ===========================
// Tipos de KPIs
// ===========================

export interface GlobalKPIs {
  venta_total: number;
  ingreso_potencial_total: number;
  conversion: number; // 0-1
  venta_chile: number;
  venta_peru: number;
  conversion_chile: number;
  conversion_peru: number;
}

export interface PaisKPIs {
  pais: Pais;
  venta: number;
  ingreso_potencial: number;
  conversion: number; // 0-1
  participacion_venta: number; // 0-1, respecto al total
}

export interface CategoriaKPIs {
  categoria: string;
  venta: number;
  ingreso_potencial: number;
  conversion: number;
  participacion_venta: number; // 0-1
  venta_chile: number;
  venta_peru: number;
  conversion_chile: number;
  conversion_peru: number;
}

export interface ClienteKPIs {
  pais: Pais;
  cliente: string;
  ingreso_potencial: number;
  venta: number;
  conversion: number; // 0-1
  participacion_venta: number; // 0-1, respecto al total del país
  es_top_n: boolean;
}

// ===========================
// Tipos de datos para gráficos
// ===========================

export interface CountryMixData {
  name: string;
  value: number;
  percentage: number;
}

export interface CategoryBarData {
  categoria: string;
  venta_chile: number;
  venta_peru: number;
  conversion_chile: number;
  conversion_peru: number;
}

export interface ClientScatterPoint {
  cliente: string;
  pais: Pais;
  x: number; // ingreso_potencial
  y: number; // venta
  conversion: number;
  es_top_n: boolean;
}

export interface VendedorKPIs {
  vendedor: string;
  paises: Pais[]; // Países donde opera
  ingreso_potencial: number;
  venta: number;
  conversion: number;
  cantidad_clientes: number;
  clientes: string[]; // Lista de nombres de clientes
}

// ===========================
// Tipos de mantenciones
// ===========================

export interface MantencionRow {
  // Datos del Excel
  mantencion_horas: number;
  fecha_estimada: string; // ISO YYYY-MM-DD
  repuesto_nombre: string;
  cantidad: number;
  intervalo_repuesto: number;
  sistema: string;
  tipo: string; // "Preventive", "Major", etc.
  estado: 'pendiente' | 'completada';

  // Datos suplementarios (generados)
  cliente_id: string;
  cliente_nombre: string;
  equipo_id: string;
  equipo_modelo: string;
  repuesto_codigo: string;
}

// ===========================
// Tipos auxiliares
// ===========================

export interface AlertLevel {
  level: "none" | "warning" | "danger";
  reason?: string;
}

// ===========================
// Datos completos de la aplicación
// ===========================

export interface AppData {
  paises: PaisRow[];
  categorias: CategoriaPaisRow[];
  clientes: ClienteRowNormalizado[];
  mantenciones: MantencionRow[];
}
