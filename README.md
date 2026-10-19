# Thec Service

Frontend de una aplicación web para gestionar un taller de diagnóstico y reparación de celulares, computadores, impresoras, televisores y monitores. La interfaz busca acompañar el ciclo de servicio:

**Cliente → equipo → orden de servicio → diagnóstico → presupuesto y autorización → reparación → entrega.**

## Alcance de esta etapa

Por ahora, el trabajo se limita al **frontend**:

- Construir y organizar las páginas y componentes de interfaz.
- Implementar navegación, formularios, tablas, tarjetas, filtros y estados visuales.
- Usar datos de ejemplo para demostrar interacciones mientras no exista una API.
- Mantener la interfaz adaptable a escritorio, tablet y móvil.

No se incluye en esta etapa un backend, base de datos, persistencia, autenticación real, control de permisos del servidor, pagos reales ni envío de notificaciones. Las pantallas que representen estas funciones serán prototipos de interfaz; no deben presentar datos de ejemplo como información persistida o transacciones reales.

## Usuarios y módulos previstos

| Usuario | Necesidades principales |
| --- | --- |
| Administrador | Consultar el panel y administrar usuarios. |
| Recepcionista / asesor | Registrar clientes, equipos y órdenes; preparar la entrega. |
| Técnico | Consultar órdenes y mostrar diagnóstico, actividades y resultado. |
| Supervisor | Revisar la carga de trabajo y el estado de las órdenes. |
| Cliente | Consultar el estado de una orden propia. |

El MVP de interfaz prioriza acceso visual, recepción, clientes, equipos, órdenes, diagnóstico y reparación, presupuesto/autorización, entrega y consulta del estado. Inventario avanzado, reportes detallados, auditoría y notificaciones quedan para iteraciones posteriores.

## Tecnologías

- [Astro](https://astro.build/) 7.x con componentes `.astro`.
- TypeScript en modo estricto, mediante la configuración de Astro.
- Bootstrap 5 para estilos y comportamiento responsive; los estilos están incluidos en `src/styles/`.
- Bootstrap Icons para iconografía.
- Node.js `>=22.12.0`.

No se utiliza actualmente un framework de componentes cliente. Mantén la solución en Astro y TypeScript; agrega JavaScript de navegador solo cuando la interacción de la interfaz lo requiera.

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

Antes de proponer una dependencia nueva, revisa si Astro, TypeScript o Bootstrap ya cubren la necesidad.

## Estado y rutas actuales

Las rutas Astro se generan desde `src/pages/`. Las páginas existentes son el punto de partida, no una indicación de que todos los flujos estén terminados.

| Ruta | Archivo | Estado general |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Dashboard inicial con datos de ejemplo. |
| `/inicio` | `src/pages/inicio.astro` | Vista inicial alternativa en construcción. |
| `/login` | `src/pages/login.astro` | Maqueta de acceso del personal y entrada a consulta de cliente. |
| `/recepcion` | `src/pages/recepcion.astro` | Página creada, contenido pendiente. |
| `/ordenes/todos` | `src/pages/ordenes/todos.astro` | Contenedor de lista por categorías. |
| `/ordenes/impresoras` | `src/pages/ordenes/impresoras.astro` | Página de órdenes por categoría. |
| `/ordenes/monitores` | `src/pages/ordenes/monitores.astro` | Página de órdenes por categoría. |
| `/ordenes/moviles` | `src/pages/ordenes/moviles.astro` | Página de órdenes por categoría. |
| `/ordenes/otros` | `src/pages/ordenes/otros.astro` | Página de órdenes por categoría. |
| `/ordenes/pc` | `src/pages/ordenes/pc.astro` | Página de órdenes por categoría. |

Las pantallas de clientes, administración de usuarios, facturación, detalle/seguimiento de reparación y consulta pública requieren implementación o revisión. Verifica que los enlaces del menú correspondan a rutas existentes antes de dar por terminada una pantalla.

## Organización actual

```text
src/
├── components/     # Piezas Astro reutilizables: formularios, botones, tablas y tarjetas
├── layouts/        # Estructura de página compartida, incluido AppLayout.astro
├── pages/          # Rutas y pantallas de la aplicación
├── styles/         # Bootstrap y estilos/iconos locales
└── assets/         # Recursos procesados por Astro
public/             # Archivos estáticos servidos sin transformación
```

Usa componentes reutilizables para elementos comunes, props tipadas y los patrones existentes del repositorio. Evita duplicar layouts, inventar rutas sin conectarlas al menú o añadir reglas de negocio que pertenezcan al futuro backend.

## Criterios de interfaz

- Textos en español y etiquetas comprensibles para personal del taller y clientes.
- Bootstrap para grillas, formularios, tablas, botones, navegación y utilidades.
- Formularios con etiquetas asociadas, campos requeridos señalados y mensajes claros de validación.
- Tablas y tarjetas legibles en pantallas pequeñas; utiliza patrones responsive de Bootstrap.
- Mostrar estados de carga, vacío, error y éxito cuando la pantalla los necesite, sin simular guardado persistente.
- Mantener navegación por teclado, foco visible, contraste adecuado y estructura semántica.
- Mantener coherencia en nombres y estados de órdenes: recibido, en diagnóstico, pendiente de autorización, en reparación, reparado/listo para entrega y entregado.

## Backlog frontend

Las issues de GitHub son las tarjetas de trabajo para esta etapa. Las nuevas tarjetas desglosan en tareas de interfaz las issues generales ya existentes; siguen siendo responsabilidad del mismo módulo y **no** incorporan backend.

| Issue | Trabajo frontend |
| --- | --- |
| [#27](https://github.com/canarvaz/PROYECTOHTML/issues/27) | Layout compartido y navegación responsiva. |
| [#28](https://github.com/canarvaz/PROYECTOHTML/issues/28) | Dashboard con resumen de órdenes. |
| [#29](https://github.com/canarvaz/PROYECTOHTML/issues/29) | Acceso visual y consulta pública de estado. |
| [#30](https://github.com/canarvaz/PROYECTOHTML/issues/30) | Formulario de recepción de equipos. |
| [#31](https://github.com/canarvaz/PROYECTOHTML/issues/31) | Vistas de clientes e historial de servicios. |
| [#32](https://github.com/canarvaz/PROYECTOHTML/issues/32) | Listado y detalle de órdenes. |
| [#33](https://github.com/canarvaz/PROYECTOHTML/issues/33) | Diagnóstico y reparación para técnicos. |
| [#34](https://github.com/canarvaz/PROYECTOHTML/issues/34) | Administración visual de usuarios y roles. |
| [#35](https://github.com/canarvaz/PROYECTOHTML/issues/35) | Presupuesto, autorización y entrega. |
| [#36](https://github.com/canarvaz/PROYECTOHTML/issues/36) | Accesibilidad y responsive de pantallas MVP. |

Cada issue incluye criterios de aceptación de interfaz y define los servicios reales excluidos. El documento funcional original propone un MVP; inventario avanzado, analítica, exportaciones y notificaciones quedan para etapas posteriores.

## Validación

Ejecuta la compilación de Astro antes de entregar cambios:

```bash
npm run build
```

Revisa las páginas afectadas en escritorio y móvil y comprueba que no existan enlaces rotos. No hay actualmente un comando de pruebas automatizadas definido en `package.json`.
