// src/data/clientes.ts
// Tipos y semilla de clientes (maquetado: los cambios se guardan en localStorage).

export interface Cliente {
  id: number;
  documento: string;
  nombre: string;
  apellido: string;
  telefono: string;
  telefono2?: string;
  email: string;
}

export const clientesIniciales: Cliente[] = [
  { id: 1, documento: "1001001001", nombre: "Juan", apellido: "Pérez", telefono: "3101234567", email: "juan.perez@correo.com" },
  { id: 2, documento: "1002002002", nombre: "María", apellido: "López", telefono: "3107654321", email: "maria.lopez@correo.com" },
  { id: 3, documento: "1003003003", nombre: "Carlos", apellido: "Díaz", telefono: "3112345678", email: "carlos.diaz@correo.com" },
  { id: 4, documento: "1004004004", nombre: "Ana", apellido: "Gómez", telefono: "3125551234", email: "ana.gomez@correo.com" },
  { id: 5, documento: "1005005005", nombre: "Luis", apellido: "Torres", telefono: "3138889900", email: "luis.torres@correo.com" },
  { id: 6, documento: "1006006006", nombre: "Laura", apellido: "Rojas", telefono: "3146667788", email: "laura.rojas@correo.com" },
];
