// src/data/admin.ts
// Tipos y funciones de conteo para la página admin (prototipo, sin backend).

export interface Usuario {
  iniciales: string;
  nombre: string;
  email: string;
  rol: string;
  permisos: string[];
  permisosExtra: number;
  estado: "Activo" | "Inactivo";
  ultimoAcceso: string;
  esTu?: boolean;
  avatarClase?: string;
}

export interface Metrica {
  valor: number;
  etiqueta: string;
  /** Clave de conteo: permite recalcular la tarjeta desde el DOM en el navegador. */
  clave?: "totales" | "activos" | "rol";
  /** Solo cuando clave === "rol": rol que se cuenta. */
  rol?: string;
}

// "Administrador" -> "Administradores", "Gestor" -> "Gestores"
function pluralizar(rol: string): string {
  const ultima = rol.trim().slice(-1).toLowerCase();
  const vocal = "aeiouáéíóú".includes(ultima);
  return rol + (vocal ? "s" : "es");
}

/**
 * Genera las métricas directamente desde la lista de usuarios:
 * - 2 tarjetas base (totales y activos)
 * - 1 tarjeta por cada rol distinto encontrado en la tabla
 */
export function calcularMetricas(usuarios: Usuario[]): Metrica[] {
  const base: Metrica[] = [
    { valor: usuarios.length, etiqueta: "Usuarios totales", clave: "totales" },
    {
      valor: usuarios.filter((u) => u.estado === "Activo").length,
      etiqueta: "Usuarios activos",
      clave: "activos",
    },
  ];

  const roles = [...new Set(usuarios.map((u) => u.rol))];
  const porRol: Metrica[] = roles.map((rol) => ({
    valor: usuarios.filter((u) => u.rol === rol).length,
    etiqueta: pluralizar(rol),
    clave: "rol",
    rol,
  }));

  return [...base, ...porRol];
}
