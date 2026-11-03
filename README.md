# Tech Service - Sistema de Gestión de Tickets

Frontend de una aplicación web para gestionar un taller de diagnóstico y reparación de celulares, computadores, impresoras, televisores y monitores.

**Cliente → equipo → orden de servicio → diagnóstico → presupuesto y autorización → reparación → entrega.**

---

## Guía de Desarrollo de Módulos

### TODOS INCLUSIVE CLIENTE

#### 1. Login y Consulta Cliente

---

### ADMÓN. – RECEPCIÓN (módulos independientes)

#### 2. Administración de Usuarios
- CRUD completo
- Estado: activo/inactivo
- Icono de papelera para eliminar
- Botón "Crear nuevo usuario" al lado del filtro

#### 3. Lista de Clientes
- CRUD completo
- Historial de tickets

#### 4. Repuestos e Inventario
- CRUD completo
- Lista, consulta y filtro
- Estados: agotados

---

### RECEPCIÓN (módulo recepción)

#### 5. Cotización Inicial
- Reparación rápida
- Costo de diagnóstico

#### 6. Búsqueda de Cliente
- Por teléfono, ID o nombre

#### 7. Registro de Dispositivos
- Accesorios
- Casillero

#### 8. Ticket
- Estado inicial

---

### TODOS (Módulo Tickets)

#### 9. Consulta de Órdenes
- Filtrar por: cliente, técnico, estado o fechas
- Reportes: resumen de tickets (cantidad/estado)
- Código de colores
- Detalle ticket
- Panel general
- Panel solo ID técnico
- Asignar técnico
- Cambio de asignación
- Lista de órdenes por técnico

---

### TÉCNICO – RECEPCIÓN (integrado acorde a los módulos)

#### 10. Estado de Ticket
- Estados posibles:
  - Recibido
  - En diagnóstico
  - Pendiente de autorización
  - En reparación
  - Reparado
  - No reparable
  - Listo para entregar
  - Entregado
- Fecha y encargado

---

### TÉCNICO – RECEPCIÓN (Módulo Operación)

#### 11. Diagnóstico
- Detalle

#### 12. Relación Ticket/Repuesto
- Acceso a catálogo
- Cambio de cantidades automático

#### 13. Reparación
- Detalle
- Fecha
- Historial

#### 14. Pruebas Finales

---

### MÓDULO ATC

#### 15. Registro de Aprobación Cliente

---

### MÓDULO CAJA

#### 16. Pagos
- Abonos/saldos
- Fecha
- Ticket

#### 17. Entrega
- Fecha
- Condiciones
- Cambio de estado

---

### CLIENTE (Módulo Consulta Cliente)

#### 18. Consulta Clientes
- Info para consulta: ID + Ticket
- Último registro
- Solo cliente

---

## Alcance de esta etapa

Por ahora, el trabajo se limita al **frontend**:

- Construir y organizar las páginas y componentes de interfaz.
- Implementar navegación, formularios, tablas, tarjetas, filtros y estados visuales.
- Usar datos de ejemplo para demostrar interacciones mientras no exista una API.
- Mantener la interfaz adaptable a escritorio, tablet y móvil.

No se incluye en esta etapa un backend, base de datos, persistencia, autenticación real, control de permisos del servidor, pagos reales ni envío de notificaciones.

---

## Usuarios y módulos previstos

| Usuario | Necesidades principales |
| --- | --- |
| Administrador | Consultar el panel y administrar usuarios. |
| Recepcionista / asesor | Registrar clientes, equipos y órdenes; preparar la entrega. |
| Técnico | Consultar órdenes y mostrar diagnóstico, actividades y resultado. |
| Supervisor | Revisar la carga de trabajo y el estado de las órdenes. |
| Cliente | Consultar el estado de una orden propia. |

---

## Tecnologías

- [Astro](https://astro.build/) 7.x con componentes `.astro`.
- TypeScript en modo estricto, mediante la configuración de Astro.
- Bootstrap 5 para estilos y comportamiento responsive; los estilos están incluidos en `src/styles/`.
- Bootstrap Icons para iconografía.
- Node.js `>=22.12.0`.

---

## Requisitos e inicio local

Instala Node.js `>=22.12.0` y npm. Desde la raíz del repositorio:

```bash
npm install
npm run dev
```

Astro estará disponible normalmente en `http://localhost:4321`.

| Comando | Acción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Valida y genera el sitio en `dist/`. |
| `npm run preview` | Sirve localmente la compilación. |
| `npm run astro -- <comando>` | Ejecuta un comando de la CLI de Astro. |

---

## Estado y rutas actuales

Las rutas Astro se generan desde `src/pages/`.

| Ruta | Archivo | Estado general |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Dashboard inicial con datos de ejemplo. |
| `/login` | `src/pages/login.astro` | Maqueta de acceso del personal. |
| `/recepcion` | `src/pages/recepcion.astro` | Módulo de recepción. |
| `/clientes` | `src/pages/clientes.astro` | Gestión de clientes. |
| `/ordenes` | `src/pages/ordenes.astro` | Lista de órdenes. |
| `/facturacion` | `src/pages/facturacion.astro` | Módulo de facturación. |
| `/reparacion` | `src/pages/reparacion.astro` | Proceso de reparación. |
| `/admin` | `src/pages/admin.astro` | Gestión de usuarios. |

---

## Organización actual

```text
src/
├── components/     # Piezas Astro reutilizables: formularios, botones, tablas y tarjetas
│   └── admin/      # Segmentos independientes de la página /admin (KPIs, filtros, tabla)
├── data/           # Tipos y funciones de conteo del módulo admin (sin datos fijos)
├── layouts/        # Estructura de página compartida (Dashboard.astro)
├── pages/          # Rutas y pantallas de la aplicación
├── scripts/        # JavaScript de cliente procesado por Astro (empaquetado con hash)
├── styles/         # Bootstrap y estilos/iconos locales
└── assets/         # Recursos procesados por Astro
public/             # Archivos estáticos servidos sin transformación (incluye JS de Bootstrap)
```

---

## Avance registrado

> Resumen para retomar el trabajo desde otra máquina. **Última actualización: 2 de noviembre de 2026.**

### 1. Página `/admin` dividida en componentes independientes

`src/pages/admin.astro` dejó de ser un archivo de ~180 líneas: ahora **solo contiene los datos de ejemplo y compone tres componentes**. Cada segmento de la interfaz se edita en su propio archivo:

| Archivo | Responsabilidad | Líneas aprox. |
| --- | --- | --- |
| `src/pages/admin.astro` | Datos de prototipo (usuarios, roles, estados) + composición | 66 |
| `src/components/admin/MetricasUsuarios.astro` | Fila de tarjetas de métricas (KPIs) | 34 |
| `src/components/admin/BarraFiltros.astro` | Selectores de rol/estado + botón "Nuevo usuario" | 30 |
| `src/components/admin/TablaUsuarios.astro` | Tabla de usuarios con filas generadas por `.map()` | 135 |
| `src/data/admin.ts` | Interfaces `Usuario` / `Metrica` + `calcularMetricas()` | 57 |
| `src/scripts/adminEstados.js` | Lógica de los switches de estado en el navegador | 124 |

**Regla de trabajo:** los datos se declaran únicamente en `admin.astro` y se pasan por props; todos los componentes aceptan props con valores por defecto, por lo que también funcionan aislados.

### 2. Métricas automáticas derivadas de la tabla

- `calcularMetricas(usuarios)` genera: **Usuarios totales** (`length`), **Usuarios activos** (`filter` por estado) y **una tarjeta por cada rol distinto** detectado en la lista (plural simple).
- **No hay configuración de roles**: si se agrega un usuario con `rol: "Tecnico"`, aparece sola la tarjeta *Tecnicos* **y** la opción `Tecnico` en el filtro de rol. Al vaciar la lista quedan dos tarjetas en `0` y la tabla muestra "Sin registros."
- Sin íconos ni colores en las tarjetas: sólo número y texto (decisión de diseño para mantener la automatización sin metadatos).

### 3. Switch Activo/Inactivo en la columna Estado

- `form-switch` de Bootstrap con punto + texto verde/rojo (sustituye el indicador estático).
- **Confirmación** al desactivar (`confirm`), con reversión si se cancela.
- **Bloqueo de auto-desactivación**: la fila marcada con `esTu: true` se renderiza `disabled` con tooltip *"No puedes desactivar tu propia cuenta"*.
- **Persistencia** en `localStorage` con clave `admin:estados:v1` e identidad de fila `email|rol` (resiste correos repetidos en los datos de ejemplo).
- **KPIs recalculados desde el DOM** al alternar cualquier estado (la tarjeta "Usuarios activos" baja/sube en pantalla).

### 4. Accesibilidad y estructura compartida (`Dashboard.astro`)

- El menú se mantiene como `<nav>` (landmark de navegación; se descartó `<aside>`, que declararía contenido complementario).
- `<nav>` con `aria-label="Menú principal"` y `tabindex="-1"` (requisito de Bootstrap para que el foco entre al offcanvas en móvil).
- `Hamburguesa.astro`: de `<a>` sin `href` (no enfocable) a `<button>` con `aria-controls` y `aria-label`.
- JS de Bootstrap: `<script is:inline src="/js/bootstrap.bundle.min.js">` al final del `<body>` en `Dashboard.astro` y `login.astro` — es el patrón documentado de Astro para archivos en `public/` (sin `is:inline` Astro intentaría procesarlo como archivo del proyecto). CSS y JS están ambos en **v5.3.8**.

### 5. Verificación realizada

- `npm run build` → **8 páginas sin errores** (TypeScript estricto).
- Pruebas automáticas con Chrome headless contra el dev server: confirmación + reversión, desactivar/activar con recálculo de KPIs, guardado y restauración en `localStorage`, y ejecución del script en `/admin` **sin errores de consola**.

**Checklist manual al retomar:** `npm install` → `npm run dev` → abrir `/admin` → desactivar un usuario (aparece confirmación, contador baja) → `F5` (el estado persiste) → verificar que la fila propia (`esTu`) esté bloqueada.

### 6. Pendiente / conocido

- Sin backend: los cambios de estado viven en el navegador. Para reiniciar: borrar `admin:estados:v1` del Local Storage o usar ventana incógnita.
- Los datos de ejemplo repiten correos y nombres; la identidad de fila es `email|rol`, por lo que dos usuarios con el mismo correo **y** el mismo rol compartirían estado.
- `pluralizar()` usa regla simple (`+s` / `+es`): no cubre plurales irregulares.
- Los filtros y el botón "Nuevo usuario" son visuales: aún no filtran ni crean registros (falta JS de filtrado y CRUD).
- Para llevar los cambios a otra PC hay que **commitear y hacer push** (o copiar el directorio completo).

---

## Criterios de interfaz

- Textos en español y etiquetas comprensibles para personal del taller y clientes.
- Bootstrap para grillas, formularios, tablas, botones, navegación y utilidades.
- Formularios con etiquetas asociadas, campos requeridos señalados y mensajes claros de validación.
- Tablas y tarjetas legibles en pantallas pequeñas; utiliza patrones responsive de Bootstrap.
- Mantener navegación por teclado, foco visible, contraste adecuado y estructura semántica.
- Mantener coherencia en nombres y estados de órdenes: recibido, en diagnóstico, pendiente de autorización, en reparación, reparado/listo para entrega y entregado.

---

## Validación

Ejecuta la compilación de Astro antes de entregar cambios:

```bash
npm run build
```

Revisa las páginas afectadas en escritorio y móvil y comprueba que no existan enlaces rotos.
