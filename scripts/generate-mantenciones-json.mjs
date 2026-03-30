import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const inputPath = path.resolve('public', 'calendario_mantenciones.xlsx');
const outputDir = path.resolve('public', 'data');
const outputPath = path.join(outputDir, 'mantenciones.json');

const defaults = {
  cliente_id: 'INCIMMET-001',
  cliente_nombre: 'Incimmet',
  equipo_id: 'BOOMER-S2-CL',
  equipo_modelo: 'BOOMER S2 - Cerro Lindo',
};

function pickFirstNonEmpty(row, ...keys) {
  for (const key of keys) {
    if (row.hasOwnProperty(key)) {
      const value = row[key];
      if (value !== null && value !== undefined && String(value).trim() !== '') {
        return value;
      }
    }
  }
  return '';
}

function normalizeString(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return String(value);
  return String(value).trim();
}

function parseNumber(value) {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/\s/g, '').replace(/,/g, '.');
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function parseFecha(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    if (date && typeof date.y === 'number') {
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }

    const jsDate = new Date(Date.UTC(0, 0, value - 1));
    return jsDate.toISOString().slice(0, 10);
  }

  return String(value).trim();
}

function generateRepuestoCodigo(name) {
  if (!name) {
    return 'SIN-CODIGO';
  }

  return name
    .toUpperCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 12) || 'SIN-CODIGO';
}

const workbook = XLSX.readFile(inputPath);
const normalizedRows = [];

for (const sheetName of workbook.SheetNames) {
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

  if (rows.length > 0) {
    console.log(`[mantenciones] hoja "${sheetName}" columnas:`, Object.keys(rows[0]));
  }

  for (const row of rows) {
    const repuestoNombre = normalizeString(pickFirstNonEmpty(row, 'Repuesto', 'Repuesto Nombre', 'Repuesto_Nombre'));

    const entry = {
      mantencion_horas: parseNumber(pickFirstNonEmpty(row, 'Mantencion_Horas', 'Mantencion Horas', 'Horas', 'Mantencion_Horas')),
      fecha_estimada: parseFecha(pickFirstNonEmpty(row, 'Fecha_Estimada', 'Fecha Estimada', 'Fecha')),
      repuesto_nombre: repuestoNombre || 'Sin nombre',
      cantidad: parseNumber(pickFirstNonEmpty(row, 'Cantidad', 'Cantidad Repuesto', 'Cantidad_Repuesto')),
      intervalo_repuesto: parseNumber(
        pickFirstNonEmpty(
          row,
          'Intervalo_Repuesto',
          'Intervalo Repuesto',
          'Intervalo',
          'Intervalo_Repuesto_Horas'
        )
      ),
      sistema: normalizeString(pickFirstNonEmpty(row, 'Sistema', 'Sistema Equipo')),
      tipo: normalizeString(pickFirstNonEmpty(row, 'Tipo', 'Tipo Mantencion', 'Tipo_Mantencion')),
      cliente_id: normalizeString(
        pickFirstNonEmpty(row, 'Cliente_ID', 'Cliente Id', 'Cliente ID', 'ClienteId')
      ) || defaults.cliente_id,
      cliente_nombre:
        normalizeString(
          pickFirstNonEmpty(row, 'Cliente_Nombre', 'Cliente Nombre', 'ClienteNombre', 'Cliente')
        ) || defaults.cliente_nombre,
      equipo_id:
        normalizeString(
          pickFirstNonEmpty(row, 'Equipo_ID', 'Equipo Id', 'Equipo ID', 'EquipoId')
        ) || defaults.equipo_id,
      equipo_modelo:
        normalizeString(
          pickFirstNonEmpty(row, 'Equipo_Modelo', 'Equipo Modelo', 'EquipoModelo', 'Equipo')
        ) || defaults.equipo_modelo,
      hoja: sheetName,
    };

    entry.repuesto_codigo = generateRepuestoCodigo(entry.repuesto_nombre);

    normalizedRows.push(entry);
  }
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(normalizedRows, null, 2));

console.log(`✅ Generadas ${normalizedRows.length} mantenciones en ${outputPath}`);
