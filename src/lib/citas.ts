import { api } from "./api";
import { query, type Paginado } from "./tipos";

export type EstadoCita = "programada" | "confirmada" | "en_atencion" | "atendida" | "cancelada" | "no_asistio";

export type Cita = {
  id: number;
  paciente_id: number;
  medico_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: EstadoCita;
  motivo: string | null;
  motivo_cancelacion: string | null;
  paciente_nombre: string;
  paciente_apellido: string;
  paciente_telefono?: string;
  medico_nombre: string;
  medico_apellido: string;
  especialidad: string;
};

export type FiltrosCitas = { desde?: string; hasta?: string; medico_id?: number; estado?: EstadoCita; pagina?: number };

export function listarCitas(filtros: FiltrosCitas) {
  return api<Paginado<Cita>>(`/api/citas${query(filtros)}`);
}

export function obtenerCita(id: number) {
  return api<{ cita: Cita }>(`/api/citas/${id}`);
}

export function crearCita(datos: { paciente_id: number; medico_id: number; fecha: string; hora_inicio: string; motivo?: string }) {
  return api<{ cita: Cita }>("/api/citas", { method: "POST", body: JSON.stringify(datos) });
}

export function reprogramarCita(id: number, datos: { medico_id?: number; fecha: string; hora_inicio: string }) {
  return api<{ cita: Cita }>(`/api/citas/${id}/reprogramar`, { method: "PUT", body: JSON.stringify(datos) });
}

export function cancelarCita(id: number, motivo_cancelacion: string) {
  return api<{ cita: Cita }>(`/api/citas/${id}/cancelar`, {
    method: "PATCH",
    body: JSON.stringify({ motivo_cancelacion }),
  });
}

export function cambiarEstadoCita(id: number, estado: EstadoCita) {
  return api<{ cita: Cita }>(`/api/citas/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  });
}
