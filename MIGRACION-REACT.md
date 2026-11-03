# Migración Astro → Vite + React (TypeScript)

> Resumen de decisiones y plan para retomar el trabajo desde otra PC.
> Fecha de las decisiones: 2 de noviembre de 2026.
> Proyecto origen: este repositorio (`PROYECTOHTML`, Astro 7, 8 páginas).
> **El nuevo proyecto vivirá en un repo aparte (propuesta: `tech-service-react`).**

---

## 1. Contexto y motivación (por qué se migra)

- Se está aprendiendo; ya se aprovechó bien Astro.
- Las tareas van creciendo en complejidad/automatización (ej. los switches de estado de `/admin`) y se quiere **migrar antes de que se vuelva caótico**.
- Argumento de carrera: seguir la ruta profesional estándar **React + Vite (SPA estática) e ir agregando tecnología según la complejidad**, sin quedarse atrás del conocimiento del mercado.
- **Migrar ahora es barato**: 8 páginas, ~17 componentes, 1 script de interactividad, 0 enrutador, 0 estado global. El costo crece con el tamaño del código.

### Matiz técnico registrado
"React+Vite es mejor para páginas estáticas" es **parcial**: para contenido estático Astro/SSG es más eficiente (0 JS); React SPA es mejor para **aplicaciones/dashboards con interacción**, que es exactamente este proyecto. Vite genera `dist/` estático igual que Astro.
Conclusión: migrar aquí **sí** conviene; no significa que React sea siempre mejor.

### Lo que se gana (ejemplo real de `/admin`)
- `src/scripts/adminEstados.js` (124 líneas de `querySelector`, `data-*`, `classList.toggle`) → ~30 líneas de `useState` + valores derivados:
  ```tsx
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => conEstadosGuardados(USUARIOS));
  const alternar = (id: string) => setUsuarios(us => us.map(u =>
    u.id === id ? { ...u, estado: u.estado === "Activo" ? "Inactivo" : "Activo" } : u));
  const activos = usuarios.filter(u => u.estado === "Activo").length; // KPIs solos
  ```
- Filtros en vivo, orden, edición inline, selección múltiple = operaciones sobre un array, no sobre el DOM.
- La arquitectura existente (componentes con props/defaults, datos separados) **se reutiliza tal cual**; sólo cambia `class`→`className` y `<slot/>`→`{children}`.

### Lo que se pierde (aceptable aquí)
- HTML prerenderizado de Astro (importa en la página pública de consulta de cliente, no en el dashboard; se resuelve con prerender/SSR luego si hace falta).
- Ecosistema `.astro` (el conocimiento no se pierde: sirve para saber **cuándo** elegir Astro vs React).

---

## 2. Decisiones cerradas

| Decisión | Elección |
| --- | --- |
| Ruta tecnológica | **Vite + React completo (SPA)**, no islas ni puente |
| Lenguaje | **TypeScript** (`.tsx`), conservando exigencia estricta |
| Dónde vive | **Repo nuevo** en GitHub (no rama ni subcarpeta de este repo) |
| Nombre propuesto | `tech-service-react` (renombrable) |
| Ruta local propuesta | `...\Nueva actualizacion\tech-service-react\` (junto a este proyecto para comparar) |
| Estilos | **Bootstrap + Bootstrap Icons desde npm** (`npm i bootstrap bootstrap-icons`) — resuelve la asimetría CSS en `src/` y JS en `public/` |
| Enrutador | `react-router-dom` |
| Offcanvas del menú | **Estado React** (`useState` + clases condicionales) → elimina la dependencia del bundle `bootstrap.bundle.min.js` (sólo se usaba para el menú); reintroducir si se usan dropdowns/tooltips o `react-bootstrap` |
| Herramientas disponibles | `gh` CLI (permite crear el repo con un comando), Node 24, npm 12 |

---

## 3. Plan por fases (reglas anti-caos)

1. `npm run build` **verde al cierre de cada fase**; si no compila, no se avanza.
2. **1 página = 1 commit** (trazabilidad / rollback).
3. **Primero portar, después refactorizar**: mismo markup y mismas clases → mismo aspecto visual; mejorar recién en Fase 4.
4. El repo Astro queda **intacto como referencia** hasta terminar.

### Fase 0 — Andamiaje (1 sesión)
- `npm create vite@latest . -- --template react-ts`
- `npm i react-router-dom bootstrap bootstrap-icons`
- `index.html` con `lang="es"` y título "Thec Service"
- README del repo nuevo con la **tabla de equivalencias Astro→React** (sección 4)
- Opcional: crear repo con `gh repo create` + `git push`

### Fase 1 — Esqueleto (1 sesión)
- `src/App.tsx` con las 8 rutas: `/`, `/login`, `/recepcion`, `/clientes`, `/ordenes`, `/facturacion`, `/reparacion`, `/admin`
- `src/layouts/Dashboard.tsx` con `<Outlet />`; menú desde array `modulos`; `NavLink` para el activo (sustituye `m.href === activo`)
- Offcanvas con `useState`
- **Criterio:** `npm run build` verde + navegación funcional

### Fase 2 — Páginas simples (1 sesión)
Orden: `/login` → `/clientes` → `/` → `/recepcion` → `/ordenes` → `/facturacion` → `/reparacion`.
Componentes a portar: `Boton`, `Tarjeta`, `Columna`, `Campo`, `Selector`, `Tabla`, `Logonombre`, `Hamburguesa` → `.tsx` (misma API de props).

### Fase 3 — `/admin` completo (1 sesión)
- `src/data/admin.ts` → **copiado tal cual** (ya es TS puro y probado); añadir `id` (hoy `email|rol`) al tipo `Usuario`
- `components/admin/MetricasUsuarios.tsx`, `BarraFiltros.tsx`, `TablaUsuarios.tsx` (props idénticas)
- `pages/admin.tsx` con estado + KPIs derivados en render
- `src/lib/estados.ts` absorbe `localStorage` (misma clave `admin:estados:v1`)
- **`adminEstados.js` no se migra: se elimina**
- Se conservan: confirmación al desactivar, bloqueo `esTu`, recálculo de métricas, pluralización de roles
- Métricas: totales, activos + 1 tarjeta por rol distinto detectado (sin config de roles)

### Fase 4 — Complejidad real (a demanda)
Filtros en vivo (nombre/correo), orden por columna, modal crear/editar, eliminar con confirmación, selección múltiple.

### Fase 5 — Futuro
API con `fetch` → si se necesita SSR/rutas con datos: **Next.js** (React transfiere 100%).

**Paridad funcional con lo actual ≈ 3 sesiones (Fases 0-3).**

---

## 4. Tabla de equivalencias Astro → React

| Astro | React |
| --- | --- |
| frontmatter `---` (datos/lógica) | `const` de módulo / `useState` |
| `Astro.props` + `interface Props` | props tipados idénticos en la firma |
| `<slot />` | `{children}` |
| `<slot class="m-0" />` (wrapper) | `<div className="m-0">{children}</div>` |
| `class=""` | `className=""` |
| `{cond && (<X/>)}` y `.map()` | idéntico en JSX |
| `activo="/admin"` manual | `<NavLink to="/admin">` |
| `<script src="../scripts/x.js">` procesado | lógica en `useState`/`useEffect` o módulo importado |
| `<script is:inline src="/js/...">` en `public/` | `import` desde npm o `<script>` en `index.html` |
| Rutas por archivo en `src/pages/` | `<Routes>` en `App.tsx` |
| Build Astro (`astro build`) | `vite build` (también genera `dist/`) |

## 5. Estructura propuesta del repo nuevo

```text
src/
├── main.tsx                 # ReactDOM + import de estilos Bootstrap + BrowserRouter
├── App.tsx                  # rutas
├── layouts/Dashboard.tsx    # shell con <Outlet/>, nav y header
├── pages/                   # index, login, recepcion, clientes, ordenes,
│                            # facturacion, reparacion, admin
├── components/              # Boton, Tarjeta, Columna, Campo, Selector, Tabla,
│   │                        # Logonombre, Hamburguesa
│   └── admin/               # MetricasUsuarios, BarraFiltros, TablaUsuarios
├── data/admin.ts            # tipos + calcularMetricas + pluralizar (copiado del Astro)
└── lib/estados.ts           # leer/guardar localStorage (clave admin:estados:v1)
```

## 6. Pendiente / puntos abiertos

- Confirmar nombre final del repo y si es **privado o público**.
- Si la sesión de trabajo se **mueve** a la carpeta del nuevo repo (`session_move`) o se trabaja desde la carpeta actual.
- Si se conserva el bundle de Bootstrap JS en vez del offcanvas con `useState` (recomendado: estado React).

## 7. Cómo retomar en la otra PC

```bash
git pull                                # este repo (referencia Astro) y este documento
npm install && npm run build            # verificar que Astro sigue verde

# Fase 0: repo nuevo
npm create vite@latest . -- --template react-ts
npm i react-router-dom bootstrap bootstrap-icons
npm run build                           # verde = se avanza de fase
```
