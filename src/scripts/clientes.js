// src/scripts/clientes.js
// CRUD de clientes, búsqueda, paginación y modal de tickets (maquetado, persistencia en localStorage).

const CLAVE_CLIENTES = "clientes:v1";
const CLAVE_TICKETS = "tickets:v1";
const POR_PAGINA = 10;

const clientesSemilla = JSON.parse(document.getElementById("datos-clientes").textContent);
const ticketsSemilla = JSON.parse(document.getElementById("datos-tickets").textContent);

let clientes = leerClientes();
let busqueda = "";
let paginaClientes = 1;
let paginaTickets = 1;
let clienteActivo = null;

const buscador = document.querySelector("[data-buscar-clientes]");
const botonLimpiar = document.querySelector("[data-limpiar-busqueda]");
const botonNuevo = document.querySelector("[data-nuevo-cliente]");
const cuerpoClientes = document.querySelector("[data-cuerpo-clientes]");
const infoClientes = document.querySelector("[data-info-clientes]");
const paginacionClientes = document.querySelector("[data-paginacion-clientes]");

const modalCliente = document.getElementById("modal-cliente");
const formCliente = document.querySelector("[data-form-cliente]");
const tituloFormulario = document.querySelector("[data-titulo-formulario]");

const modalTickets = document.getElementById("modal-tickets");
const nombreClienteTickets = document.querySelector("[data-nombre-cliente-tickets]");
const cuerpoTickets = document.querySelector("[data-cuerpo-tickets]");
const infoTickets = document.querySelector("[data-info-tickets]");
const paginacionTickets = document.querySelector("[data-paginacion-tickets]");

const CAMPOS = ["nombre", "apellido", "telefono", "email"];
const VALIDACIONES = {
  nombre: (v) => v.length > 0,
  apellido: (v) => v.length > 0,
  telefono: (v) => /^[0-9+\s()-]{7,20}$/.test(v),
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
};

function leerClientes() {
  try {
    const guardados = localStorage.getItem(CLAVE_CLIENTES);
    return guardados ? JSON.parse(guardados) : structuredClone(clientesSemilla);
  } catch {
    return structuredClone(clientesSemilla);
  }
}

function guardarClientes() {
  localStorage.setItem(CLAVE_CLIENTES, JSON.stringify(clientes));
}

// Los tickets pueden haber sido editados desde la página del ticket (mismo localStorage).
function leerTickets() {
  try {
    const guardados = localStorage.getItem(CLAVE_TICKETS);
    return guardados ? JSON.parse(guardados) : structuredClone(ticketsSemilla);
  } catch {
    return structuredClone(ticketsSemilla);
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

function clientesFiltrados() {
  const termino = busqueda.trim().toLowerCase();
  if (!termino) return clientes;
  return clientes.filter((c) =>
    [c.id, c.nombre, c.apellido, c.telefono, c.email].some((valor) =>
      String(valor).toLowerCase().includes(termino),
    ),
  );
}

function renderPaginacion(contenedor, paginaActual, totalPaginas) {
  const item = (texto, pagina, deshabilitado = false, activo = false) => `
    <li class="page-item${deshabilitado ? " disabled" : ""}${activo ? " active" : ""}">
      <button type="button" class="page-link" data-pagina="${pagina}"${deshabilitado ? " disabled" : ""}>${texto}</button>
    </li>`;

  let html = item("&laquo;", paginaActual - 1, paginaActual === 1);
  for (let p = 1; p <= totalPaginas; p++) {
    html += item(p, p, false, p === paginaActual);
  }
  html += item("&raquo;", paginaActual + 1, paginaActual === totalPaginas);
  contenedor.innerHTML = html;
}

function renderClientes() {
  const lista = clientesFiltrados();
  const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  paginaClientes = Math.min(paginaClientes, totalPaginas);

  const inicio = (paginaClientes - 1) * POR_PAGINA;
  const pagina = lista.slice(inicio, inicio + POR_PAGINA);

  if (pagina.length === 0) {
    const mensaje = busqueda.trim()
      ? `No se encontraron clientes para «${escapar(busqueda.trim())}»`
      : "Sin registros.";
    cuerpoClientes.innerHTML = `
      <tr><td colspan="7" class="py-3 px-4 text-center text-muted">${mensaje}</td></tr>`;
  } else {
    cuerpoClientes.innerHTML = pagina
      .map(
        (c) => `
      <tr>
        <td class="py-3 px-4">
          <div class="d-flex align-items-center gap-2 text-secondary">
            <button type="button" class="btn btn-sm btn-outline-secondary" data-accion="editar" data-id="${c.id}" aria-label="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger" data-accion="eliminar" data-id="${c.id}" aria-label="Eliminar">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
        <td class="py-3 px-4">${escapar(c.id)}</td>
        <td class="py-3 px-4 fw-bold">${escapar(c.nombre)}</td>
        <td class="py-3 px-4">${escapar(c.apellido)}</td>
        <td class="py-3 px-4">${escapar(c.telefono)}</td>
        <td class="py-3 px-4">${escapar(c.email)}</td>
        <td class="py-3 px-4">
          <button type="button" class="btn btn-sm btn-outline-primary" data-accion="tickets" data-id="${c.id}">
            <i class="bi bi-ticket-detailed"></i> Ver tickets
          </button>
        </td>
      </tr>`,
      )
      .join("");
  }

  const desde = lista.length === 0 ? 0 : inicio + 1;
  const hasta = Math.min(inicio + POR_PAGINA, lista.length);
  infoClientes.textContent = `Mostrando ${desde}–${hasta} de ${lista.length} clientes`;
  renderPaginacion(paginacionClientes, paginaClientes, totalPaginas);
}

function renderTickets() {
  const lista = leerTickets().filter((t) => t.idCliente === clienteActivo.id);
  const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  paginaTickets = Math.min(paginaTickets, totalPaginas);

  const inicio = (paginaTickets - 1) * POR_PAGINA;
  const pagina = lista.slice(inicio, inicio + POR_PAGINA);

  if (pagina.length === 0) {
    cuerpoTickets.innerHTML = `
      <tr><td colspan="4" class="py-3 px-4 text-center text-muted">Este cliente no tiene tickets.</td></tr>`;
  } else {
    cuerpoTickets.innerHTML = pagina
      .map(
        (t) => `
      <tr>
        <td class="fw-bold">${escapar(t.numero)}</td>
        <td>${escapar(t.dispositivo)}</td>
        <td>${escapar(t.descripcion)}</td>
        <td class="text-end">
          <a href="/tickets/${t.id}" class="btn btn-sm btn-outline-primary">
            <i class="bi bi-box-arrow-up-right"></i> Ver detalle
          </a>
        </td>
      </tr>`,
      )
      .join("");
  }

  const desde = lista.length === 0 ? 0 : inicio + 1;
  const hasta = Math.min(inicio + POR_PAGINA, lista.length);
  infoTickets.textContent = `Mostrando ${desde}–${hasta} de ${lista.length} tickets`;
  renderPaginacion(paginacionTickets, paginaTickets, totalPaginas);
}

function abrirTickets(id) {
  clienteActivo = clientes.find((c) => c.id === id);
  if (!clienteActivo) return;
  paginaTickets = 1;
  nombreClienteTickets.textContent = `${clienteActivo.nombre} ${clienteActivo.apellido}`;
  renderTickets();
  bootstrap.Modal.getOrCreateInstance(modalTickets).show();
}

// Lee de localStorage cada vez: refleja notas/estados guardados desde /tickets/[id].

function limpiarValidacion() {
  formCliente.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
}

function abrirFormulario(cliente = null) {
  formCliente.reset();
  limpiarValidacion();
  tituloFormulario.textContent = cliente ? "Editar cliente" : "Nuevo cliente";
  formCliente.elements.id.value = cliente ? cliente.id : "";
  CAMPOS.forEach((campo) => {
    formCliente.elements[campo].value = cliente ? cliente[campo] : "";
  });
  bootstrap.Modal.getOrCreateInstance(modalCliente).show();
}

function eliminarCliente(id) {
  const cliente = clientes.find((c) => c.id === id);
  if (!cliente) return;
  const confirmado = window.confirm(`¿Eliminar al cliente ${cliente.nombre} ${cliente.apellido}?`);
  if (!confirmado) return;

  clientes = clientes.filter((c) => c.id !== id);
  guardarClientes();
  renderClientes();
}

botonNuevo.addEventListener("click", () => abrirFormulario());

cuerpoClientes.addEventListener("click", (e) => {
  const boton = e.target.closest("[data-accion]");
  if (!boton) return;
  const id = Number(boton.dataset.id);

  if (boton.dataset.accion === "editar") {
    abrirFormulario(clientes.find((c) => c.id === id));
  } else if (boton.dataset.accion === "eliminar") {
    eliminarCliente(id);
  } else if (boton.dataset.accion === "tickets") {
    abrirTickets(id);
  }
});

buscador.addEventListener("input", () => {
  busqueda = buscador.value;
  paginaClientes = 1;
  botonLimpiar.classList.toggle("d-none", busqueda.length === 0);
  renderClientes();
});

botonLimpiar.addEventListener("click", () => {
  buscador.value = "";
  busqueda = "";
  paginaClientes = 1;
  botonLimpiar.classList.add("d-none");
  renderClientes();
  buscador.focus();
});

paginacionClientes.addEventListener("click", (e) => {
  const boton = e.target.closest("[data-pagina]");
  if (!boton || boton.disabled) return;
  paginaClientes = Number(boton.dataset.pagina);
  renderClientes();
});

paginacionTickets.addEventListener("click", (e) => {
  const boton = e.target.closest("[data-pagina]");
  if (!boton || boton.disabled) return;
  paginaTickets = Number(boton.dataset.pagina);
  renderTickets();
});

formCliente.addEventListener("submit", (e) => {
  e.preventDefault();
  limpiarValidacion();

  const datos = {};
  let valido = true;
  CAMPOS.forEach((campo) => {
    const input = formCliente.elements[campo];
    const valor = input.value.trim();
    datos[campo] = valor;
    if (!VALIDACIONES[campo](valor)) {
      input.classList.add("is-invalid");
      valido = false;
    }
  });
  if (!valido) return;

  const id = formCliente.elements.id.value;
  if (id) {
    const cliente = clientes.find((c) => c.id === Number(id));
    if (cliente) Object.assign(cliente, datos);
  } else {
    const siguienteId = clientes.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    clientes.push({ id: siguienteId, ...datos });
  }

  guardarClientes();
  renderClientes();
  bootstrap.Modal.getOrCreateInstance(modalCliente).hide();
});

renderClientes();
