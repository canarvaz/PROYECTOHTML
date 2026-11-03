// src/scripts/ticketDetalles.js
// Documento del ticket: diagnóstico, fotos, repuestos, cronología, notas y garantía.
// Persistencia en localStorage ("tickets:v1"); si no hay nada guardado, usa la semilla.

const CLAVE_TICKETS = "tickets:v1";

const contenedor = document.querySelector("[data-ticket-id]");
const idTicket = Number(contenedor.dataset.ticketId);

const semilla = JSON.parse(document.getElementById("datos-tickets").textContent);
let tickets = leerTickets();
let ticket = tickets.find((t) => t.id === idTicket);

const COLORES = {
  Pendiente: "bg-secondary",
  "En diagnóstico": "bg-info text-dark",
  "En reparación": "bg-warning text-dark",
  Listo: "bg-success",
  Entregado: "bg-primary",
};

const FLUJO = ["Pendiente", "En diagnóstico", "En reparación", "Listo", "Entregado"];

const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const zonaDiagnostico = document.getElementById("zona-diagnostico");
const cuerpoRepuestos = document.getElementById("cuerpo-repuestos");
const totalRepuestos = document.getElementById("total-repuestos");
const cronologia = document.getElementById("cronologia");
const estadoActual = document.getElementById("estado-actual");
const avisoEntregado = document.getElementById("aviso-entregado");
const zonaGarantia = document.getElementById("zona-garantia");
const notaTexto = document.getElementById("nota-texto");
const notaFotos = document.getElementById("nota-fotos");
const notaEstado = document.getElementById("nota-estado");
const btnNota = document.getElementById("btn-nota");
const fotosIngreso = document.getElementById("fotos-ingreso");

if (!ticket) {
  contenedor.innerHTML =
    '<div class="col-12"><div class="alert alert-danger">Ticket no encontrado.</div></div>';
  throw new Error(`Ticket ${idTicket} no encontrado`);
}

function leerTickets() {
  try {
    const guardados = localStorage.getItem(CLAVE_TICKETS);
    return guardados ? JSON.parse(guardados) : structuredClone(semilla);
  } catch {
    return structuredClone(semilla);
  }
}

function guardarTickets() {
  localStorage.setItem(CLAVE_TICKETS, JSON.stringify(tickets));
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

function ahora() {
  const f = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return {
    fecha: `${f.getFullYear()}-${pad(f.getMonth() + 1)}-${pad(f.getDate())}`,
    hora: `${pad(f.getHours())}:${pad(f.getMinutes())}`,
  };
}

function formatearFecha(iso) {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}

// ---------- Render ----------

function renderEstado() {
  const entregado = ticket.estado === "Entregado";
  estadoActual.className = `badge fs-6 ${COLORES[ticket.estado]}`;
  estadoActual.textContent = ticket.estado;

  avisoEntregado.classList.toggle("d-none", !entregado);
  zonaGarantia.classList.toggle("d-none", !entregado);

  [notaTexto, notaFotos, notaEstado, btnNota].forEach((el) => {
    el.disabled = entregado;
  });
  if (!entregado) notaEstado.value = ticket.estado;
}

function renderDiagnostico() {
  if (ticket.diagnostico) {
    zonaDiagnostico.innerHTML = `
      <div class="border rounded p-3 bg-light">
        <p class="mb-0">${escapar(ticket.diagnostico)}</p>
        <small class="text-muted">Solo lectura</small>
      </div>`;
    return;
  }
  if (ticket.estado === "Entregado") {
    zonaDiagnostico.innerHTML = '<p class="text-muted mb-0">Pendiente de diagnóstico.</p>';
    return;
  }
  zonaDiagnostico.innerHTML = `
    <div>
      <textarea class="form-control mb-2" rows="3" placeholder="Ingrese el diagnóstico inicial del equipo..." id="input-diagnostico"></textarea>
      <button type="button" class="btn btn-primary btn-sm" id="guardar-diagnostico">Guardar diagnóstico</button>
    </div>`;
}

function renderRepuestos() {
  if (ticket.repuestos.length === 0) {
    cuerpoRepuestos.innerHTML =
      '<tr><td colspan="5" class="text-center text-muted">Sin repuestos asociados.</td></tr>';
    totalRepuestos.textContent = money.format(0);
    return;
  }
  cuerpoRepuestos.innerHTML = ticket.repuestos
    .map(
      (r) => `
      <tr>
        <td>${escapar(r.descripcion)}</td>
        <td class="text-center">${r.cantidad}</td>
        <td class="text-end">${money.format(r.valor)}</td>
        <td class="text-end">${money.format(r.cantidad * r.valor)}</td>
        <td><span class="badge ${r.estado === "Instalado" ? "bg-success" : "bg-secondary"}">${r.estado}</span></td>
      </tr>`,
    )
    .join("");
  const total = ticket.repuestos.reduce((s, r) => s + r.cantidad * r.valor, 0);
  totalRepuestos.textContent = money.format(total);
}

function renderCronologia() {
  const eventos = [
    ...ticket.historial.map((h) => ({ tipo: "estado", fecha: h.fecha, hora: h.hora, estado: h.estado })),
    ...ticket.notas.map((n) => ({ tipo: "nota", fecha: n.fecha, hora: n.hora, nota: n })),
  ].sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));

  cronologia.innerHTML = eventos
    .map((ev) => {
      const fecha = `<div class="text-end text-muted small" style="min-width:95px">${formatearFecha(ev.fecha)}<br>${ev.hora}</div>`;
      if (ev.tipo === "estado") {
        return `<div class="d-flex gap-3 pb-3">${fecha}
          <div class="border-start ps-3 flex-grow-1">
            <span class="badge ${COLORES[ev.estado]}"><i class="bi bi-arrow-repeat"></i> Estado: ${ev.estado}</span>
          </div></div>`;
      }
      const fotos = ev.nota.fotos.length
        ? `<div class="d-flex gap-2">${ev.nota.fotos
            .map(
              (f) =>
                `<img src="${f}" alt="Foto de nota" class="rounded border" style="width:80px;height:60px;object-fit:cover;cursor:zoom-in" data-foto="${f}">`,
            )
            .join("")}</div>`
        : "";
      return `<div class="d-flex gap-3 pb-3">${fecha}
        <div class="border-start ps-3 flex-grow-1">
          <div class="bg-light rounded p-2">
            <small class="text-muted fw-bold">${escapar(ev.nota.autor)}</small>
            <p class="mb-1 small">${escapar(ev.nota.texto)}</p>
            ${fotos}
          </div>
        </div></div>`;
    })
    .join("");
}

function renderTodo() {
  renderEstado();
  renderDiagnostico();
  renderRepuestos();
  renderCronologia();
}

// ---------- Eventos ----------

// Guardar diagnóstico (delegado: el textarea se re-crea al renderizar)
zonaDiagnostico.addEventListener("click", (e) => {
  if (!e.target.closest("#guardar-diagnostico")) return;
  const textarea = document.getElementById("input-diagnostico");
  const valor = textarea.value.trim();
  if (!valor) {
    textarea.classList.add("is-invalid");
    return;
  }
  ticket.diagnostico = valor;
  guardarTickets();
  renderDiagnostico();
});

// Fotos: ampliar (delegado en el contenedor de ingreso y la cronología)
document.addEventListener("click", (e) => {
  const img = e.target.closest("[data-foto]");
  if (!img) return;
  document.getElementById("foto-ampliada").src = img.dataset.foto;
  bootstrap.Modal.getOrCreateInstance(document.getElementById("modal-foto")).show();
});

// Agregar nota
btnNota.addEventListener("click", () => {
  const texto = notaTexto.value.trim();
  if (!texto) {
    notaTexto.classList.add("is-invalid");
    return;
  }
  notaTexto.classList.remove("is-invalid");

  const { fecha, hora } = ahora();
  const nuevoEstado = notaEstado.value;
  const fotos = Array.from(notaFotos.files || [])
    .slice(0, 3)
    .map((_, i) => `/img/tickets/nota-${(i % 2) + 1}.svg`);

  if (nuevoEstado !== ticket.estado) {
    ticket.estado = nuevoEstado;
    ticket.historial.push({ estado: nuevoEstado, fecha, hora });
  }

  ticket.notas.push({
    id: Date.now(),
    texto,
    fecha,
    hora,
    autor: "Taller",
    fotos,
  });

  guardarTickets();
  notaTexto.value = "";
  notaFotos.value = "";
  renderTodo();
});

// Retorno en garantía
document.getElementById("btn-garantia").addEventListener("click", () => {
  const confirmado = window.confirm(
    "¿Registrar retorno en garantía? El ticket se reactivará para recibir notas.",
  );
  if (!confirmado) return;

  const { fecha, hora } = ahora();
  ticket.estado = "En diagnóstico";
  ticket.historial.push({ estado: "En diagnóstico", fecha, hora });
  guardarTickets();
  renderTodo();
});

// Agregar repuesto
document.getElementById("form-repuesto").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const descripcion = form.querySelector("#rep-descripcion");
  const cantidad = form.querySelector("#rep-cantidad");
  const valor = form.querySelector("#rep-valor");

  form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
  let valido = true;
  if (!descripcion.value.trim()) {
    descripcion.classList.add("is-invalid");
    valido = false;
  }
  if (Number(cantidad.value) < 1) {
    cantidad.classList.add("is-invalid");
    valido = false;
  }
  if (Number(valor.value) < 0 || valor.value === "") {
    valor.classList.add("is-invalid");
    valido = false;
  }
  if (!valido) return;

  ticket.repuestos.push({
    id: Date.now(),
    descripcion: descripcion.value.trim(),
    cantidad: Number(cantidad.value),
    valor: Number(valor.value),
    estado: "Pendiente",
  });

  guardarTickets();
  renderRepuestos();
  form.reset();
  form.querySelector("#rep-cantidad").value = "1";
  bootstrap.Modal.getOrCreateInstance(document.getElementById("modal-repuesto")).hide();
});

renderTodo();
