import { api } from "./api";
import type { Rol } from "./auth";
import { query, type Paginado } from "./tipos";

export type UsuarioGestion = {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: Rol;
  activo: boolean;
  bloqueado: boolean;
  creado_en: string;
};

export type DatosUsuario = {
  nombre: string;
  apellido: string;
  correo: string;
  rol?: "administrador" | "recepcionista";
  password?: string;
};

export function listarUsuarios(filtros: { buscar?: string; rol?: string; pagina: number }) {
  return api<Paginado<UsuarioGestion>>(`/api/usuarios${query(filtros)}`);
}

export function crearUsuario(datos: DatosUsuario) {
  return api<{ usuario: UsuarioGestion }>("/api/usuarios", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function actualizarUsuario(id: number, datos: DatosUsuario) {
  return api<{ usuario: UsuarioGestion }>(`/api/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

export function cambiarEstadoUsuario(id: number, activo: boolean) {
  return api<{ usuario: UsuarioGestion }>(`/api/usuarios/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ activo }),
  });
}
