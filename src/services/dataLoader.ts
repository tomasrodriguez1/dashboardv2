/**
 * Servicio de carga y normalización de datos desde CSV.
 * 
 * Usa PapaParse para leer los archivos CSV y convierte los datos
 * al modelo de dominio de la aplicación.
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
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

interface MantencionExcelRow {
  Mantencion_Horas: string | number;
  Fecha_Estimada: string | number;
  Repuesto: string;
  Cantidad: string | number;
  Intervalo_Repuesto: string | number;
  Sistema: string;
  Tipo: string;
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

/**
 * Carga y normaliza datos de mantenciones desde Excel.
 * Unifica todas las hojas del archivo en un solo array.
 */
export async function loadMantenciones(): Promise<MantencionRow[]> {
  try {
    const response = await fetch('/calendario_mantenciones.xlsx');
    
    if (!response.ok) {
      throw new Error(`Error cargando calendario_mantenciones.xlsx: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const normalized: MantencionRow[] = [];
    
    // Datos reales del cliente y equipo
    // Fuente: calendario_mantenciones.xlsx es de una sola máquina del cliente Incimmet
    const cliente = {
      id: 'INCIMMET-001',
      nombre: 'Incimmet',
    };
    
    const equipo = {
      id: 'BOOMER-S2-CL',
      modelo: 'BOOMER S2 - Cerro Lindo',
    };

    // Procesar cada hoja del Excel
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<MantencionExcelRow>(worksheet);

      jsonData.forEach(row => {
        // Parsear fecha (puede venir como serial number de Excel o string)
        let fechaISO: string;
        if (typeof row.Fecha_Estimada === 'number') {
          // Convertir serial date de Excel a fecha JavaScript
          const fecha = XLSX.SSF.parse_date_code(row.Fecha_Estimada);
          fechaISO = `${fecha.y}-${String(fecha.m).padStart(2, '0')}-${String(fecha.d).padStart(2, '0')}`;
        } else {
          // Ya es string, asumimos formato ISO
          fechaISO = String(row.Fecha_Estimada).trim();
        }

        // Generar código de repuesto basado en el nombre
        const repuestoCodigo = row.Repuesto
          .trim()
          .toUpperCase()
          .replace(/\s+/g, '-')
          .substring(0, 12);

        normalized.push({
          mantencion_horas: Number(row.Mantencion_Horas) || 0,
          fecha_estimada: fechaISO,
          repuesto_nombre: row.Repuesto?.trim() || 'Sin nombre',
          cantidad: Number(row.Cantidad) || 0,
          intervalo_repuesto: Number(row.Intervalo_Repuesto) || 0,
          sistema: row.Sistema?.trim() || 'Sin sistema',
          tipo: row.Tipo?.trim() || 'Preventive',
          cliente_id: cliente.id,
          cliente_nombre: cliente.nombre,
          equipo_id: equipo.id,
          equipo_modelo: equipo.modelo,
          repuesto_codigo: repuestoCodigo,
        });
      });
    });

    console.log(`✅ Cargadas ${normalized.length} mantenciones desde ${workbook.SheetNames.length} hojas`);
    
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
