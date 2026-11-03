import { api } from "./api";

export type MedicamentoReceta = { id?: number; medicamento: string; dosis: string; frecuencia: string; duracion: string };
export type Receta = { id: number; indicaciones_generales: string | null; medicamentos: MedicamentoReceta[] };

export type Consulta = {
  id: number;
  cita_id: number;
  paciente_id: number;
  fecha: string;
  hora_inicio: string;
  paciente_nombre: string;
  paciente_apellido: string;
  medico_nombre: string;
  medico_apellido: string;
  especialidad: string;
  motivo_consulta: string;
  presion_arterial: string | null;
  frecuencia_cardiaca: number | null;
  temperatura: number | null;
  peso_kg: number | null;
  talla_cm: number | null;
  diagnostico: string;
  tratamiento: string | null;
  notas: string | null;
  creado_en: string;
  receta: Receta | null;
};

export type ConsultaHistorial = Pick<Consulta, "id" | "cita_id" | "motivo_consulta" | "presion_arterial" | "frecuencia_cardiaca" | "temperatura" | "peso_kg" | "talla_cm" | "diagnostico" | "tratamiento" | "notas" | "fecha" | "hora_inicio" | "medico_nombre" | "medico_apellido" | "especialidad">;

export type DatosConsulta = {
  cita_id: number;
  motivo_consulta: string;
  presion_arterial: string;
  frecuencia_cardiaca: number | null;
  temperatura: number | null;
  peso_kg: number | null;
  talla_cm: number | null;
  diagnostico: string;
  tratamiento: string;
  notas: string;
};

export function historialPaciente(id: number) {
  return api<{ consultas: ConsultaHistorial[] }>(`/api/consultas/pacientes/${id}`);
}

export function obtenerConsulta(id: number) {
  return api<{ consulta: Consulta }>(`/api/consultas/${id}`);
}

export function crearConsulta(datos: DatosConsulta) {
  return api<{ consulta: Consulta }>("/api/consultas", { method: "POST", body: JSON.stringify(datos) });
}

export function emitirReceta(id: number, datos: { indicaciones_generales: string; medicamentos: MedicamentoReceta[] }) {
  return api<{ consulta: Consulta }>(`/api/consultas/${id}/receta`, {
    method: "POST",
    body: JSON.stringify(datos),
  });
}
