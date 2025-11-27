# 📐 Arquitectura del Dashboard Ejecutivo

## 🎯 Propósito del Proyecto

Dashboard ejecutivo para análisis de ventas del sector minero que permite:

- **Evaluar conversión**: Comparar ingreso potencial vs. ventas realizadas
- **Identificar oportunidades**: Detectar clientes con alto potencial y baja conversión
- **Gestionar riesgos**: Identificar concentración de ventas en pocos clientes/categorías
- **Analizar performance**: Evaluar rendimiento por país, categoría, cliente y vendedor
- **Tomar decisiones**: Visualizaciones interactivas con filtros para análisis detallado

---

## 🏗️ Arquitectura General

### Principios SOLID Aplicados

El proyecto sigue una **arquitectura por capas** estricta:

```
┌─────────────────────────────────────────────────┐
│  PRESENTACIÓN (Components)                      │
│  - Solo renderiza                               │
│  - No hace cálculos                             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  SELECTORES (Services/Selectors)                │
│  - Aplica filtros                               │
│  - Transforma datos para UI                     │
│  - Llama a metrics.ts                           │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  LÓGICA DE NEGOCIO (Domain/Metrics)             │
│  - safeSum, sumBy (ÚNICA forma de sumar)        │
│  - Funciones puras de cálculo                   │
│  - Sin dependencias externas                    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  DATOS (Services/DataLoader)                    │
│  - Carga CSV con PapaParse                      │
│  - Normaliza datos a tipos de dominio           │
│  - Valida esquemas                              │
└─────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Carpetas Detallada

```
dashboardv2/
│
├── public/                          # 📄 Archivos CSV estáticos
│   ├── ventas_por_pais.csv         # Datos agregados por país
│   ├── ventas_por_categoria.csv    # Datos por categoría x país
│   ├── ventas_por_clientes_peru.csv
│   └── ventas_por_cliente_chile.csv
│
├── src/
│   │
│   ├── domain/                      # 🧠 LÓGICA DE NEGOCIO PURA
│   │   ├── types.ts                 # Tipos de dominio y contratos
│   │   ├── metrics.ts               # ⭐ TODAS las funciones de cálculo
│   │   ├── thresholds.ts            # Umbrales configurables
│   │   └── security.ts              # Clave de acceso hardcodeada
│   │
│   ├── services/                    # 📦 SERVICIOS DE DATOS
│   │   ├── dataLoader.ts            # Carga y normalización de CSV
│   │   └── selectors.ts             # Aplica filtros + llama a metrics
│   │
│   ├── state/                       # 🔄 ESTADO GLOBAL
│   │   └── filters.store.ts         # Zustand: filtros + sessionStorage
│   │
│   ├── utils/                       # 🛠️ UTILIDADES
│   │   └── formatters.ts            # Parseo y formateo de números
│   │
│   ├── components/                  # 🎨 COMPONENTES UI
│   │   ├── atoms/                   # Componentes básicos
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── KPIStat.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ProgressBar.tsx
│   │   │
│   │   ├── molecules/               # Componentes compuestos
│   │   │   ├── FiltersBar.tsx       # Barra de filtros globales
│   │   │   ├── SegmentedControl.tsx # Toggle entre vistas
│   │   │   └── Legend.tsx
│   │   │
│   │   ├── charts/                  # Gráficos con Recharts
│   │   │   ├── CountryMixChart.tsx  # Pie/Donut por país
│   │   │   ├── CategoryBars.tsx     # Barras agrupadas
│   │   │   ├── ClientScatter.tsx    # Scatter potencial vs venta
│   │   │   └── VendedoresBars.tsx   # Barras por vendedor
│   │   │
│   │   └── tables/                  # Tablas con formato condicional
│   │       ├── TopClientsTable.tsx
│   │       └── VendedoresTable.tsx
│   │
│   ├── app/                         # 🚪 APLICACIÓN
│   │   ├── pages/
│   │   │   ├── AccessGate.tsx       # Pantalla de clave
│   │   │   └── DashboardPage.tsx    # Dashboard principal
│   │   ├── layouts/
│   │   │   └── MainLayout.tsx       # Layout + guard de autenticación
│   │   ├── App.tsx                  # Componente raíz
│   │   └── routes.tsx               # Configuración de rutas
│   │
│   ├── tests/                       # 🧪 TESTS
│   │   ├── metrics.test.ts          # Tests de funciones de cálculo
│   │   └── selectors.test.ts        # Tests de selectores
│   │
│   ├── main.tsx                     # Punto de entrada
│   └── app.css                      # Estilos globales Tailwind
│
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── README.md                        # Documentación de usuario
└── ARQUITECTURA.md                  # Este documento
```

---

## 🔄 Flujo de Datos Completo

### 1. Carga Inicial

```typescript
DashboardPage.tsx
  └─> loadAllData() [dataLoader.ts]
      └─> loadCSV() con PapaParse
          └─> Normaliza a tipos de dominio
              └─> ClienteRowNormalizado {
                    pais, cliente, ingreso_potencial,
                    venta, vendedor
                  }
```

### 2. Aplicación de Filtros

```typescript
Usuario cambia filtro (país/categoría)
  └─> useFiltersStore actualiza estado
      └─> Guarda en sessionStorage
          └─> DashboardPage.tsx se re-renderiza
              └─> Llama a selectores con nuevos filtros
```

### 3. Cálculo de Métricas

```typescript
getGlobalKPIs(data, filtros) [selectors.ts]
  └─> Filtra datos según filtros.pais y filtros.categorias
      └─> sumBy(clientes, c => c.venta) [metrics.ts]
          └─> safeSum([valores...]) [algoritmo Kahan]
              └─> Retorna total con precisión numérica
```

### 4. Renderizado

```typescript
DashboardPage.tsx tiene los KPIs calculados
  └─> Pasa datos a componentes
      └─> <KPIStat value={formatCurrency(venta_total)} />
          └─> Solo presentación, sin lógica
```

---

## 🧮 Módulo de Métricas (CRÍTICO)

### src/domain/metrics.ts

**⚠️ REGLA DE ORO:** TODAS las sumas DEBEN usar `safeSum` o `sumBy`.

#### Funciones Principales

```typescript
// ✅ Suma segura (algoritmo Kahan)
safeSum(values: number[]): number

// ✅ Suma con selector
sumBy<T>(items: T[], selector: (item: T) => number): number

// ✅ Conversión
conversion(venta: number, potencial: number): number

// ✅ Participación
participation(part: number, total: number): number

// ✅ Estadísticas
percentile75(values: number[]): number
mean(values: number[]): number
stdDev(values: number[]): number

// ✅ Top N
topNBy<T>(items: T[], selector: (item: T) => number, n: number): T[]
```

#### ❌ PROHIBIDO en Lógica de Negocio

```typescript
// ❌ NUNCA HACER ESTO
const total = items.reduce((a, b) => a + b.venta, 0);

// ✅ SIEMPRE HACER ESTO
const total = sumBy(items, item => item.venta);
```

---

## 📊 Selectores (src/services/selectors.ts)

Los selectores son funciones que:
1. Reciben `AppData` y `Filtros`
2. Aplican los filtros
3. Llaman a funciones de `metrics.ts`
4. Retornan datos listos para la UI

### Selectores Disponibles

```typescript
// KPIs globales
getGlobalKPIs(data, filtros): GlobalKPIs

// KPIs por país
getCountryKPIs(data, filtros): PaisKPIs[]

// Datos para gráficos
getCountryMixData(data, filtros): CountryMixData[]
getCategorySeries(data, filtros): CategoryBarData[]
getClientScatterData(data, filtros): ClientScatterPoint[]

// Top clientes
getTopClients(data, filtros): ClienteKPIs[]

// Vendedores
getVendedoresKPIs(data, filtros): VendedorKPIs[]
getTopVendedores(data, filtros, n): VendedorKPIs[]

// Utilidades
getAllCategorias(data): string[]
getP75Potencial(data, filtros): number
```

---

## 🎨 Sistema de Componentes

### Atomic Design

```
Atoms (básicos)
  └─> Molecules (compuestos)
      └─> Organisms (complejos)
          └─> Pages (pantallas)
```

### Reglas de Componentes

1. **Atoms**: Sin lógica, solo props
2. **Molecules**: Composición de atoms, mínima lógica local
3. **Charts/Tables**: Reciben datos calculados, no calculan
4. **Pages**: Única fuente de datos, orquesta componentes

### Ejemplo de Flujo

```typescript
// ❌ MAL - Componente calcula
function ClientTable({ clientes }) {
  const total = clientes.reduce((a,b) => a + b.venta, 0);
  return <div>{total}</div>;
}

// ✅ BIEN - Componente recibe dato calculado
function ClientTable({ clientes, total }) {
  return <div>{total}</div>;
}
```

---

## 🔌 Estado Global (Zustand)

### src/state/filters.store.ts

```typescript
interface FiltersState {
  pais: 'Ambos' | 'Chile' | 'Peru';
  categorias: string[];
  topN: number;
}

// Hooks
useFiltersStore()        // Estado + acciones
useFilters()             // Solo estado
useFiltersActions()      // Solo acciones
```

**Persistencia:** Automática en `sessionStorage`

---

## 📝 Formato de Datos CSV

### Columnas Importantes

**ventas_por_clientes_*.csv:**
```csv
Clientes,Ing Potencial,Venta acumulada,Porcentaje,Vendedor
Geovita,9.374.593,3.603.505,38%,Pablo Gálvez
```

**Formato de números:**
- Miles: `13.654.935` (punto como separador)
- Porcentajes: `38%` (con símbolo)

**Parseo:**
```typescript
parseLocaleNumber("13.654.935") → 13654935
parsePercent("38%") → 0.38
```

---

## ➕ Cómo Agregar Nuevas Funcionalidades

### 1. Agregar Nueva Métrica de Negocio

**Paso 1:** Definir función en `domain/metrics.ts`
```typescript
// Usar SIEMPRE safeSum/sumBy
export function metricaCustom(items: T[]): number {
  return sumBy(items, item => item.campo);
}
```

**Paso 2:** Crear selector en `services/selectors.ts`
```typescript
export function getNuevaMetrica(data: AppData, filtros: Filtros) {
  const filtrados = aplicarFiltros(data, filtros);
  return metricaCustom(filtrados);
}
```

**Paso 3:** Usar en componente
```typescript
const metrica = getNuevaMetrica(data, filtros);
return <KPIStat value={metrica} />;
```

### 2. Agregar Nuevo Gráfico

**Paso 1:** Crear componente en `components/charts/`
```typescript
export interface MiGraficoProps {
  data: MiTipoDatos[];
}

export function MiGrafico({ data }: MiGraficoProps) {
  return (
    <Card>
      <ResponsiveContainer>
        <BarChart data={data}>
          {/* Recharts config */}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
```

**Paso 2:** Crear selector de datos
```typescript
export function getMiGraficoData(data: AppData, filtros: Filtros) {
  // Transforma data a formato del gráfico
  return data.map(item => ({
    nombre: item.nombre,
    valor: item.valor
  }));
}
```

**Paso 3:** Agregar a DashboardPage.tsx
```typescript
const miGraficoData = getMiGraficoData(data, filtros);
// En el JSX
<MiGrafico data={miGraficoData} />
```

### 3. Agregar Nueva Columna a CSV

**Paso 1:** Actualizar interfaz en `dataLoader.ts`
```typescript
interface ClientesCSV {
  Clientes: string;
  // ... existentes
  NuevaColumna: string; // Agregar aquí
}
```

**Paso 2:** Actualizar tipo de dominio en `types.ts`
```typescript
export interface ClienteRowNormalizado {
  // ... existentes
  nuevoCampo: string;
}
```

**Paso 3:** Parsear en loader
```typescript
.map(row => ({
  // ... existentes
  nuevoCampo: row.NuevaColumna?.trim() || 'default',
}))
```

### 4. Agregar Nuevo Filtro

**Paso 1:** Actualizar store en `filters.store.ts`
```typescript
interface FiltersState {
  // ... existentes
  nuevoFiltro: string;
}

// Agregar acción
setNuevoFiltro: (valor: string) => void;
```

**Paso 2:** Agregar en FiltersBar
```typescript
<Select
  label="Nuevo Filtro"
  value={nuevoFiltro}
  onChange={setNuevoFiltro}
  options={opciones}
/>
```

**Paso 3:** Usar en selectores
```typescript
function getSelectorConFiltro(data: AppData, filtros: Filtros) {
  let resultado = data.items;
  
  if (filtros.nuevoFiltro) {
    resultado = resultado.filter(
      item => item.campo === filtros.nuevoFiltro
    );
  }
  
  return resultado;
}
```

---

## 🎨 Convenciones de Código

### Nombres de Archivos
- Componentes: PascalCase (ej: `TopClientsTable.tsx`)
- Utilidades: camelCase (ej: `formatters.ts`)
- Tests: `*.test.ts`

### Imports
```typescript
// Orden de imports
import { useEffect } from 'react';           // 1. React
import type { AppData } from '@domain/types'; // 2. Tipos
import { sumBy } from '@domain/metrics';      // 3. Domain
import { getKPIs } from '@services/selectors'; // 4. Services
import { useFilters } from '@state/filters';  // 5. State
import { Card } from '@components/atoms/Card'; // 6. Components
import { formatCurrency } from '@utils/formatters'; // 7. Utils
```

### Formato de Funciones
```typescript
// ✅ Funciones puras en domain/
export function calculateMetric(a: number, b: number): number {
  return a + b;
}

// ✅ Selectores en services/
export function getMetrics(data: AppData, filtros: Filtros) {
  // Aplica filtros y calcula
  return resultado;
}

// ✅ Componentes
export function MiComponente({ prop1, prop2 }: Props) {
  return <div>{/* JSX */}</div>;
}
```

---

## 🚨 Reglas Críticas

### ⛔ NUNCA HACER

1. **Calcular en componentes**
   ```typescript
   // ❌ MAL
   function Tabla({ items }) {
     const total = items.reduce((a,b) => a + b.venta, 0);
   }
   ```

2. **Usar .reduce() para sumas**
   ```typescript
   // ❌ MAL
   const suma = values.reduce((a, b) => a + b, 0);
   
   // ✅ BIEN
   const suma = safeSum(values);
   ```

3. **Lógica de negocio en servicios**
   ```typescript
   // ❌ MAL (en selectors.ts)
   const total = clientes.reduce((a, b) => a + b.venta, 0);
   
   // ✅ BIEN (en selectors.ts)
   const total = sumBy(clientes, c => c.venta);
   ```

### ✅ SIEMPRE HACER

1. **Todas las sumas con safeSum/sumBy**
2. **Cálculos en domain/metrics.ts**
3. **Filtros en services/selectors.ts**
4. **Componentes solo presentación**
5. **Tipos explícitos en todo**

---

## 🧪 Testing

### Estructura de Tests

```typescript
// metrics.test.ts
describe('safeSum', () => {
  it('suma correctamente', () => {
    expect(safeSum([1, 2, 3])).toBe(6);
  });
  
  it('ignora NaN', () => {
    expect(safeSum([1, NaN, 3])).toBe(4);
  });
});

// selectors.test.ts
describe('getGlobalKPIs', () => {
  it('calcula venta total', () => {
    const kpis = getGlobalKPIs(mockData, filtros);
    expect(kpis.venta_total).toBe(expectedTotal);
  });
});
```

### Ejecutar Tests
```bash
npm test              # Ejecutar todos
npm test metrics      # Ejecutar metrics.test.ts
```

---

## 📊 Visualizaciones Disponibles

| Componente | Tipo | Datos | Interactividad |
|------------|------|-------|----------------|
| **CountryMixChart** | Pie/Donut | % venta por país | Clic → filtra por país |
| **CategoryBars** | Barras agrupadas | Venta/conversión por categoría | Clic → filtra categoría, Toggle venta/conv. |
| **ClientScatter** | Scatter plot | Potencial vs venta | Tooltip con detalles |
| **TopClientsTable** | Tabla | Top N clientes | Badges de alerta |
| **VendedoresBars** | Barras | Venta/conversión vendedor | Toggle venta/conv. |
| **VendedoresTable** | Tabla | Métricas por vendedor | Formato condicional |
| **ProgressBar** | Barra vertical | % conversión por país | Visual animado |

---

## 🔐 Seguridad (Demostrativa)

**Clave de acceso:** `CLIENTE-DEMO-2025`

**Archivo:** `src/domain/security.ts`

⚠️ **IMPORTANTE:** Esto es solo para demo. En producción se requiere:
- Backend con autenticación real
- JWT o OAuth
- Validación en servidor
- HTTPS obligatorio

---

## 🚀 Deploy

### Build para Producción
```bash
npm run build
```

Genera carpeta `dist/` con assets optimizados.

### Despliegue
- **Vercel/Netlify:** Drag & drop de `dist/`
- **Servidor estático:** nginx sirviendo `dist/`

**Configuración SPA:** Redirigir todas las rutas a `index.html`

---

## 📚 Referencias Rápidas

### Paths Configurados (tsconfig.json)
```typescript
'@domain/*'      → './src/domain/*'
'@services/*'    → './src/services/*'
'@components/*'  → './src/components/*'
'@state/*'       → './src/state/*'
'@utils/*'       → './src/utils/*'
```

### Colores Estándar
```typescript
Chile:  '#3b82f6' (blue-500)
Perú:   '#10b981' (green-500)
Danger: '#dc2626' (red-600)
Warning:'#ca8a04' (yellow-600)
```

### Umbrales
```typescript
UMBRAL_CONV_BAJA_CATEGORIA = 0.30
UMBRAL_CONV_BAJA_CLIENTE = 0.35
UMBRAL_CONCENTRACION_ROJO = 0.30
UMBRAL_CONCENTRACION_AMARILLO = 0.25
```

---

## 🤝 Contribución

Para agregar nuevas funcionalidades:

1. **Leer este documento completo**
2. **Seguir la arquitectura por capas**
3. **Usar safeSum/sumBy para sumas**
4. **Escribir tests para nueva lógica**
5. **Actualizar README.md con funcionalidad**
6. **Actualizar este documento si cambia arquitectura**

---

## 📞 Soporte

Para dudas sobre la arquitectura, consultar:
- Este documento (ARQUITECTURA.md)
- README.md (documentación de usuario)
- Código en `src/domain/metrics.ts` (funciones de cálculo)
- Código en `src/services/selectors.ts` (aplicación de filtros)

---

**Última actualización:** Versión con funcionalidad de vendedores y barras de progreso  
**Autor:** Dashboard Ejecutivo Team  
**Licencia:** Proyecto interno

