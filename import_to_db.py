"""
import_to_db.py
Lee public/data/tablas_normalizadas_expandidas.json y sube todo a PostgreSQL,
reemplazando la data existente (TRUNCATE + INSERT).
Uso: python3 import_to_db.py  (ejecutar desde dashboardv2/)
"""

import json
from pathlib import Path

import psycopg2
from psycopg2.extras import execute_values

# ---------------------------------------------------------------------------
# Configuración
# ---------------------------------------------------------------------------
DB_URL   = (
    "postgresql://venturanalytic_demo_user:ytlUCNCGSyIj9QuZ6B6FW1SV8F4mENvq"
    "@dpg-cua4b5rqf0us73c6iplg-a.oregon-postgres.render.com/VA_minero"
)

BASE_DIR = Path(__file__).parent
JSON_PATH = BASE_DIR / "public" / "data" / "tablas_normalizadas_expandidas.json"

# Orden de TRUNCATE: dependientes primero (hijos antes que padres)
TRUNCATE_ORDER = [
    "calendario_repuestos_plan",
    "historial_mantenimiento_repuesto",
    "historial_mantenimiento_log",
    "plan_equipo_hito_repuesto",
    "plan_equipo_hito",
    "cliente_equipo",
    "plan_mantenimiento",
    "repuesto",
    "equipo",
    "cliente",
]

# Orden de INSERT: padres primero (inverso al de TRUNCATE)
INSERT_ORDER = [
    "cliente",
    "equipo",
    "repuesto",
    "plan_mantenimiento",
    "cliente_equipo",
    "plan_equipo_hito",
    "plan_equipo_hito_repuesto",
    "historial_mantenimiento_log",
    "historial_mantenimiento_repuesto",
    "calendario_repuestos_plan",
]

# Las tablas que NO se deben tocar nunca
PROTECTED = {"intents", "intent_examples", "intent_examples_staging"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def table_key(table_name: str) -> str:
    """Convierte nombre de tabla minúsculas → clave MAYÚSCULAS del JSON."""
    return table_name.upper()


def insert_table(cur, table_name: str, rows: list[dict]) -> int:
    """TRUNCATE y luego INSERT de todas las filas. Devuelve cantidad insertada."""
    if not rows:
        return 0

    columns = list(rows[0].keys())
    col_str = ", ".join(f'"{c}"' for c in columns)
    placeholders = ", ".join(["%s"] * len(columns))
    sql = f'INSERT INTO "{table_name}" ({col_str}) VALUES ({placeholders})'

    values = [tuple(row.get(c) for c in columns) for row in rows]
    cur.executemany(sql, values)
    return len(rows)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print(f"Leyendo {JSON_PATH}...")
    with open(JSON_PATH, encoding="utf-8") as f:
        tablas_json: dict = json.load(f)

    print("Conectando a PostgreSQL...")
    conn = psycopg2.connect(DB_URL)
    cur  = conn.cursor()

    try:
        # TRUNCATE en orden de dependencias (CASCADE para FK)
        print("Truncando tablas...")
        for table in TRUNCATE_ORDER:
            assert table not in PROTECTED, f"Tabla protegida: {table}"
            cur.execute(f'TRUNCATE TABLE "{table}" CASCADE')

        # INSERT en orden inverso (padres primero)
        total_filas = 0
        n_tablas    = 0

        for table in INSERT_ORDER:
            key  = table_key(table)
            rows = tablas_json.get(key, [])
            n    = insert_table(cur, table, rows)
            total_filas += n
            n_tablas    += 1
            print(f"  {table}: {n} filas")

        conn.commit()

    except Exception as exc:
        conn.rollback()
        print(f"\n❌ Error — rollback aplicado.\n{exc}")
        raise

    finally:
        cur.close()
        conn.close()

    print()
    print(f"✅ BD actualizada — {n_tablas} tablas, {total_filas} filas totales")


if __name__ == "__main__":
    main()
