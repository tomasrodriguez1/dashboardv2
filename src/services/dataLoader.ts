/**
 * Servicio de carga y normalización de datos desde CSV.
 * 
 * Usa PapaParse para leer los archivos CSV y convierte los datos
 * al modelo de dominio de la aplicación.
 */

import Papa from 'papaparse';
import type {
  PaisRow,
  CategoriaPaisRow,
  ClienteRowNormalizado,
  AppData,
  Pais,
  MantencionRow,
} from '@domain/types';
import { parseLocaleNumber, parsePercent } from '@utils/formatters';

// ===========================
// Interfaces para CSV raw
// ===========================

interface VentasPorPaisCSV {
  Pais: string;
  'Ing Potencial': string;
  'Venta acumulada': string;
  '% Participación': string;
}

interface VentasPorCategoriaCSV {
  Categoria: string;
  'Ing Potencial Chile': string;
  'Ing Potencial Peru': string;
  'Venta acumulada Chile': string;
  'Venta acumulada Peru': string;
}

interface ClientesCSV {
  Clientes: string;
  'Ing Potencial': string;
  'Venta acumulada': string;
  '%': string;
  Porcentaje?: string;
  Vendedor: string;
}

// ===========================
// Función auxiliar para cargar CSV
// ===========================

async function loadCSV<T>(path: string): Promise<T[]> {
  const response = await fetch(path);
  
  if (!response.ok) {
    throw new Error(`Error cargando ${path}: ${response.statusText}`);
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<T>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn(`Advertencias al parsear ${path}:`, results.errors);
        }
        resolve(results.data);
      },
      error: (error: Error) => {
        reject(new Error(`Error parseando ${path}: ${error.message}`));
      },
    });
  });
}

// ===========================
// Cargadores específicos
// ===========================

/**
 * Carga y normaliza datos de ventas por país.
 */
export async function loadVentasPorPais(): Promise<PaisRow[]> {
  const data = await loadCSV<VentasPorPaisCSV>('/ventas_por_pais.csv');

  return data
    .filter(row => row.Pais && row.Pais !== 'Total') // Excluir fila Total
    .map(row => {
      // Normalizar nombre del país
      let pais: Pais = 'Peru';
      if (row.Pais.toLowerCase().includes('chile')) {
        pais = 'Chile';
      } else if (row.Pais.toLowerCase().includes('peru')) {
        pais = 'Peru';
      }

      return {
        pais,
        ingreso_potencial: parseLocaleNumber(row['Ing Potencial']),
        venta: parseLocaleNumber(row['Venta acumulada']),
        participacion_original: parsePercent(row['% Participación']),
      };
    });
}

/**
 * Carga y normaliza datos de ventas por categoría.
 * Genera dos registros por cada fila: uno para Chile y otro para Perú.
 */
export async function loadVentasPorCategoria(): Promise<CategoriaPaisRow[]> {
  const data = await loadCSV<VentasPorCategoriaCSV>('/ventas_por_categoria.csv');

  const normalized: CategoriaPaisRow[] = [];

  for (const row of data) {
    if (!row.Categoria || row.Categoria === 'Total') {
      continue;
    }

    // Registro para Chile
    normalized.push({
      categoria: row.Categoria.trim(),
      pais: 'Chile',
      ingreso_potencial: parseLocaleNumber(row['Ing Potencial Chile']),
      venta: parseLocaleNumber(row['Venta acumulada Chile']),
    });

    // Registro para Perú
    normalized.push({
      categoria: row.Categoria.trim(),
      pais: 'Peru',
      ingreso_potencial: parseLocaleNumber(row['Ing Potencial Peru']),
      venta: parseLocaleNumber(row['Venta acumulada Peru']),
    });
  }

  return normalized;
}

/**
 * Carga y normaliza datos de clientes de Perú.
 */
export async function loadClientesPeru(): Promise<ClienteRowNormalizado[]> {
  const data = await loadCSV<ClientesCSV>('/ventas_por_clientes_peru.csv');

  return data
    .filter(row => row.Clientes && row.Clientes !== 'TOTAL')
    .map(row => ({
      pais: 'Peru' as Pais,
      cliente: row.Clientes.trim(),
      ingreso_potencial: parseLocaleNumber(row['Ing Potencial']),
      venta: parseLocaleNumber(row['Venta acumulada']),
      porcentaje_relativo: parsePercent(row['%'] || row.Porcentaje || '0'),
      vendedor: row.Vendedor?.trim() || 'Sin asignar',
    }));
}

/**
 * Carga y normaliza datos de clientes de Chile.
 */
export async function loadClientesChile(): Promise<ClienteRowNormalizado[]> {
  const data = await loadCSV<ClientesCSV>('/ventas_por_cliente_chile.csv');

  return data
    .filter(row => row.Clientes && row.Clientes !== 'TOTAL')
    .map(row => ({
      pais: 'Chile' as Pais,
      cliente: row.Clientes.trim(),
      ingreso_potencial: parseLocaleNumber(row['Ing Potencial']),
      venta: parseLocaleNumber(row['Venta acumulada']),
      porcentaje_relativo: parsePercent(row['%'] || row.Porcentaje || '0'),
      vendedor: row.Vendedor?.trim() || 'Sin asignar',
    }));
}

const MANTENCIONES_SOURCE = '/data/mantenciones.json';

interface MantencionJsonRow {
  mantencion_horas?: number | string;
  fecha_estimada?: string;
  repuesto_nombre?: string;
  cantidad?: number | string;
  intervalo_repuesto?: number | string;
  sistema?: string;
  tipo?: string;
  estado?: string;
  cliente_id?: string;
  cliente_nombre?: string;
  equipo_id?: string;
  equipo_modelo?: string;
  repuesto_codigo?: string;
}

const DEFAULT_CLIENTE = {
  id: 'INCIMMET-001',
  nombre: 'Incimmet',
};

const DEFAULT_EQUIPO = {
  id: 'BOOMER-S2-CL',
  modelo: 'BOOMER S2 - Cerro Lindo',
};

function ensureString(value?: string): string {
  if (!value) {
    return '';
  }
  return value.trim();
}

function ensureNumber(value?: number | string): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function generateRepuestoCodigo(name: string): string {
  const cleaned = name
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 12);

  return cleaned || 'SIN-CODIGO';
}

/**
 * Carga y normaliza datos de mantenciones desde un JSON preparado.
 */
export async function loadMantenciones(): Promise<MantencionRow[]> {
  try {
    const response = await fetch(MANTENCIONES_SOURCE);

    if (!response.ok) {
      throw new Error(`Error cargando ${MANTENCIONES_SOURCE}: ${response.statusText}`);
    }

    const data: MantencionJsonRow[] = await response.json();

    const normalized = data.map((row): MantencionRow => {
      const repuestoNombre = ensureString(row.repuesto_nombre) || 'Sin nombre';
      const repuestoCodigo = ensureString(row.repuesto_codigo) || generateRepuestoCodigo(repuestoNombre);

      const estadoRaw = ensureString(row.estado);
      const estado: 'pendiente' | 'completada' = estadoRaw === 'completada' ? 'completada' : 'pendiente';

      return {
        mantencion_horas: ensureNumber(row.mantencion_horas),
        fecha_estimada: ensureString(row.fecha_estimada),
        repuesto_nombre: repuestoNombre,
        cantidad: ensureNumber(row.cantidad),
        intervalo_repuesto: ensureNumber(row.intervalo_repuesto),
        sistema: ensureString(row.sistema) || 'Sin sistema',
        tipo: ensureString(row.tipo) || 'Preventive',
        estado,
        cliente_id: ensureString(row.cliente_id) || DEFAULT_CLIENTE.id,
        cliente_nombre: ensureString(row.cliente_nombre) || DEFAULT_CLIENTE.nombre,
        equipo_id: ensureString(row.equipo_id) || DEFAULT_EQUIPO.id,
        equipo_modelo: ensureString(row.equipo_modelo) || DEFAULT_EQUIPO.modelo,
        repuesto_codigo: repuestoCodigo,
      };
    });

    console.log(`✅ Cargadas ${normalized.length} mantenciones desde ${MANTENCIONES_SOURCE}`);

    return normalized;
  } catch (error) {
    console.error('Error cargando mantenciones:', error);
    throw error;
  }
}

// ===========================
// Cargador principal
// ===========================

/**
 * Carga todos los datos necesarios para la aplicación.
 * 
 * @returns Objeto con todos los datos normalizados
 */
export async function loadAllData(): Promise<AppData> {
  try {
    const [paises, categorias, clientesPeru, clientesChile, mantenciones] = await Promise.all([
      loadVentasPorPais(),
      loadVentasPorCategoria(),
      loadClientesPeru(),
      loadClientesChile(),
      loadMantenciones(),
    ]);

    const clientes = [...clientesChile, ...clientesPeru];

    // Validación básica
    if (paises.length === 0) {
      console.warn('No se cargaron datos de países');
    }
    if (categorias.length === 0) {
      console.warn('No se cargaron datos de categorías');
    }
    if (clientes.length === 0) {
      console.warn('No se cargaron datos de clientes');
    }
    if (mantenciones.length === 0) {
      console.warn('No se cargaron datos de mantenciones');
    }

    return {
      paises,
      categorias,
      clientes,
      mantenciones,
    };
  } catch (error) {
    console.error('Error cargando datos:', error);
    throw error;
  }
}

/**
 * Valida que los datos tengan el esquema esperado.
 * 
 * @param data Datos a validar
 * @returns true si los datos son válidos
 */
export function validateData(data: AppData): boolean {
  // Validar que existan los países esperados
  const paisesSet = new Set(data.paises.map(p => p.pais));
  if (!paisesSet.has('Chile') || !paisesSet.has('Peru')) {
    console.error('Faltan datos de Chile o Perú');
    return false;
  }

  // Validar que haya al menos algunas categorías
  const categoriasSet = new Set(data.categorias.map(c => c.categoria));
  if (categoriasSet.size === 0) {
    console.error('No hay categorías en los datos');
    return false;
  }

  // Validar que haya clientes de ambos países
  const clientesPorPais = data.clientes.reduce((acc, c) => {
    acc[c.pais] = (acc[c.pais] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!clientesPorPais['Chile'] || !clientesPorPais['Peru']) {
    console.error('Faltan clientes de Chile o Perú');
    return false;
  }

  return true;
}
