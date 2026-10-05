# Thec Service

Sistema web de recepción de servicios técnicos: acceso de personal y consulta de estado de órdenes por parte de clientes.

## Stack tecnológico

- [Astro](https://astro.build) 7.3.5 (salida estática)
- Bootstrap 5 (CSS/JS incluidos manualmente, sin npm)
- JavaScript vanilla (sin frameworks de UI)
- Node.js >= 22.12.0

## Requisitos

- Node.js >= 22.12.0
- npm

## Comandos

Todos los comandos se ejecutan desde la raíz del proyecto:

| Comando              | Acción                                          |
| :------------------- | :---------------------------------------------- |
| `npm install`        | Instala las dependencias                        |
| `npm run dev`        | Servidor de desarrollo en `localhost:4321`      |
| `npm run build`      | Genera el sitio de producción en `./dist/`      |
| `npm run preview`    | Vista previa local del build                    |
| `npm run astro ...`  | Comandos de la CLI de Astro                     |

Para el servidor de desarrollo se recomienda `astro dev --background` y gestionarlo con `astro dev stop`, `astro dev status` y `astro dev logs` (ver `AGENTS.md`).

## Estructura del proyecto

```text
/
├── public/            # Archivos estáticos servidos tal cual
│   ├── js/            # Bootstrap bundle + login.js
│   └── favicon.*
├── src/
│   ├── assets/        # SVG usados por componentes
│   ├── components/    # LoginCard.astro, ConsultaCard.astro, Welcome.astro
│   ├── layouts/       # Layout.astro (HTML base + Bootstrap)
│   ├── pages/         # index.astro (página principal)
│   └── styles/        # Archivos CSS de Bootstrap
├── astro.config.mjs
├── package.json
└── dist/              # Salida del build (generada, no se versiona)
```

## Funcionalidades actuales

- **Acceso al Personal** (`src/components/LoginCard.astro` + `public/js/login.js`): formulario con validación de Bootstrap. Credenciales de prueba: `recepcion1/1234`, `admin/admin`. Redirige a `/recepcion`.
- **Panel de Recepción** (`src/pages/recepcion.astro`): acceso a nueva orden, listado de órdenes y cierre de sesión.
- **¿Eres cliente?** (`src/components/ConsultaCard.astro`): enlace "Consultar Orden" → `/consulta` (página pendiente).

## Mapa de navegación

| Ruta | Página | Quién la usa | Estado |
|------|--------|--------------|--------|
| `/` | Login personal / Consulta cliente | Todos | ✅ |
| `/recepcion` | Panel de recepción | Personal recepción/admin | ✅ |
| `/recepcion/nueva-orden` | Registrar nueva orden de servicio | Recepción | ❌ Pendiente |
| `/recepcion/ordenes` | Listado/búsqueda de órdenes | Recepción | ❌ Pendiente |
| `/consulta` | Consulta de estado de orden para clientes | Clientes | ❌ Pendiente |

## Pendientes conocidos

- Crear `/recepcion/nueva-orden` y `/recepcion/ordenes`.
- Implementar la consulta de órdenes de clientes (`/consulta`).
- Reemplazar las credenciales hardcodeadas por autenticación real.

## Registro de cambios

Al realizar un cambio con impacto en la funcionalidad o estructura del código, agregar una entrada con fecha, descripción corta y archivos afectados.
