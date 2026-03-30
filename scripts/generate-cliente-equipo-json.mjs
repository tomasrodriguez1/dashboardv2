import fs from 'fs';
import path from 'path';

const sourcePath = path.resolve('public', 'data', 'tablas_normalizadas_expandidas.json');
const outputDir = path.resolve('public', 'data', 'exports');
const TARGET_CLIENTE_ID = 'CL-VENTURA02';
const TARGET_EQUIPO_ID = 'EQ-3003';
const outputPath = path.join(
  outputDir,
  `${TARGET_CLIENTE_ID.toLowerCase()}_${TARGET_EQUIPO_ID.toLowerCase()}.json`
);

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildLookupByKey(array, key) {
  return (array || []).reduce((acc, entry) => {
    if (entry && entry[key]) {
      acc.set(entry[key], entry);
    }
    return acc;
  }, new Map());
}

function main() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`No se encuentra ${sourcePath}`);
  }

  const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));

  const cliente = ensureArray(raw.CLIENTE).find(c => c.cliente_id === TARGET_CLIENTE_ID);
  const equipo = ensureArray(raw.EQUIPO).find(e => e.equipo_id === TARGET_EQUIPO_ID);

  if (!cliente) {
    throw new Error(`Cliente ${TARGET_CLIENTE_ID} no existe en ${sourcePath}`);
  }

  if (!equipo) {
    throw new Error(`Equipo ${TARGET_EQUIPO_ID} no existe en ${sourcePath}`);
  }

  const planLookup = buildLookupByKey(ensureArray(raw.PLAN_MANTENIMIENTO), 'plan_id');
  const repuestoLookup = buildLookupByKey(ensureArray(raw.REPUESTO), 'repuesto_id');

  const mantenciones = ensureArray(raw.PLAN_EQUIPO_HITO)
    .filter(peh => peh.equipo_id === TARGET_EQUIPO_ID)
    .map(peh => {
      const plan = planLookup.get(peh.plan_id) || {};

      const repuestos = ensureArray(raw.PLAN_EQUIPO_HITO_REPUESTO)
        .filter(pr => pr.peh_id === peh.peh_id)
        .map(pr => {
          const meta = repuestoLookup.get(pr.repuesto_id);
          return {
            repuesto_id: pr.repuesto_id,
            cantidad: pr.cantidad,
            descripcion: meta?.descripcion || 'Sin descripción',
            proveedor: meta?.proveedor || 'Desconocido',
            stock_u: meta?.stock_u ?? null,
            lead_time_dias: meta?.lead_time_dias ?? null,
          };
        });

      const calendario = ensureArray(raw.CALENDARIO_REPUESTOS_PLAN).filter(
        cal => cal.peh_id === peh.peh_id && cal.cliente_id === TARGET_CLIENTE_ID
      );

      return {
        peh_id: peh.peh_id,
        plan_id: peh.plan_id,
        horas: peh.horas,
        plan_familia: plan.familia || 'Sin familia',
        plan_actividad: plan.actividad || 'Sin actividad',
        repuestos,
        calendario,
      };
    })
    .sort((a, b) => a.horas - b.horas);

  const payload = {
    cliente,
    equipo,
    mantenciones,
    generado_en: new Date().toISOString(),
  };

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));

  console.log(`✅ Exportado ${mantenciones.length} mantenciones a ${outputPath}`);
}

main();
