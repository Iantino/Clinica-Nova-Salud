import { api } from "./api";
import { query, type Paginado } from "./tipos";
import type { DatosPaciente } from "./pacientes";
import type { HorarioMedico } from "./medicos";
import type { EstadoCita } from "./citas";

export type MedicoPortal = {
  id: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  horarios: HorarioMedico[];
};

export type CitaPortal = {
  id: number;
  medico_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: EstadoCita;
  motivo: string | null;
  motivo_cancelacion: string | null;
  medico_nombre: string;
  medico_apellido: string;
  especialidad: string;
};

export function registrarPaciente(datos: DatosPaciente & { password: string }) {
  return api<{ usuario: { id: number; nombre: string; apellido: string; correo: string; rol: "paciente" }; paciente_id: number }>(
    "/api/portal/registro",
    { method: "POST", body: JSON.stringify(datos) },
  );
}

export function listarMedicosPortal() {
  return api<{ medicos: MedicoPortal[] }>("/api/portal/medicos");
}

export function consultarDisponibilidad(medico_id: number, fecha: string) {
  return api<{ horarios: string[] }>(`/api/portal/disponibilidad${query({ medico_id, fecha })}`);
}

export function listarMisCitas(pagina: number) {
  return api<Paginado<CitaPortal>>(`/api/portal/citas${query({ pagina })}`);
}

export function solicitarCita(datos: { medico_id: number; fecha: string; hora_inicio: string; motivo?: string }) {
  return api<{ cita: unknown }>("/api/portal/citas", { method: "POST", body: JSON.stringify(datos) });
}

export function reprogramarMiCita(id: number, datos: { medico_id: number; fecha: string; hora_inicio: string }) {
  return api<{ cita: CitaPortal }>(`/api/portal/citas/${id}/reprogramar`, { method: "PUT", body: JSON.stringify(datos) });
}

export function cancelarMiCita(id: number, motivo_cancelacion: string) {
  return api<{ mensaje: string }>(`/api/portal/citas/${id}/cancelar`, {
    method: "PATCH", body: JSON.stringify({ motivo_cancelacion }),
  });
}
