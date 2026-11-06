// src/scripts/recepcion.js
// Recepción: búsqueda de cliente por documento, alta de ingreso (normal o servicio en mostrador),
// fotos (máx. 5) y casillero con consecutivo independiente por vía (C-### normal, M-### mostrador).

const CLAVE_CLIENTES = "clientes:v1";
const CLAVE_TICKETS = "tickets:v1";
const MAX_FOTOS = 5;
const TELEFONO = /^[0-9+\s()-]{7,20}$/;

const clientesSemilla = JSON.parse(document.getElementById("datos-clientes").textContent);
const ticketsSemilla = JSON.parse(document.getElementById("datos-tickets").textContent);

const form = document.getElementById("form-recepcion");
const inputDocumento = document.getElementById("documento");
const badgeCliente = document.getElementById("estado-cliente");
const alerta = document.getElementById("alerta");
const alertaCliente = document.getElementById("alerta-cliente");
const btnGuardarCliente = document.getElementById("btn-guardar-cliente");
const inputFotosIngreso = document.getElementById("fotos-ingreso");
const previewIngreso = document.getElementById("preview-ingreso");
const btnMostrador = document.getElementById("btn-mostrador");
const modalMostrador = document.getElementById("modal-mostrador");
const inputFotosReparacion = document.getElementById("mostrador-fotos");
const previewReparacion = document.getElementById("preview-reparacion");
const btnGuardarMostrador = document.getElementById("guardar-mostrador");

const CAMPOS_CLIENTE = ["documento", "nombre", "apellido", "email", "telefono", "telefono2"];
const CAMPOS_DISPOSITIVO = ["tipodispositivo", "marca", "modelo", "serial", "descripcion"];
const CAMPOS_CLIENTE_EDITABLES = ["nombre", "apellido", "email", "telefono", "telefono2"];

// Estado del cliente asociado al ingreso: qué hay guardado en la base y si el
// formulario coincide con eso (para habilitar el botón de guardar).
let clienteBase = null; // copia de los campos al buscar/guardar, o null si no aplica
let clienteEstado = "sin-buscar"; // "sin-buscar" | "existente" | "nuevo"

const reglas = {
  documento: (v) => v.length >= 5,
  nombre: (v) => v.length > 0,
  apellido: (v) => v.length > 0,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  telefono: (v) => TELEFONO.test(v),
  telefono2: (v) => v === "" || TELEFONO.test(v),
  tipodispositivo: (v) => v !== "",
  marca: (v) => v.length > 0,
  modelo: (v) => v.length > 0,
  serial: (v) => v.length > 0,
  descripcion: (v) => v.length > 0,
};

const reglasModal = {
  "mostrador-diagnostico": (v) => v.length > 0,
  "mostrador-reparacion": (v) => v.length > 0,
  "mostrador-valor": (v) => Number(v) > 0,
};

const fotosIngreso = [];
const fotosReparacion = [];

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

const campo = (id) => document.getElementById(id).value.trim();
const maxId = (lista) => lista.reduce((max, item) => Math.max(max, item.id), 0);

function siguienteCasillero(tickets, prefijo) {
  const numeros = tickets
    .map((t) => t.casillero || "")
    .filter((c) => c.startsWith(`${prefijo}-`))
    .map((c) => Number(c.split("-")[1]))
    .filter((n) => !Number.isNaN(n));
  const max = numeros.length ? Math.max(...numeros) : 0;
  return `${prefijo}-${String(max + 1).padStart(3, "0")}`;
}

function validarCampos(pares) {
  return pares
    .map(([id, regla]) => {
      const el = document.getElementById(id);
      const valido = regla(el.value.trim());
      el.classList.toggle("is-invalid", !valido);
      return valido;
    })
    .every(Boolean);
}

function validarFormulario() {
  return validarCampos([...CAMPOS_CLIENTE, ...CAMPOS_DISPOSITIVO].map((id) => [id, reglas[id]]));
}

function mostrarAlerta(html, tipo = "success") {
  alerta.className = `alert alert-${tipo} me-auto mb-0 py-2 flex-grow-1`;
  alerta.innerHTML = html;
}

function mostrarBadge(texto, clase) {
  badgeCliente.textContent = texto;
  badgeCliente.className = `badge ${clase}`;
}

function ocultarBadge() {
  badgeCliente.className = "badge d-none";
}

// ---------- Fotos ----------

function leerImagen(archivo) {
  return new Promise((resolver, rechazar) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => {
      const escala = Math.min(1, 800 / Math.max(img.width, img.height));
      const lienzo = document.createElement("canvas");
      lienzo.width = Math.round(img.width * escala);
      lienzo.height = Math.round(img.height * escala);
      lienzo.getContext("2d").drawImage(img, 0, 0, lienzo.width, lienzo.height);
      URL.revokeObjectURL(url);
      resolver(lienzo.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      rechazar(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
}

function renderFotos(lista, contenedor) {
  contenedor.innerHTML = lista
    .map(
      (src, i) => `
      <div class="position-relative">
        <img src="${src}" alt="Foto ${i + 1}" class="img-thumbnail" style="width:96px;height:72px;object-fit:cover" />
        <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 py-0 px-1" data-quitar="${i}" aria-label="Quitar foto ${i + 1}">&times;</button>
      </div>`,
    )
    .join("");
}

function vincularPreview(lista, contenedor) {
  contenedor.addEventListener("click", (e) => {
    const boton = e.target.closest("[data-quitar]");
    if (!boton) return;
    lista.splice(Number(boton.dataset.quitar), 1);
    renderFotos(lista, contenedor);
  });
}

async function agregarFotos(input, lista, contenedor) {
  const archivos = Array.from(input.files || []);
  input.value = "";
  if (archivos.length === 0) return;

  const disponibles = MAX_FOTOS - lista.length;
  if (disponibles <= 0) {
    mostrarAlerta(`Ya tiene ${MAX_FOTOS} fotos. Quite alguna para agregar más.`, "warning");
    return;
  }
  if (archivos.length > disponibles) {
    mostrarAlerta(`Solo se agregan ${disponibles} foto(s) para no superar ${MAX_FOTOS}.`, "warning");
  }

  for (const archivo of archivos.slice(0, disponibles)) {
    lista.push(await leerImagen(archivo));
  }
  renderFotos(lista, contenedor);
}

vincularPreview(fotosIngreso, previewIngreso);
vincularPreview(fotosReparacion, previewReparacion);
inputFotosIngreso.addEventListener("change", () => agregarFotos(inputFotosIngreso, fotosIngreso, previewIngreso));
inputFotosReparacion.addEventListener("change", () =>
  agregarFotos(inputFotosReparacion, fotosReparacion, previewReparacion),
);

// ---------- Búsqueda de cliente ----------

function leerCamposCliente() {
  return {
    documento: campo("documento"),
    nombre: campo("nombre"),
    apellido: campo("apellido"),
    email: campo("email"),
    telefono: campo("telefono"),
    telefono2: campo("telefono2"),
  };
}

function mostrarAlertaCliente(html, tipo = "success") {
  alertaCliente.className = `alert alert-${tipo} py-2 mb-2`;
  alertaCliente.innerHTML = html;
}

function ocultarAlertaCliente() {
  alertaCliente.className = "alert d-none py-2 mb-2";
}

// Habilita el botón solo si el cliente es nuevo o los campos difieren de lo guardado.
function actualizarBotonGuardar() {
  const actual = leerCamposCliente();
  const hayCambios =
    clienteEstado === "nuevo" ||
    (clienteBase !== null &&
      CAMPOS_CLIENTE.some((id) => (actual[id] ?? "") !== (clienteBase[id] ?? "")));
  btnGuardarCliente.disabled = !hayCambios;
}

function buscarCliente(documento) {
  return leer(CLAVE_CLIENTES, clientesSemilla).find((c) => String(c.documento ?? "") === documento);
}

function buscarPorDocumento() {
  const documento = campo("documento");
  if (!documento) {
    inputDocumento.classList.add("is-invalid");
    ocultarBadge();
    return;
  }
  inputDocumento.classList.remove("is-invalid");

  const cliente = buscarCliente(documento);
  if (!cliente) {
    // Documento inexistente: se limpian los campos para no mezclar datos del cliente anterior.
    CAMPOS_CLIENTE_EDITABLES.forEach((id) => {
      document.getElementById(id).value = "";
      document.getElementById(id).classList.remove("is-invalid");
    });
    clienteBase = null;
    clienteEstado = "nuevo";
    mostrarBadge("Cliente nuevo", "bg-info text-dark");
  } else {
    CAMPOS_CLIENTE_EDITABLES.forEach((id) => {
      document.getElementById(id).value = cliente[id] ?? "";
    });
    clienteBase = leerCamposCliente();
    clienteEstado = "existente";
    mostrarBadge("Cliente existente", "bg-success");
  }
  ocultarAlertaCliente();
  actualizarBotonGuardar();
}

// Guarda (o crea) el cliente en la base sin necesidad de crear un ticket.
function guardarCliente() {
  const pares = CAMPOS_CLIENTE.map((id) => [id, reglas[id]]);
  if (!validarCampos(pares)) {
    mostrarAlertaCliente("Revise los campos marcados en rojo del cliente.", "danger");
    return false;
  }

  try {
    const cliente = upsertCliente();
    clienteBase = leerCamposCliente();
    clienteEstado = "existente";
    mostrarBadge("Cliente existente", "bg-success");
    mostrarAlertaCliente(`Datos del cliente <strong>${escapar(cliente.documento)}</strong> guardados.`);
    actualizarBotonGuardar();
    return true;
  } catch {
    mostrarAlertaCliente("No se pudo guardar. El almacenamiento del navegador puede estar lleno.", "danger");
    return false;
  }
}

// Crea o actualiza el cliente según el documento del formulario (misma base "clientes:v1"
// que usa el módulo de administración de clientes).
function upsertCliente() {
  const clientes = leer(CLAVE_CLIENTES, clientesSemilla);
  const { documento } = leerCamposCliente();
  const datosCliente = {
    nombre: campo("nombre"),
    apellido: campo("apellido"),
    email: campo("email"),
    telefono: campo("telefono"),
    telefono2: campo("telefono2"),
  };

  let cliente = clientes.find((c) => String(c.documento ?? "") === documento);
  if (cliente) {
    Object.assign(cliente, datosCliente);
  } else {
    cliente = { id: maxId(clientes) + 1, documento, ...datosCliente };
    clientes.push(cliente);
  }
  guardar(CLAVE_CLIENTES, clientes);
  return cliente;
}

document.getElementById("buscar-cliente").addEventListener("click", buscarPorDocumento);
inputDocumento.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  buscarPorDocumento();
});

// Cambiar el documento invalida la búsqueda anterior (evita guardar con otro documento).
inputDocumento.addEventListener("input", () => {
  ocultarBadge();
  clienteBase = null;
  clienteEstado = "sin-buscar";
  ocultarAlertaCliente();
  actualizarBotonGuardar();
});

// Cualquier edición en los datos del cliente recalcula si hay cambios sin guardar.
CAMPOS_CLIENTE.forEach((id) => {
  document.getElementById(id).addEventListener("input", () => {
    if (id !== "documento") ocultarAlertaCliente();
    actualizarBotonGuardar();
  });
});

btnGuardarCliente.addEventListener("click", guardarCliente);

// ---------- Alta de ingreso ----------

function registrarIngreso({ via, diagnostico = "", reparacion = "", monto = 0 }) {
  const tickets = leer(CLAVE_TICKETS, ticketsSemilla);
  const mostrador = via === "mostrador";

  // Mismo upsert que usa el botón "Guardar datos del cliente".
  const cliente = upsertCliente();

  const id = maxId(tickets) + 1;
  const { fecha, hora } = ahora();
  const textoNota = mostrador
    ? `Servicio en mostrador. Reparación realizada: ${reparacion}`
    : "Equipo recibido en recepción, en cola de diagnóstico.";

  const ticket = {
    id,
    numero: `T-${1000 + id}`,
    idCliente: cliente.id,
    fechaIngreso: fecha,
    tipoDispositivo: campo("tipodispositivo"),
    marca: campo("marca"),
    modelo: campo("modelo"),
    serial: campo("serial"),
    dispositivo: `${campo("marca")} ${campo("modelo")}`,
    descripcion: campo("descripcion"),
    saldoPendiente: mostrador ? monto : 0,
    diagnostico: mostrador ? diagnostico : "",
    fotosIngreso: [...fotosIngreso],
    estado: mostrador ? "Listo" : "Pendiente",
    historial: mostrador
      ? [
          { estado: "Pendiente", fecha, hora },
          { estado: "Listo", fecha, hora },
        ]
      : [{ estado: "Pendiente", fecha, hora }],
    notas: [{ id: Date.now(), texto: textoNota, fecha, hora, autor: "Recepción", fotos: [] }],
    repuestos: [],
    casillero: siguienteCasillero(tickets, mostrador ? "M" : "C"),
    via: mostrador ? "mostrador" : "normal",
  };

  if (mostrador) {
    ticket.servicioMostrador = {
      diagnostico,
      reparacion,
      fotosReparacion: [...fotosReparacion],
    };
  }

  tickets.push(ticket);
  guardar(CLAVE_TICKETS, tickets);
  return ticket;
}

function limpiarFormulario() {
  form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
  form.reset();
  fotosIngreso.length = 0;
  renderFotos(fotosIngreso, previewIngreso);
  ocultarBadge();
  clienteBase = null;
  clienteEstado = "sin-buscar";
  ocultarAlertaCliente();
  btnGuardarCliente.disabled = true;
}

function prepararModal() {
  modalMostrador.querySelectorAll("textarea, input").forEach((el) => {
    if (el.type !== "file") el.value = "";
    el.classList.remove("is-invalid");
  });
  fotosReparacion.length = 0;
  renderFotos(fotosReparacion, previewReparacion);
  inputFotosReparacion.value = "";
}

// Ticket normal: se crea en segundo plano y el formulario queda listo para el siguiente ingreso.
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validarFormulario()) {
    mostrarAlerta("Revise los campos marcados en rojo.", "danger");
    return;
  }
  try {
    const ticket = registrarIngreso({ via: "normal" });
    limpiarFormulario();
    mostrarAlerta(
      `Ticket <strong>${escapar(ticket.numero)}</strong> creado. Casillero asignado: <strong>${escapar(ticket.casillero)}</strong>.`,
    );
  } catch {
    mostrarAlerta("No se pudo guardar. El almacenamiento del navegador puede estar lleno.", "danger");
  }
});

// Servicio en mostrador: valida el ingreso y abre el modal de diagnóstico y reparación.
btnMostrador.addEventListener("click", () => {
  if (!validarFormulario()) {
    mostrarAlerta("Revise los campos marcados en rojo antes del servicio en mostrador.", "danger");
    return;
  }
  prepararModal();
  bootstrap.Modal.getOrCreateInstance(modalMostrador).show();
});

// Guardar modal: crea el ticket de mostrador y pasa a caja para el pago.
btnGuardarMostrador.addEventListener("click", () => {
  const valido = validarCampos(Object.entries(reglasModal));
  if (!valido) return;

  try {
    const ticket = registrarIngreso({
      via: "mostrador",
      diagnostico: campo("mostrador-diagnostico"),
      reparacion: campo("mostrador-reparacion"),
      monto: Number(campo("mostrador-valor")),
    });
    window.location.href = `/caja?ticket=${ticket.id}`;
  } catch {
    bootstrap.Modal.getOrCreateInstance(modalMostrador).hide();
    mostrarAlerta("No se pudo guardar. El almacenamiento del navegador puede estar lleno.", "danger");
  }
});
