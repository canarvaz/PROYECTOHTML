// src/data/clientes.ts
// Tipos y semilla de clientes (maquetado: los cambios se guardan en localStorage).

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
}

export const clientesIniciales: Cliente[] = [
  { id: 1, nombre: "Juan", apellido: "Pérez", telefono: "3101234567", email: "juan.perez@correo.com" },
  { id: 2, nombre: "María", apellido: "López", telefono: "3107654321", email: "maria.lopez@correo.com" },
  { id: 3, nombre: "Carlos", apellido: "Díaz", telefono: "3112345678", email: "carlos.diaz@correo.com" },
  { id: 4, nombre: "Ana", apellido: "Gómez", telefono: "3125551234", email: "ana.gomez@correo.com" },
  { id: 5, nombre: "Luis", apellido: "Torres", telefono: "3138889900", email: "luis.torres@correo.com" },
  { id: 6, nombre: "Laura", apellido: "Rojas", telefono: "3146667788", email: "laura.rojas@correo.com" },
];
