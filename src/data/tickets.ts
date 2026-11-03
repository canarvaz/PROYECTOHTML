// src/data/tickets.ts
// Tipos y semilla de tickets. En runtime los cambios se guardan en localStorage ("tickets:v1").

export type EstadoTicket =
  | "Pendiente"
  | "En diagnóstico"
  | "En reparación"
  | "Listo"
  | "Entregado";

export const flujoEstados: EstadoTicket[] = [
  "Pendiente",
  "En diagnóstico",
  "En reparación",
  "Listo",
  "Entregado",
];

export interface HistorialEstado {
  estado: EstadoTicket;
  fecha: string;
  hora: string;
}

export interface NotaTicket {
  id: number;
  texto: string;
  fecha: string;
  hora: string;
  autor: string;
  fotos: string[];
}

export interface RepuestoTicket {
  id: number;
  descripcion: string;
  cantidad: number;
  valor: number;
  estado: "Pendiente" | "Instalado";
}

export interface Ticket {
  id: number;
  numero: string;
  idCliente: number;
  fechaIngreso: string;
  tipoDispositivo: string;
  marca: string;
  modelo: string;
  serial: string;
  dispositivo: string;
  descripcion: string;
  saldoPendiente: number;
  diagnostico: string;
  fotosIngreso: string[];
  estado: EstadoTicket;
  historial: HistorialEstado[];
  notas: NotaTicket[];
  repuestos: RepuestoTicket[];
}

// ---------- Semilla ----------

const dispositivos = [
  { tipo: "Smartphone", marca: "Apple", modelo: "iPhone 12" },
  { tipo: "Smartphone", marca: "Samsung", modelo: "Galaxy S21" },
  { tipo: "Laptop", marca: "Apple", modelo: "MacBook Air" },
  { tipo: "Laptop", marca: "Dell", modelo: "Inspiron 15" },
  { tipo: "Smartphone", marca: "Xiaomi", modelo: "Redmi Note 11" },
  { tipo: "Laptop", marca: "HP", modelo: "Pavilion 15" },
  { tipo: "Tablet", marca: "Apple", modelo: "iPad Air" },
  { tipo: "Laptop", marca: "Lenovo", modelo: "ThinkPad T14" },
];

const fallas = [
  "Pantalla rota, requiere reemplazo",
  "Batería se descarga rápidamente",
  "No enciende después de una caída",
  "Teclas del teclado sin respuesta",
  "Sobrecalentamiento durante el uso",
  "Puerto de carga dañado",
  "Limpieza interna y cambio de pasta térmica",
  "Error de software, requiere reinstalación",
];

const textosNota: Record<EstadoTicket, string> = {
  Pendiente: "Equipo recibido en recepción, en cola de diagnóstico.",
  "En diagnóstico": "Se realiza el diagnóstico inicial y se identifica la falla principal.",
  "En reparación": "Se aprueba el presupuesto y se inicia la reparación en taller.",
  Listo: "Reparación finalizada y equipo probado. Listo para entrega.",
  Entregado: "Equipo entregado al cliente con firma de conformidad.",
};

const repuestosCatalogo = [
  { descripcion: "Pantalla OLED", valor: 350000 },
  { descripcion: "Batería original", valor: 180000 },
  { descripcion: "Flex de carga", valor: 95000 },
  { descripcion: "Teclado (teclas sin respuesta)", valor: 140000 },
  { descripcion: "Disipador + pasta térmica", valor: 60000 },
];

// Tickets por cliente (índice 0 = cliente 1). Varias cantidades > 10 para probar paginación.
const cantidadPorCliente = [3, 12, 0, 15, 10, 1];

const pad = (n: number) => String(n).padStart(2, "0");

function sumarDias(fechaIso: string, dias: number): string {
  const fecha = new Date(`${fechaIso}T12:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

let secuencia = 0;

export const ticketsIniciales: Ticket[] = cantidadPorCliente.flatMap((cantidad, i) =>
  Array.from({ length: cantidad }, () => {
    secuencia += 1;
    const id = secuencia;
    const disp = dispositivos[(id - 1) % dispositivos.length];
    const falla = fallas[(id - 1) % fallas.length];
    const indiceEstado = id % flujoEstados.length;
    const estado = flujoEstados[indiceEstado];

    const fechaIngreso = `2026-${pad(((id * 7) % 9) + 1)}-${pad(((id * 11) % 27) + 1)}`;

    const historial: HistorialEstado[] = flujoEstados.slice(0, indiceEstado + 1).map((e, paso) => ({
      estado: e,
      fecha: sumarDias(fechaIngreso, paso * 2),
      hora: `${pad(8 + ((id + paso) % 10))}:${pad((id * 13 + paso * 7) % 60)}`,
    }));

    const notas: NotaTicket[] = historial.map((evento, paso) => ({
      id: id * 100 + paso,
      texto: textosNota[evento.estado],
      fecha: evento.fecha,
      hora: evento.hora,
      autor: paso <= 1 ? "Recepción" : "Taller",
      fotos: paso > 0 && paso % 2 === 1 ? ["/img/tickets/nota-1.svg"] : [],
    }));

    const enTaller = indiceEstado >= flujoEstados.indexOf("En reparación");
    const repuestos: RepuestoTicket[] = enTaller
      ? Array.from({ length: (id % 3) + 1 }, (_, r) => {
          const item = repuestosCatalogo[(id + r) % repuestosCatalogo.length];
          return {
            id: id * 100 + r,
            descripcion: item.descripcion,
            cantidad: 1,
            valor: item.valor,
            estado: indiceEstado >= flujoEstados.indexOf("Listo") ? "Instalado" : "Pendiente",
          };
        })
      : [];

    const numFotos = (id % 3) + 1;

    return {
      id,
      numero: `T-${1000 + id}`,
      idCliente: i + 1,
      fechaIngreso,
      tipoDispositivo: disp.tipo,
      marca: disp.marca,
      modelo: disp.modelo,
      serial: `${disp.tipo.slice(0, 3).toUpperCase()}-${100000 + id * 137}`,
      dispositivo: `${disp.marca} ${disp.modelo}`,
      descripcion: falla,
      saldoPendiente: id % 3 === 0 ? 0 : (id % 5) * 45000,
      // Sin diagnóstico en "Pendiente": queda editable para recepción/taller.
      diagnostico:
        indiceEstado === 0
          ? ""
          : `Falla confirmada: ${falla.toLowerCase()}. Se requiere intervención de taller.`,
      fotosIngreso: Array.from(
        { length: numFotos },
        (_, f) => `/img/tickets/ingreso-${(id + f) % 3 + 1}.svg`,
      ),
      estado,
      historial,
      notas,
      repuestos,
    };
  }),
);
