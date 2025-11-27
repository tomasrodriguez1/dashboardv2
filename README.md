# Dashboard Ejecutivo - Análisis de Ventas

Dashboard ejecutivo en React + Vite + TypeScript para evaluar la captura de ingreso potencial vs. venta por país, categoría y cliente.

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 20+
- npm o yarn

### Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Ejecutar tests
npm test
```

La aplicación estará disponible en `http://localhost:5173`

## 🔐 Acceso a la Aplicación

Al acceder por primera vez, se solicitará una **clave de acceso**:

```
CLIENTE-DEMO-2025
```

**IMPORTANTE:** Esta es una capa de seguridad **DEMOSTRATIVA**. La clave está hardcodeada en el código fuente (`src/domain/security.ts`) y solo sirve para propósitos de demostración. En producción se requeriría autenticación real con backend seguro.

El acceso se guarda en `sessionStorage` y permanece activo durante la sesión del navegador.

## 📊 Características

### KPIs Principales

- **Venta Total**: Suma de todas las ventas en el periodo (respeta filtros de país y categoría)
- **Ingreso Potencial Total**: Suma de todos los ingresos potenciales (respeta filtros de país y categoría)
- **% Conversión Global**: Venta / Ingreso Potencial
- **Conversión por País**: Chile vs Perú
- **% Participación**: Porcentaje que representa una parte del total. Se calcula como `Participación = Parte / Total`
  - Por ejemplo: Si Chile tiene ventas de $500 y el total es $700, su participación es 500/700 = 71.4%

**IMPORTANTE:** Cuando se aplica un filtro de categoría, los KPIs globales se recalculan basándose SOLO en las categorías seleccionadas. Esto significa:
- Si seleccionas "Face Drilling Rigs", el Ingreso Potencial Total será la suma del ingreso potencial de esa categoría en ambos países (o país seleccionado)
- La Venta Total será la suma de ventas de esa categoría únicamente
- El % de Conversión se calculará basándose en estos valores filtrados

### Visualizaciones

1. **Scorecards Globales** (Fila 1)
   - 4 tarjetas con KPIs principales
   - Formato condicional por color según umbrales

2. **Composición por País** (Fila 1)
   - Gráfico tipo donut/pie
   - % de participación de venta Chile vs Perú
   - Clic en país filtra las demás vistas

3. **Ventas por Categoría** (Fila 2)
   - Barras agrupadas por país
   - Toggle entre vista "Venta" y "% Conversión"
   - Clic en categoría filtra scatter y tabla

4. **Mapa de Oportunidades** (Fila 3)
   - Scatter plot: Ingreso Potencial (X) vs Venta (Y)
   - Color por país
   - ★ indica clientes Top N por potencial

5. **Tabla Top Clientes** (Fila 3)
   - Top N clientes por ingreso potencial
   - Columnas: País, Cliente, Ing. Potencial, Venta, % Conv., % Partic., Estado
   - Formato condicional con badges de alerta

6. **Performance por Vendedor** (Fila 4) 🆕
   - **Tabla de Vendedores**: Muestra métricas por vendedor
     - Columnas: Vendedor, País(es), Ing. Potencial, Venta, % Conv., Cantidad de Clientes, Estado
     - Formato condicional: alerta roja para baja conversión + alto potencial
     - Muestra en qué país(es) opera cada vendedor
   - **Gráfico de Barras por Vendedor**: 
     - Toggle entre vista "Venta" y "% Conversión"
     - Ranking visual de performance
   - **Respeta filtros globales**: Los KPIs de vendedores se recalculan según país y categoría seleccionados

### Filtros Globales

- **País**: Ambos / Chile / Perú
- **Categorías**: Multi-select (todas las categorías disponibles)
  - **IMPORTANTE**: Al seleccionar una o más categorías, los KPIs globales (Venta Total, Ingreso Potencial Total) se recalculan usando SOLO los datos de esas categorías
  - Ejemplo: Si seleccionas "Loaders", verás la venta e ingreso potencial exclusivamente de Loaders
- **Top N Clientes**: 5, 10, 15, 20, 25

Los filtros se guardan en `sessionStorage` y persisten durante la sesión.

**Interactividad:**
- Clic en un país en el gráfico de composición → filtra por ese país
- Clic en una categoría en el gráfico de barras → filtra por esa categoría
- Ambas acciones actualizan inmediatamente todos los KPIs, gráficos y tablas

### Reglas de Alerta

**Conversión Baja + Alto Potencial:**
- Cliente Top N con conversión < 35% → 🔴 Crítico
- Categoría con conversión < 30% y potencial >= p75 → 🔴 Crítico

**Concentración de Venta:**
- Categoría o cliente con > 30% de participación → 🔴 Alta concentración
- Categoría o cliente con > 25% y ≤ 30% → 🟡 Concentración moderada

## 🗂️ Estructura del Proyecto

```
dashboardv2/
├── public/                          # Archivos estáticos
│   ├── ventas_por_pais.csv         # Datos por país
│   ├── ventas_por_categoria.csv    # Datos por categoría
│   ├── ventas_por_clientes_peru.csv
│   └── ventas_por_cliente_chile.csv
│
├── src/
│   ├── domain/                      # 🧠 LÓGICA DE NEGOCIO
│   │   ├── types.ts                 # Tipos de dominio
│   │   ├── metrics.ts               # ⭐ FUNCIÓN safeSum y métricas
│   │   ├── thresholds.ts            # Umbrales y reglas de alerta
│   │   └── security.ts              # Clave de acceso hardcodeada
│   │
│   ├── services/                    # 📦 CAPA DE SERVICIOS
│   │   ├── dataLoader.ts            # Carga CSV con PapaParse
│   │   └── selectors.ts             # ⭐ Aplica filtros usando safeSum
│   │
│   ├── state/                       # 🔄 ESTADO GLOBAL
│   │   └── filters.store.ts         # Zustand store + sessionStorage
│   │
│   ├── utils/                       # 🛠️ UTILIDADES
│   │   └── formatters.ts            # Parseo y formateo de números
│   │
│   ├── components/                  # 🎨 COMPONENTES UI
│   │   ├── atoms/                   # Componentes básicos
│   │   ├── molecules/               # Componentes compuestos
│   │   ├── charts/                  # Gráficos con Recharts
│   │   └── tables/                  # Tablas con formato condicional
│   │
│   ├── app/                         # 🚪 APLICACIÓN
│   │   ├── pages/                   # Páginas
│   │   ├── layouts/                 # Layouts y guards
│   │   ├── App.tsx                  # Componente raíz
│   │   └── routes.tsx               # Configuración de rutas
│   │
│   ├── tests/                       # 🧪 TESTS
│   │   ├── metrics.test.ts
│   │   └── selectors.test.ts
│   │
│   ├── main.tsx                     # Punto de entrada
│   └── app.css                      # Estilos globales Tailwind
│
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## 🏗️ Arquitectura y Principios SOLID

### Separación de Capas

1. **Domain** (`src/domain/`)
   - Contiene la lógica de negocio pura
   - No depende de React ni del DOM
   - Define tipos, métricas y reglas

2. **Services** (`src/services/`)
   - Carga y transforma datos
   - Aplica filtros y calcula KPIs
   - Usa exclusivamente las funciones de `domain/metrics.ts`

3. **State** (`src/state/`)
   - Gestiona el estado global de filtros
   - Persistencia en sessionStorage

4. **Components** (`src/components/`)
   - Solo presentación y UI
   - Reciben datos ya calculados
   - No realizan cálculos de negocio

### ⭐ Función de Suma Segura

**REGLA CRÍTICA:** Todas las agregaciones numéricas usan `safeSum` o `sumBy`.

**Ubicación:** `src/domain/metrics.ts`

```typescript
// ✅ CORRECTO
const total = sumBy(clientes, c => c.venta);

// ❌ PROHIBIDO en lógica de negocio
const total = clientes.reduce((a, b) => a + b.venta, 0);
```

**Implementación:**
- Algoritmo de Kahan para minimizar errores de punto flotante
- Ignora valores `null`, `undefined`, `NaN`
- Trata valores no numéricos como 0

**Funciones principales:**
- `safeSum(values: number[])`
- `sumBy<T>(items: T[], selector: (item: T) => number)`
- `conversion(venta, potencial)`
- `participation(part, total)`
- `percentile75(values)`
- `topNBy<T>(items, selector, n)`

### Flujo de Datos

```
CSV → dataLoader.ts → selectors.ts → Componentes
     (PapaParse)    (safeSum/sumBy)   (presentación)
```

1. **Carga:** `dataLoader.ts` lee CSV y normaliza a tipos de dominio
2. **Cálculo:** `selectors.ts` aplica filtros y usa `safeSum/sumBy`
3. **Presentación:** Componentes reciben datos calculados y los muestran

### Principios SOLID Aplicados

- **Single Responsibility:** Cada módulo tiene una única responsabilidad
- **Open/Closed:** Componentes extensibles por props sin modificar código
- **Liskov Substitution:** Tipos claros, props predecibles
- **Interface Segregation:** Hooks y funciones específicas
- **Dependency Inversion:** Componentes dependen de interfaces, no implementaciones

## 📁 Formato de CSV

### ventas_por_pais.csv

```csv
Pais,Ing Potencial,Venta acumulada,% Participación
Peru,13.654.935,2.434.069,18%
Chile,44.194.368,19.144.928,43%
```

### ventas_por_categoria.csv

```csv
Categoria,Ing Potencial Chile,Ing Potencial Peru,Venta acumulada Chile,Venta acumulada Peru
Loaders,12.080.880,1.670.760,4.552.741,274.911
```

### ventas_por_clientes_peru.csv

```csv
Clientes,Ing Potencial,Venta acumulada,%
ANKOST PERU S.A.,1.252.125,184.766,15%
```

### ventas_por_cliente_chile.csv

```csv
Clientes,Ing Potencial,Venta acumulada,Porcentaje,Vendedor
Geovita,9.374.593,3.603.505,38%,Pablo Gálvez
```

**Columna Vendedor:** Indica el vendedor responsable de cada cliente

**Formato:**
- Números con `.` como separador de miles: `"13.654.935"`
- Porcentajes con símbolo `%`: `"18%"`
- Vendedor: texto simple, nombre del vendedor
- Se parsean con `parseLocaleNumber()` y `parsePercent()`

**Nota:** Los archivos CSV de clientes (Chile y Perú) incluyen una columna `Vendedor` que se usa para calcular métricas por vendedor en la sección de Performance.

## 🧪 Tests

Los tests se ejecutan con Vitest:

```bash
npm test
```

### Cobertura de Tests

1. **metrics.test.ts**
   - Prueba `safeSum` con valores grandes, null, NaN
   - Prueba `conversion`, `participation`
   - Compara suma naïve vs `safeSum`

2. **selectors.test.ts**
   - Prueba consistencia de sumas con filtros
   - Verifica que gráficos devuelvan datos correctos

## 🛠️ Stack Tecnológico

- **React 18** - Librería UI
- **Vite 5** - Build tool y dev server
- **TypeScript 5** - Tipado estático
- **React Router 6** - Routing y navegación
- **Zustand 4** - Estado global ligero
- **Recharts 2** - Gráficos declarativos
- **PapaParse 5** - Parser de CSV
- **Tailwind CSS 3** - Utilidades CSS
- **Vitest 2** - Framework de testing

## 📦 Build y Deploy

### Build de Producción

```bash
npm run build
```

Genera una carpeta `dist/` con assets estáticos optimizados.

### Deploy

El proyecto es una SPA completamente estática. Puede deployarse en:

- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop de la carpeta `dist/`
- **GitHub Pages**: Copiar `dist/` a la rama `gh-pages`
- **Servidor estático**: Servir la carpeta `dist/` con nginx o similar

**Configuración para SPA routing:**

Asegurarse de que el servidor redirija todas las rutas a `index.html` para que React Router funcione.

### Deploy en Render

El repositorio incluye un archivo `render.yaml` que describe un servicio **Static Site** listo para Render:

1. Vincula el repositorio en [Render](https://render.com/) y permite que detecte el `render.yaml`.
2. Render ejecutará `npm install && npm run build` (definido en el archivo) y publicará la carpeta `dist/`.
3. La regla de `routes` ya redirige cualquier ruta (`/*`) a `index.html`, indispensable para React Router.
4. Ajusta el `name` del servicio en `render.yaml` si necesitas diferenciar entornos.

Cada vez que hagas push a `main`, Render reconstruirá automáticamente el sitio con los datos contenidos en `public/`.

## 🔒 Seguridad

**ADVERTENCIA:** La capa de seguridad actual es **SOLO DEMOSTRATIVA**.

- La clave está hardcodeada en el código fuente
- No hay validación en backend
- Cualquiera con acceso al código puede ver la clave

**Para producción real se requiere:**
- Backend con autenticación (JWT, OAuth, etc.)
- Validación de sesión en servidor
- HTTPS obligatorio
- Rate limiting
- Auditoría de accesos

## 🤝 Contribución

Para añadir nuevas funcionalidades:

1. **Nuevas métricas:** Añadir en `src/domain/metrics.ts` usando `safeSum`
2. **Nuevos filtros:** Añadir en `src/state/filters.store.ts`
3. **Nuevos selectores:** Añadir en `src/services/selectors.ts`
4. **Nuevos componentes:** Seguir estructura atoms/molecules/organisms
5. **Nuevas páginas:** Añadir en `src/app/pages/` y actualizar `routes.tsx`

## 📄 Licencia

Proyecto interno para análisis de ventas.

## 📞 Soporte

Para consultas o problemas, contactar al equipo de desarrollo.

