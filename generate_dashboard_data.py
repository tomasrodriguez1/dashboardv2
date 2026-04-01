"""
generate_dashboard_data.py
Lee los CSV de ../export/ y regenera los archivos estáticos del dashboard en public/.
Uso: python3 generate_dashboard_data.py  (ejecutar desde dashboardv2/)
"""

import csv
import json
from pathlib import Path
from collections import defaultdict

# ---------------------------------------------------------------------------
# Rutas
# ---------------------------------------------------------------------------
BASE_DIR   = Path(__file__).parent
EXPORT_DIR = BASE_DIR / ".." / "export"
DATA_DIR   = BASE_DIR / "public" / "data"
EXPORTS_DIR = DATA_DIR / "exports"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
INT_FIELDS  = {
    "tasa_uso_horas_dia", "horas", "cantidad", "stock_u",
    "punto_reorden", "lead_time_dias", "horometro",
    "horas_ultima_mantencion", "dias_restantes_est",
}
BOOL_FIELDS = {"critico"}


def cast_row(row: dict) -> dict:
    """Castea los campos numéricos y booleanos de una fila CSV."""
    result = {}
    for k, v in row.items():
        if k in INT_FIELDS:
            result[k] = int(v) if v not in ("", None) else None
        elif k in BOOL_FIELDS:
            result[k] = v.strip().lower() in ("true", "1", "yes")
        else:
            result[k] = v
    return result


def read_csv(filename: str) -> list[dict]:
    """Lee un CSV de EXPORT_DIR y devuelve una lista de dicts casteados."""
    path = EXPORT_DIR / filename
    with open(path, newline="", encoding="utf-8") as f:
        return [cast_row(row) for row in csv.DictReader(f)]


# ---------------------------------------------------------------------------
# Fase 1 + 2: Carga y casteo de CSVs
# ---------------------------------------------------------------------------
def load_all_csvs() -> dict:
    clientes_list   = read_csv("cliente.csv")
    equipos_list    = read_csv("equipo.csv")
    ce_list         = read_csv("cliente_equipo.csv")
    repuestos_list  = read_csv("repuesto.csv")
    planes_list     = read_csv("plan_mantenimiento.csv")
    pehs_list       = read_csv("plan_equipo_hito.csv")
    pehr_list       = read_csv("plan_equipo_hito_repuesto.csv")
    hist_log_list   = read_csv("historial_mantenimiento_log.csv")
    hist_rpt_list   = read_csv("historial_mantenimiento_repuesto.csv")
    cal_list        = read_csv("calendario_repuestos_plan.csv")

    # Índices para lookups O(1)
    clientes  = {r["cliente_id"]: r for r in clientes_list}
    equipos   = {r["equipo_id"]:  r for r in equipos_list}
    repuestos = {r["repuesto_id"]: r for r in repuestos_list}
    planes    = {r["plan_id"]:    r for r in planes_list}
    pehs      = {r["peh_id"]:     r for r in pehs_list}

    # equipo_id → cliente_id (primer match; debería ser 1-a-1)
    equipo_to_cliente = {r["equipo_id"]: r["cliente_id"] for r in ce_list}

    # peh_id → repuestos agrupados
    peh_repuestos: dict[str, list] = defaultdict(list)
    for r in pehr_list:
        peh_repuestos[r["peh_id"]].append(r)

    # calendario: peh_id → due_date_est mínimo (puede haber múltiples filas)
    cal_fechas: dict[str, list] = defaultdict(list)
    for r in cal_list:
        if r.get("due_date_est"):
            cal_fechas[r["peh_id"]].append(r["due_date_est"])
    cal_min: dict[str, str | None] = {
        peh_id: min(fechas) for peh_id, fechas in cal_fechas.items()
    }

    return {
        "clientes_list":   clientes_list,
        "equipos_list":    equipos_list,
        "ce_list":         ce_list,
        "repuestos_list":  repuestos_list,
        "planes_list":     planes_list,
        "pehs_list":       pehs_list,
        "pehr_list":       pehr_list,
        "hist_log_list":   hist_log_list,
        "hist_rpt_list":   hist_rpt_list,
        "cal_list":        cal_list,
        # índices
        "clientes":        clientes,
        "equipos":         equipos,
        "repuestos":       repuestos,
        "planes":          planes,
        "pehs":            pehs,
        "equipo_to_cliente": equipo_to_cliente,
        "peh_repuestos":   peh_repuestos,
        "cal_min":         cal_min,
    }


# ---------------------------------------------------------------------------
# Fase 3: tablas_normalizadas_expandidas.json
# ---------------------------------------------------------------------------
def generate_tablas(data: dict) -> dict:
    tablas = {
        "CLIENTE":                       data["clientes_list"],
        "EQUIPO":                        data["equipos_list"],
        "CLIENTE_EQUIPO":                data["ce_list"],
        "REPUESTO":                      data["repuestos_list"],
        "PLAN_MANTENIMIENTO":            data["planes_list"],
        "PLAN_EQUIPO_HITO":              data["pehs_list"],
        "PLAN_EQUIPO_HITO_REPUESTO":     data["pehr_list"],
        "HISTORIAL_MANTENIMIENTO_LOG":   data["hist_log_list"],
        "HISTORIAL_MANTENIMIENTO_REPUESTO": data["hist_rpt_list"],
        "CALENDARIO_REPUESTOS_PLAN":     data["cal_list"],
    }
    out_path = DATA_DIR / "tablas_normalizadas_expandidas.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(tablas, f, ensure_ascii=False, indent=2)
    return tablas


# ---------------------------------------------------------------------------
# Fase 4: mantenciones.json
# ---------------------------------------------------------------------------
def generate_mantenciones(data: dict) -> list:
    clientes      = data["clientes"]
    equipos       = data["equipos"]
    repuestos     = data["repuestos"]
    planes        = data["planes"]
    pehs          = data["pehs"]
    pehr_list     = data["pehr_list"]
    equipo_to_cliente = data["equipo_to_cliente"]
    cal_min       = data["cal_min"]

    mantenciones = []
    for pehr in pehr_list:
        peh_id      = pehr["peh_id"]
        repuesto_id = pehr["repuesto_id"]
        cantidad    = pehr["cantidad"]

        peh = pehs.get(peh_id)
        if not peh:
            continue

        plan_id   = peh["plan_id"]
        equipo_id = peh["equipo_id"]
        horas     = peh["horas"]

        plan      = planes.get(plan_id, {})
        equipo    = equipos.get(equipo_id, {})
        cliente_id = equipo_to_cliente.get(equipo_id)
        cliente   = clientes.get(cliente_id, {}) if cliente_id else {}
        repuesto  = repuestos.get(repuesto_id, {})

        mantenciones.append({
            "mantencion_horas":  horas,
            "fecha_estimada":    cal_min.get(peh_id),
            "repuesto_nombre":   repuesto.get("descripcion"),
            "cantidad":          cantidad,
            "proveedor":         repuesto.get("proveedor"),
            "lead_time_dias":    repuesto.get("lead_time_dias"),
            "stock_u":           repuesto.get("stock_u"),
            "punto_reorden":     repuesto.get("punto_reorden"),
            "plan_familia":      plan.get("familia"),
            "plan_actividad":    plan.get("actividad"),
            "tipo":              "Preventive",
            "cliente_id":        cliente_id,
            "cliente_nombre":    cliente.get("nombre"),
            "equipo_id":         equipo_id,
            "equipo_modelo":     equipo.get("modelo"),
            "equipo_fabricante": equipo.get("fabricante"),
            "repuesto_id":       repuesto_id,
        })

    out_path = DATA_DIR / "mantenciones.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(mantenciones, f, ensure_ascii=False, indent=2)
    return mantenciones


# ---------------------------------------------------------------------------
# Fase 5: exports/{cliente_id}_{equipo_id}.json
# ---------------------------------------------------------------------------
def generate_exports(data: dict) -> int:
    clientes      = data["clientes"]
    equipos       = data["equipos"]
    pehs_list     = data["pehs_list"]
    peh_repuestos = data["peh_repuestos"]
    repuestos     = data["repuestos"]
    planes        = data["planes"]
    ce_list       = data["ce_list"]

    # Borrar todos los .json existentes en exports/
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
    for existing in EXPORTS_DIR.glob("*.json"):
        existing.unlink()

    # Índice: equipo_id → lista de pehs
    equipo_pehs: dict[str, list] = defaultdict(list)
    for peh in pehs_list:
        equipo_pehs[peh["equipo_id"]].append(peh)

    count = 0
    for par in ce_list:
        cliente_id = par["cliente_id"]
        equipo_id  = par["equipo_id"]

        cliente = clientes.get(cliente_id, {})
        equipo  = equipos.get(equipo_id, {})

        # Construir lista de mantenciones ordenadas por horas
        mantenciones_export = []
        for peh in sorted(equipo_pehs.get(equipo_id, []), key=lambda p: p["horas"]):
            peh_id  = peh["peh_id"]
            plan    = planes.get(peh["plan_id"], {})

            repuestos_list_export = []
            for pehr in peh_repuestos.get(peh_id, []):
                rpt = repuestos.get(pehr["repuesto_id"], {})
                repuestos_list_export.append({
                    "repuesto_id":  pehr["repuesto_id"],
                    "cantidad":     pehr["cantidad"],
                    "descripcion":  rpt.get("descripcion"),
                    "proveedor":    rpt.get("proveedor"),
                    "stock_u":      rpt.get("stock_u"),
                    "lead_time_dias": rpt.get("lead_time_dias"),
                })

            mantenciones_export.append({
                "peh_id":        peh_id,
                "plan_id":       peh["plan_id"],
                "horas":         peh["horas"],
                "plan_familia":  plan.get("familia"),
                "plan_actividad": plan.get("actividad"),
                "repuestos":     repuestos_list_export,
            })

        payload = {
            "cliente": {
                "cliente_id": cliente_id,
                "nombre":     cliente.get("nombre"),
            },
            "equipo": equipo,
            "mantenciones": mantenciones_export,
        }

        filename = f"{cliente_id}_{equipo_id}.json".lower()
        out_path = EXPORTS_DIR / filename
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
        count += 1

    return count


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print("Cargando CSVs...")
    data = load_all_csvs()

    print("Generando tablas_normalizadas_expandidas.json...")
    tablas = generate_tablas(data)

    print("Generando mantenciones.json...")
    mantenciones = generate_mantenciones(data)

    print("Generando exports/...")
    n_exports = generate_exports(data)

    print()
    print("✅ Dashboard data regenerada")
    print(f"  tablas_normalizadas_expandidas.json: {len(tablas)} tablas")
    print(f"  mantenciones.json: {len(mantenciones)} registros")
    print(f"  exports/: {n_exports} archivos")


if __name__ == "__main__":
    main()
