import { api } from "./api";
export type HorarioMedico = {
  id?: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
};

export type Especialidad = { id: number; nombre: string; descripcion: string | null; activo: boolean };

export type Medico = {
  id: number;
  usuario_id: number;
  nombre: string;
  apellido: string;
  correo: string;
  activo: boolean;
  especialidad_id: number;
  especialidad: string;
  colegiado: string;
  telefono: string | null;
  horarios: HorarioMedico[];
};

export type DatosMedico = {
  nombre: string;
  apellido: string;
  correo: string;
  password?: string;
  especialidad_id: number;
  colegiado: string;
  telefono: string;
  horarios: HorarioMedico[];
};

export function listarMedicos() {
  return api<{ medicos: Medico[] }>("/api/medicos");
}

export function obtenerMedico(id: number) {
  return api<{ medico: Medico }>(`/api/medicos/${id}`);
}

export function listarEspecialidades() {
  return api<{ especialidades: Especialidad[] }>("/api/medicos/especialidades");
}

export function crearMedico(datos: DatosMedico) {
  return api<{ medico: Medico }>("/api/medicos", { method: "POST", body: JSON.stringify(datos) });
}

export function actualizarMedico(id: number, datos: DatosMedico) {
  return api<{ medico: Medico }>(`/api/medicos/${id}`, { method: "PUT", body: JSON.stringify(datos) });
}

export function cambiarEstadoMedico(id: number, activo: boolean) {
  return api<{ medico: Medico }>(`/api/medicos/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ activo }),
  });
}

export function crearEspecialidad(datos: { nombre: string; descripcion: string }) {
  return api<{ especialidad: Especialidad }>("/api/medicos/especialidades", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function actualizarEspecialidad(id: number, datos: { nombre: string; descripcion: string }) {
  return api<{ especialidad: Especialidad }>(`/api/medicos/especialidades/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}
