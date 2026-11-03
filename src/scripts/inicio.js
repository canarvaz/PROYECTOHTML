// src/scripts/inicio.js
// Panel de inicio: métricas y dos listas de tickets (listos / sin avances 24h+).
// Lee de localStorage con respaldo en la semilla, igual que el resto del proyecto.

const CLAVE_TICKETS = "tickets:v1";
const CLAVE_CLIENTES = "clientes:v1";

const ticketsSemilla = JSON.parse(document.getElementById("datos-tickets").textContent);
const clientesSemilla = JSON.parse(document.getElementById("datos-clientes").textContent);

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

function textoTruncado(texto, max = 70) {
  texto = String(texto);
  if (texto.length <= max) return texto;
  return texto.slice(0, max) + "…";
}

// Última entrada entre historial y notas (más reciente por fecha/hora).
function ultimaEntrada(ticket) {
  const entradas = [
    ...ticket.historial.map((h) => ({
      fecha: h.fecha,
      hora: h.hora,
      texto: `Estado: ${h.estado}`,
    })),
    ...ticket.notas.map((n) => ({
      fecha: n.fecha,
      hora: n.hora,
      texto: n.texto,
    })),
  ];
  if (entradas.length === 0) return null;
  entradas.sort(
    (a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`)
  );
  return entradas[0];
}

// Días transcurridos desde una fecha (ISO yyyy-mm-dd).
function diasDesde(fechaIso) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const entrada = new Date(`${fechaIso}T00:00:00`);
  entrada.setHours(0, 0, 0, 0);
  return Math.floor((hoy - entrada) / (1000 * 60 * 60 * 24));
}

function limpiarTelefono(tel) {
  return String(tel).replace(/\D/g, "");
}

function linkWhatsApp(telefono, mensaje) {
  return `https://wa.me/${limpiarTelefono(telefono)}?text=${encodeURIComponent(mensaje)}`;
}

function btnWhatsApp(telefono, mensaje, etiqueta = "WhatsApp") {
  return `
    <a
      href="${linkWhatsApp(telefono, mensaje)}"
      target="_blank"
      rel="noopener noreferrer"
      class="btn btn-sm btn-success"
      title="${etiqueta}"
    >
      <i class="bi bi-whatsapp"></i> ${etiqueta}
    </a>`;
}

// ---------- Datos ----------

const tickets = leer(CLAVE_TICKETS, ticketsSemilla);
const clientes = leer(CLAVE_CLIENTES, clientesSemilla);

function buscarCliente(id) {
  return clientes.find((c) => c.id === id) || {};
}

// ---------- Métricas ----------

const totalActivos = tickets.filter((t) => t.estado !== "Entregado").length;
const listosRaw = tickets.filter((t) => t.estado === "Listo");
const sinAvancesRaw = tickets.filter((t) => {
  if (t.estado === "Entregado" || t.estado === "Listo") return false;
  const u = ultimaEntrada(t);
  return u ? diasDesde(u.fecha) >= 1 : false;
});

document.getElementById("metrica-activos").textContent = totalActivos;
document.getElementById("metrica-listos").textContent = listosRaw.length;
document.getElementById("metrica-sinavances").textContent = sinAvancesRaw.length;
document.getElementById("metrica-reparacion").textContent = tickets.filter(
  (t) => t.estado === "En reparación"
).length;

// ---------- Render tabla listos ----------

const cuerpoListos = document.getElementById("cuerpo-listos");
const infoListos = document.getElementById("info-listos");

function renderListos() {
  if (listosRaw.length === 0) {
    cuerpoListos.innerHTML =
      '<tr><td colspan="5" class="py-3 px-4 text-center text-muted">Sin registros.</td></tr>';
    infoListos.textContent = "Sin tickets listos para recoger.";
    return;
  }

  cuerpoListos.innerHTML = listosRaw
    .map((t) => {
      const cliente = buscarCliente(t.idCliente);
      const nombre = `${cliente.nombre || "Sin nombre"} ${cliente.apellido || ""}`.trim();
      const telefono = cliente.telefono || "";
      const u = ultimaEntrada(t);
      const nota = u ? textoTruncado(u.texto) : "Sin notas";
      const mensaje = `Hola ${nombre}, tu equipo ${t.dispositivo} ticket ${t.numero} está listo para recoger en el taller.`;

      return `
      <tr>
        <td class="py-3 px-4 fw-bold">${escapar(t.numero)}</td>
        <td class="py-3 px-4">${escapar(nombre)}<br><small class="text-muted">${escapar(t.idCliente)}</small></td>
        <td class="py-3 px-4">${escapar(t.dispositivo)}</td>
        <td class="py-3 px-4 text-truncate" style="max-width:260px" title="${escapar(u ? u.texto : "Sin notas")}">${escapar(nota)}</td>
        <td class="py-3 px-4 text-center">${btnWhatsApp(telefono, mensaje)}</td>
      </tr>`;
    })
    .join("");

  infoListos.textContent = `${listosRaw.length} ticket(es) listo(s) para recoger.`;
}

// ---------- Render tabla sin avances ----------

const cuerpoSinAvances = document.getElementById("cuerpo-sinavances");
const infoSinAvances = document.getElementById("info-sinavances");

function renderSinAvances() {
  if (sinAvancesRaw.length === 0) {
    cuerpoSinAvances.innerHTML =
      '<tr><td colspan="6" class="py-3 px-4 text-center text-muted">Sin registros.</td></tr>';
    infoSinAvances.textContent = "Todos los tickets tienen avances recientes o ya fueron entregados.";
    return;
  }

  cuerpoSinAvances.innerHTML = sinAvancesRaw
    .map((t) => {
      const cliente = buscarCliente(t.idCliente);
      const nombre = `${cliente.nombre || "Sin nombre"} ${cliente.apellido || ""}`.trim();
      const telefono = cliente.telefono || "";
      const u = ultimaEntrada(t);
      const nota = u ? textoTruncado(u.texto) : "Sin notas";
      const dias = u ? diasDesde(u.fecha) : 0;
      const mensaje = `Hola ${nombre}, queremos informarte sobre el estado de tu equipo ${t.dispositivo} ticket ${t.numero}. ¿Puedes contactarnos?`;

      let claseDias = "bg-secondary";
      if (dias >= 4) claseDias = "bg-danger";
      else if (dias >= 2) claseDias = "bg-warning text-dark";

      return `
      <tr>
        <td class="py-3 px-4 fw-bold">${escapar(t.numero)}</td>
        <td class="py-3 px-4">${escapar(nombre)}<br><small class="text-muted">${escapar(t.idCliente)}</small></td>
        <td class="py-3 px-4">${escapar(t.dispositivo)}</td>
        <td class="py-3 px-4 text-truncate" style="max-width:260px" title="${escapar(u ? u.texto : "Sin notas")}">${escapar(nota)}</td>
        <td class="py-3 px-4 text-center"><span class="badge ${claseDias}">${dias} día${dias !== 1 ? "s" : ""}</span></td>
        <td class="py-3 px-4 text-center">${btnWhatsApp(telefono, mensaje)}</td>
      </tr>`;
    })
    .join("");

  infoSinAvances.textContent = `${sinAvancesRaw.length} ticket(es) sin avances en 24 h o más.`;
}

// ---------- Ejecutar ----------

renderListos();
renderSinAvances();
