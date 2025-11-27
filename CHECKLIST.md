# Checklist de Verificación del Dashboard

## ✅ Estructura del Proyecto

- [x] Carpeta raíz es `dashboardv2/`
- [x] Archivos CSV están en `dashboardv2/public/`
- [x] Estructura de carpetas sigue el patrón domain/services/state/app/components
- [x] Todos los archivos TypeScript tienen extensión `.ts` o `.tsx`

## ✅ Configuración

- [x] `package.json` con todas las dependencias necesarias
- [x] `vite.config.ts` configurado con aliases de rutas
- [x] `tsconfig.json` configurado con paths absolutos
- [x] `tailwind.config.js` configurado
- [x] `vitest.config.ts` configurado para tests

## ✅ Capa de Dominio (domain/)

- [x] `types.ts` - Todos los tipos de dominio definidos
- [x] `metrics.ts` - Función `safeSum` implementada con algoritmo Kahan
- [x] `metrics.ts` - Función `sumBy` implementada
- [x] `metrics.ts` - Funciones de conversión, participación, percentil, topN
- [x] `thresholds.ts` - Todos los umbrales configurables definidos
- [x] `security.ts` - Clave hardcodeada y funciones de acceso

## ✅ Utilidades (utils/)

- [x] `formatters.ts` - `parseLocaleNumber` implementado
- [x] `formatters.ts` - `parsePercent` implementado
- [x] `formatters.ts` - Funciones de formateo (formatNumber, formatPercent, etc.)

## ✅ Servicios (services/)

- [x] `dataLoader.ts` - Carga de CSV con PapaParse
- [x] `dataLoader.ts` - Normalización de datos de países
- [x] `dataLoader.ts` - Normalización de datos de categorías (2 registros por fila)
- [x] `dataLoader.ts` - Normalización de datos de clientes Chile y Perú
- [x] `dataLoader.ts` - Función `loadAllData()` que carga todo
- [x] `dataLoader.ts` - Validación de esquema de datos
- [x] `selectors.ts` - Usa EXCLUSIVAMENTE safeSum/sumBy
- [x] `selectors.ts` - `getGlobalKPIs` implementado
- [x] `selectors.ts` - `getCountryKPIs` implementado
- [x] `selectors.ts` - `getCategorySeries` implementado
- [x] `selectors.ts` - `getClientScatterData` implementado
- [x] `selectors.ts` - `getTopClients` implementado

## ✅ Estado Global (state/)

- [x] `filters.store.ts` - Store de Zustand configurado
- [x] `filters.store.ts` - Persistencia en sessionStorage
- [x] `filters.store.ts` - Filtros: pais, categorias, topN

## ✅ Componentes (components/)

### Atoms
- [x] `Button.tsx` - Con variantes y tamaños
- [x] `Card.tsx` - Con CardHeader, CardTitle, CardContent
- [x] `Select.tsx` - Selector dropdown
- [x] `Badge.tsx` - Con colores y tamaños
- [x] `KPIStat.tsx` - Tarjeta de KPI
- [x] `Input.tsx` - Input con label y error

### Molecules
- [x] `FiltersBar.tsx` - Barra de filtros globales
- [x] `SegmentedControl.tsx` - Toggle entre opciones
- [x] `Legend.tsx` - Leyenda para gráficos

### Charts
- [x] `CountryMixChart.tsx` - Gráfico pie/donut con Recharts
- [x] `CategoryBars.tsx` - Barras agrupadas con toggle venta/conversión
- [x] `ClientScatter.tsx` - Scatter plot con tooltips completos

### Tables
- [x] `TopClientsTable.tsx` - Tabla con formato condicional
- [x] `TopClientsTable.tsx` - Badges de alerta según umbrales

## ✅ Páginas (app/pages/)

- [x] `AccessGate.tsx` - Pantalla de clave hardcodeada
- [x] `AccessGate.tsx` - Validación y redirección
- [x] `DashboardPage.tsx` - Layout de 3 filas
- [x] `DashboardPage.tsx` - Fila 1: 4 KPI cards + CountryMixChart
- [x] `DashboardPage.tsx` - Fila 2: CategoryBars
- [x] `DashboardPage.tsx` - Fila 3: ClientScatter + TopClientsTable
- [x] `DashboardPage.tsx` - Loading state
- [x] `DashboardPage.tsx` - Error state

## ✅ Routing (app/)

- [x] `MainLayout.tsx` - Guard de autenticación
- [x] `routes.tsx` - React Router configurado
- [x] `routes.tsx` - Ruta `/access` para AccessGate
- [x] `routes.tsx` - Ruta `/` protegida para Dashboard
- [x] `App.tsx` - RouterProvider configurado

## ✅ Estilos

- [x] `app.css` - Tailwind imports
- [x] `app.css` - Estilos globales
- [x] Formato condicional en KPIs (colores según umbral)
- [x] Formato condicional en tabla (filas rojas/amarillas)
- [x] Formato condicional en gráficos (estrellas para Top N)

## ✅ Tests

- [x] `vitest.config.ts` configurado
- [x] `metrics.test.ts` - Tests de safeSum
- [x] `metrics.test.ts` - Tests con valores grandes, null, NaN
- [x] `metrics.test.ts` - Comparación con reduce naïve
- [x] `selectors.test.ts` - Tests de consistencia de sumas
- [x] `selectors.test.ts` - Tests de filtros

## ✅ Documentación

- [x] `README.md` - Instrucciones de instalación y ejecución
- [x] `README.md` - Formato de CSV explicado
- [x] `README.md` - Arquitectura y principios SOLID
- [x] `README.md` - Ubicación de cálculos (metrics.ts) y selectores
- [x] `README.md` - Aclaración sobre seguridad demostrativa

## ✅ Reglas de Negocio

- [x] NO hay `.reduce((a, b) => a + b, 0)` en lógica de negocio
- [x] Todas las sumas usan `safeSum` o `sumBy`
- [x] Formato condicional: conversión < 30% + alto potencial → rojo
- [x] Formato condicional: cliente Top N con conversión < 35% → rojo
- [x] Formato condicional: concentración > 30% → rojo
- [x] Formato condicional: concentración > 25% y ≤ 30% → amarillo

## ✅ Funcionalidades

- [x] Access Gate con clave hardcodeada funciona
- [x] Persistencia de acceso en sessionStorage
- [x] Carga de CSV desde public/
- [x] Parseo correcto de números con puntos como separadores
- [x] Parseo correcto de porcentajes con %
- [x] Filtros globales: país, categorías, topN
- [x] Filtros persisten en sessionStorage
- [x] Clic en país filtra otras vistas
- [x] Clic en categoría filtra scatter y tabla
- [x] Tooltips completos en todos los gráficos
- [x] Responsive design con Tailwind Grid

## 🚀 Para Ejecutar

```bash
cd dashboardv2
npm install
npm run dev
```

Clave de acceso: `CLIENTE-DEMO-2025`

## 🔨 Para Build

```bash
npm run build
```

## 🧪 Para Tests

```bash
npm test
```

