// src/scripts/adminEstados.js
// Switches de estado (Activo/Inactivo) en la tabla de usuarios:
// - alternan el estado de la fila
// - recalculan las tarjetas de métricas (KPIs) desde el DOM
// - persisten los cambios en localStorage (prototipo sin backend)

const CLAVE_STORAGE = "admin:estados:v1";
const SELECTOR_FILA = "tr[data-estado-id]";

const filas = () => Array.from(document.querySelectorAll(SELECTOR_FILA));

function leerGuardados() {
  try {
    const crudo = localStorage.getItem(CLAVE_STORAGE);
    const datos = crudo ? JSON.parse(crudo) : null;
    return datos && typeof datos === "object" ? datos : {};
  } catch {
    return {};
  }
}

function guardar() {
  const estados = {};
  filas().forEach((tr) => {
    estados[tr.dataset.estadoId] = tr.dataset.estado;
  });
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(estados));
  } catch {
    // Sin storage disponible (modo privado): los cambios quedan solo en pantalla.
  }
}

/** Pinta switch, etiqueta y punto según el data-estado de la fila. */
function pintar(tr) {
  const activo = tr.dataset.estado === "Activo";
  const input = tr.querySelector("[data-estado-toggle]");
  const label = tr.querySelector(".form-check-label");
  const punto = label?.querySelector("[data-estado-punto]");
  const texto = label?.querySelector("[data-estado-texto]");

  if (input) input.checked = activo;
  if (label) {
    label.classList.toggle("text-success", activo);
    label.classList.toggle("text-danger", !activo);
  }
  if (punto) {
    punto.classList.toggle("bg-success", activo);
    punto.classList.toggle("bg-danger", !activo);
  }
  if (texto) texto.textContent = activo ? "Activo" : "Inactivo";
}

/** Recalcula los KPIs leyendo las filas de la tabla (fuente de verdad = DOM). */
function recalcular() {
  const todas = filas();
  const activas = todas.filter((tr) => tr.dataset.estado === "Activo");

  document.querySelectorAll("[data-kpi-valor]").forEach((span) => {
    const kpi = span.dataset.kpi;
    if (!kpi) return; // métrica personalizada: no se recalcula

    if (kpi === "totales") {
      span.textContent = String(todas.length);
    } else if (kpi === "activos") {
      span.textContent = String(activas.length);
    } else if (kpi === "rol") {
      const rol = span.dataset.rol;
      span.textContent = String(todas.filter((tr) => tr.dataset.rol === rol).length);
    }
  });
}

function alCambiar(evento) {
  const input = evento.target;
  const tr = input.closest(SELECTOR_FILA);
  if (!tr) return;

  const nuevo = input.checked ? "Activo" : "Inactivo";

  // Confirmación solo al desactivar
  if (nuevo === "Inactivo") {
    const nombre = tr.cells[0]?.querySelector(".fw-bold")?.textContent?.trim() ?? "este usuario";
    if (!window.confirm(`¿Desactivar a ${nombre}?`)) {
      input.checked = true; // revertir
      return;
    }
  }

  tr.dataset.estado = nuevo;
  pintar(tr);
  guardar();
  recalcular();
}

function iniciar() {
  const guardados = leerGuardados();

  filas().forEach((tr) => {
    const input = tr.querySelector("[data-estado-toggle]");
    const guardado = guardados[tr.dataset.estadoId];

    // El estado deshabilitado (tu propia cuenta) no se restaura: manda lo compilado.
    if (!input?.disabled && (guardado === "Activo" || guardado === "Inactivo")) {
      tr.dataset.estado = guardado;
    }
    pintar(tr);
  });

  recalcular();

  // Delegación de eventos: sigue funcionando si las filas cambian en el futuro.
  document.addEventListener("change", (evento) => {
    if (evento.target instanceof HTMLInputElement && evento.target.matches("[data-estado-toggle]")) {
      alCambiar(evento);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciar, { once: true });
} else {
  iniciar();
}
