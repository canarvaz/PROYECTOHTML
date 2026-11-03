// src/scripts/ordenes.js
// Lista de tickets con filtros (búsqueda, estado, cliente, tipo), paginación y reportes (CSV/imprimir).
// Solo lectura: la navegación al detalle va por href a /tickets/[id].

const CLAVE_TICKETS = "tickets:v1";
const CLAVE_CLIENTES = "clientes:v1";
const POR_PAGINA = 10;

const ticketsSemilla = JSON.parse(document.getElementById("datos-tickets").textContent);
const clientesSemilla = JSON.parse(document.getElementById("datos-clientes").textContent);

let pagina = 1;
let busqueda = "";
let filtroEstado = "";
let filtroCliente = "";
let filtroTipo = "";
let imprimiendo = false;

const buscador = document.querySelector("[data-buscar-ordenes]");
const botonLimpiarBusqueda = document.querySelector("[data-limpiar-busqueda]");
const selectEstado = document.querySelector("[data-filtro-estado]");
const selectCliente = document.querySelector("[data-filtro-cliente]");
const selectTipo = document.querySelector("[data-filtro-tipo]");
const botonLimpiarFiltros = document.querySelector("[data-limpiar-filtros]");
const botonCsv = document.querySelector("[data-exportar-csv]");
const botonImprimir = document.querySelector("[data-imprimir]");
const cuerpoTabla = document.querySelector("[data-cuerpo-ordenes]");
const infoTabla = document.querySelector("[data-info-ordenes]");
const paginacion = document.querySelector("[data-paginacion-ordenes]");

const COLORES = {
  Pendiente: "bg-secondary",
  "En diagnóstico": "bg-info text-dark",
  "En reparación": "bg-warning text-dark",
  Listo: "bg-success",
  Entregado: "bg-primary",
};

function leer(clave, semilla) {
  try {
    const guardados = localStorage.getItem(clave);
    return guardados ? JSON.parse(guardados) : structuredClone(semilla);
  } catch {
    return structuredClone(semilla);
  }
}

function escapar(valor) {
  return String(valor).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

function formatearFecha(iso) {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}

function hayFiltrosActivos() {
  return Boolean(busqueda.trim() || filtroEstado || filtroCliente || filtroTipo);
}

function ticketsFiltrados() {
  const tickets = leer(CLAVE_TICKETS, ticketsSemilla);
  const termino = busqueda.trim().toLowerCase();

  return tickets.filter((t) => {
    if (filtroEstado && t.estado !== filtroEstado) return false;
    if (filtroCliente && t.idCliente !== Number(filtroCliente)) return false;
    if (filtroTipo && t.tipoDispositivo !== filtroTipo) return false;
    if (termino) {
      const cliente = leer(CLAVE_CLIENTES, clientesSemilla).find((c) => c.id === t.idCliente);
      const datos = [
        t.numero,
        t.idCliente,
        t.descripcion,
        cliente ? `${cliente.nombre} ${cliente.apellido}` : "",
      ];
      if (!datos.some((valor) => String(valor).toLowerCase().includes(termino))) return false;
    }
    return true;
  });
}

function renderPaginacion(totalPaginas) {
  const item = (texto, p, deshabilitado = false, activo = false) => `
    <li class="page-item${deshabilitado ? " disabled" : ""}${activo ? " active" : ""}">
      <button type="button" class="page-link" data-pagina="${p}"${deshabilitado ? " disabled" : ""}>${texto}</button>
    </li>`;

  let html = item("&laquo;", pagina - 1, pagina === 1);
  for (let p = 1; p <= totalPaginas; p++) {
    html += item(p, p, false, p === pagina);
  }
  html += item("&raquo;", pagina + 1, pagina === totalPaginas);
  paginacion.innerHTML = html;
}

function renderTabla() {
  const lista = ticketsFiltrados();
  actualizarBotonFiltros();

  // Al imprimir se muestra la tabla completa filtrada (sin paginar).
  const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  pagina = Math.min(pagina, totalPaginas);
  const paginaVisible = imprimiendo ? lista : lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  if (paginaVisible.length === 0) {
    const mensaje = hayFiltrosActivos()
      ? "No hay tickets que coincidan con el filtro."
      : "Sin registros.";
    cuerpoTabla.innerHTML = `
      <tr><td colspan="7" class="py-3 px-4 text-center text-muted">${mensaje}</td></tr>`;
  } else {
    const clientes = leer(CLAVE_CLIENTES, clientesSemilla);
    cuerpoTabla.innerHTML = paginaVisible
      .map((t) => {
        const cliente = clientes.find((c) => c.id === t.idCliente);
        const nombreCliente = cliente ? `${cliente.nombre} ${cliente.apellido}` : `Cliente #${t.idCliente}`;
        return `
        <tr>
          <td class="py-3 px-4 fw-bold">${escapar(t.numero)}</td>
          <td class="py-3 px-4">${escapar(nombreCliente)}<br><small class="text-muted">ID: ${t.idCliente}</small></td>
          <td class="py-3 px-4">${escapar(t.dispositivo)}</td>
          <td class="py-3 px-4 text-truncate" style="max-width:260px" title="${escapar(t.descripcion)}">${escapar(t.descripcion)}</td>
          <td class="py-3 px-4"><span class="badge ${COLORES[t.estado] ?? "bg-secondary"}">${escapar(t.estado)}</span></td>
          <td class="py-3 px-4 small text-muted">${formatearFecha(t.fechaIngreso)}</td>
          <td class="py-3 px-4">
            <a href="/tickets/${t.id}" class="btn btn-sm btn-outline-primary">
              <i class="bi bi-box-arrow-up-right"></i> Ver detalle
            </a>
          </td>
        </tr>`;
      })
      .join("");
  }

  if (imprimiendo) {
    const conteo = document.getElementById("conteo-reporte");
    const fecha = document.getElementById("fecha-reporte");
    if (fecha) fecha.textContent = new Date().toLocaleString("es-CO");
    if (conteo) conteo.textContent = `${lista.length} ticket(s)`;
    paginacion.innerHTML = "";
    infoTabla.textContent = "";
    return;
  }

  const desde = lista.length === 0 ? 0 : (pagina - 1) * POR_PAGINA + 1;
  const hasta = Math.min(pagina * POR_PAGINA, lista.length);
  infoTabla.textContent = `Mostrando ${desde}–${hasta} de ${lista.length} tickets`;
  renderPaginacion(totalPaginas);
}

// ---------- Filtros ----------

buscador.addEventListener("input", () => {
  busqueda = buscador.value;
  pagina = 1;
  botonLimpiarBusqueda.classList.toggle("d-none", busqueda.length === 0);
  renderTabla();
});

botonLimpiarBusqueda.addEventListener("click", () => {
  buscador.value = "";
  busqueda = "";
  pagina = 1;
  botonLimpiarBusqueda.classList.add("d-none");
  renderTabla();
  buscador.focus();
});

selectEstado.addEventListener("change", () => {
  filtroEstado = selectEstado.value;
  pagina = 1;
  renderTabla();
});

selectCliente.addEventListener("change", () => {
  filtroCliente = selectCliente.value;
  pagina = 1;
  renderTabla();
});

selectTipo.addEventListener("change", () => {
  filtroTipo = selectTipo.value;
  pagina = 1;
  renderTabla();
});

botonLimpiarFiltros.addEventListener("click", () => {
  buscador.value = "";
  busqueda = "";
  filtroEstado = "";
  filtroCliente = "";
  filtroTipo = "";
  selectEstado.value = "";
  selectCliente.value = "";
  selectTipo.value = "";
  pagina = 1;
  botonLimpiarBusqueda.classList.add("d-none");
  renderTabla();
});

paginacion.addEventListener("click", (e) => {
  const boton = e.target.closest("[data-pagina]");
  if (!boton || boton.disabled) return;
  pagina = Number(boton.dataset.pagina);
  renderTabla();
});

// Mantener al día el botón "Limpiar filtros"
function actualizarBotonFiltros() {
  botonLimpiarFiltros.classList.toggle("d-none", !hayFiltrosActivos());
}

// ---------- Reporte CSV ----------

function exportarCsv() {
  const lista = ticketsFiltrados();
  const clientes = leer(CLAVE_CLIENTES, clientesSemilla);

  const encabezado = [
    "N° ticket",
    "ID cliente",
    "Cliente",
    "Email",
    "Dispositivo",
    "Descripción",
    "Estado",
    "Fecha ingreso",
    "Saldo pendiente",
  ];

  const escaparCsv = (valor) => `"${String(valor).replace(/"/g, '""')}"`;
  const filas = lista.map((t) => {
    const cliente = clientes.find((c) => c.id === t.idCliente);
    return [
      t.numero,
      t.idCliente,
      cliente ? `${cliente.nombre} ${cliente.apellido}` : "",
      cliente ? cliente.email : "",
      t.dispositivo,
      t.descripcion,
      t.estado,
      t.fechaIngreso,
      t.saldoPendiente,
    ]
      .map(escaparCsv)
      .join(";");
  });

  // BOM UTF-8 para que Excel reconozca los acentos
  const contenido = "\uFEFF" + [encabezado.map(escaparCsv).join(";"), ...filas].join("\r\n");
  const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const hoy = new Date().toISOString().slice(0, 10);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `ordenes-${hoy}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
}

botonCsv.addEventListener("click", exportarCsv);

// ---------- Imprimir ----------

botonImprimir.addEventListener("click", () => {
  imprimiendo = true;
  renderTabla();
  window.print();
});

window.addEventListener("afterprint", () => {
  imprimiendo = false;
  renderTabla();
});

renderTabla();
