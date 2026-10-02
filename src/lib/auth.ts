import { api } from "./api";

export type Rol = "administrador" | "recepcionista" | "medico" | "paciente";

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: Rol;
}

export function iniciarSesion(correo: string, password: string) {
  return api<{ usuario: Usuario }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ correo, password }),
  });
}

export function cerrarSesion() {
  return api<void>("/api/auth/logout", { method: "POST" });
}

export function obtenerSesion() {
  return api<{ usuario: Usuario }>("/api/auth/me");
}
