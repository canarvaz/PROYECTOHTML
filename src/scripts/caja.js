// src/scripts/caja.js
// Caja: muestra el ticket indicado en ?ticket=ID y registra el pago simulado.

const CLAVE_TICKETS = "tickets:v1";
const CLAVE_CLIENTES = "clientes:v1";

const ticketsSemilla = JSON.parse(document.getElementById("datos-tickets").textContent);
const clientesSemilla = JSON.parse(document.getElementById("datos-clientes").textContent);

const contenido = document.getElementById("contenido-caja");
const money = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const idTicket = Number(new URLSearchParams(window.location.search).get("ticket"));

let tickets = leer(CLAVE_TICKETS, ticketsSemilla);
let ticket = tickets.find((t) => t.id === idTicket);
const clientes = leer(CLAVE_CLIENTES, clientesSemilla);

function leer(clave, semilla) {
  try {
    const guardados = localStorage.getItem(clave);
    return guardados ? JSON.parse(guardados) : structuredClone(semilla);
  } catch {
    return structuredClone(semilla);
  }
}

function guardar(clave, datos) {
  localStorage.setItem(clave, JSON.stringify(datos));
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

function render() {
  if (!ticket) {
    contenido.innerHTML = `
      <p class="text-muted">No se encontró el ticket indicado.</p>
      <a href="/recepcion" class="btn btn-outline-secondary btn-sm">Ir a recepción</a>`;
    return;
  }

  const cliente = clientes.find((c) => c.id === ticket.idCliente) || {};
  const nombre = `${cliente.nombre ?? ""} ${cliente.apellido ?? ""}`.trim() || "Sin cliente";
  const pagado = ticket.saldoPendiente <= 0;
  const servicio = ticket.servicioMostrador;
  const diagnostico = servicio?.diagnostico ?? ticket.diagnostico;
  const reparacion = servicio?.reparacion ?? "";
  const fotos = servicio?.fotosReparacion ?? [];

  contenido.innerHTML = `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div>
        <span class="fw-bold fs-5">${escapar(ticket.numero)}</span>
        <span class="badge bg-dark ms-1">${escapar(ticket.casillero || "Sin casillero")}</span>
      </div>
      <span class="badge fs-6 ${pagado ? "bg-success" : "bg-danger"}">${pagado ? "Pagado" : "Pendiente de pago"}</span>
    </div>

    <div class="table-responsive">
      <table class="table table-sm align-middle">
        <tbody>
          <tr><th style="width:200px">Cliente</th><td>${escapar(nombre)}</td></tr>
          <tr><th>Dispositivo</th><td>${escapar(ticket.dispositivo)} · ${escapar(ticket.tipoDispositivo)}</td></tr>
          <tr><th>Serial</th><td><code>${escapar(ticket.serial)}</code></td></tr>
          <tr><th>Falla reportada</th><td>${escapar(ticket.descripcion)}</td></tr>
          ${diagnostico ? `<tr><th>Diagnóstico</th><td>${escapar(diagnostico)}</td></tr>` : ""}
          ${reparacion ? `<tr><th>Reparación</th><td>${escapar(reparacion)}</td></tr>` : ""}
        </tbody>
      </table>
    </div>

    ${
      fotos.length
        ? `<div class="d-flex flex-wrap gap-2 mb-3">${fotos
            .map((f) => `<img src="${f}" alt="Foto del equipo reparado" class="img-thumbnail" style="width:120px;height:90px;object-fit:cover" />`)
            .join("")}</div>`
        : ""
    }

    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 border-top pt-3">
      <div class="fs-4 fw-bold">Total: ${money.format(ticket.saldoPendiente)}</div>
      ${
        pagado
          ? '<a href="/recepcion" class="btn btn-outline-primary">Nuevo ingreso</a>'
          : '<button type="button" class="btn btn-success btn-lg" id="btn-pagar"><i class="bi bi-cash-coin"></i> Registrar pago</button>'
      }
    </div>
    <div id="alerta-caja" class="mt-3"></div>`;
}

contenido.addEventListener("click", (e) => {
  if (!e.target.closest("#btn-pagar")) return;

  const monto = ticket.saldoPendiente;
  if (!window.confirm(`¿Registrar pago de ${money.format(monto)}?`)) return;

  const { fecha, hora } = ahora();
  ticket.notas.push({
    id: Date.now(),
    texto: `Pago registrado en caja por ${money.format(monto)}.`,
    fecha,
    hora,
    autor: "Caja",
    fotos: [],
  });
  ticket.saldoPendiente = 0;

  if (ticket.via === "mostrador" && ticket.estado !== "Entregado") {
    ticket.estado = "Entregado";
    ticket.historial.push({ estado: "Entregado", fecha, hora });
  }

  tickets = tickets.map((t) => (t.id === ticket.id ? ticket : t));
  guardar(CLAVE_TICKETS, tickets);
  render();
  document.getElementById("alerta-caja").innerHTML = `
    <div class="alert alert-success mb-0">
      Pago registrado. Entregue el equipo desde el casillero <strong>${escapar(ticket.casillero)}</strong>.
    </div>`;
});

render();
