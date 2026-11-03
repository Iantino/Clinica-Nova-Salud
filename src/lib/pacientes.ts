import { api } from "./api";
import { query, type Paginado } from "./tipos";

export type PacienteResumen = {
  id: number;
  dpi: string | null;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  sexo: "F" | "M";
  telefono: string;
  edad: number;
};

export type DatosPaciente = {
  dpi: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  sexo: "F" | "M" | "";
  telefono: string;
  correo: string;
  direccion: string;
  nombre_encargado: string;
  alergias: string;
  antecedentes: string;
};

export type Paciente = PacienteResumen & {
  [K in keyof DatosPaciente]: DatosPaciente[K] | null;
} & { sexo: "F" | "M" };

export const PACIENTE_VACIO: DatosPaciente = {
  dpi: "",
  nombre: "",
  apellido: "",
  fecha_nacimiento: "",
  sexo: "",
  telefono: "",
  correo: "",
  direccion: "",
  nombre_encargado: "",
  alergias: "",
  antecedentes: "",
};

// RF-04: el filtro se aplica a partir de 3 caracteres
export const MINIMO_BUSQUEDA = 3;

export function listarPacientes(filtros: { buscar?: string; pagina: number }) {
  return api<Paginado<PacienteResumen>>(`/api/pacientes${query(filtros)}`);
}

export function obtenerPaciente(id: number) {
  return api<{ paciente: Paciente }>(`/api/pacientes/${id}`);
}

export function crearPaciente(datos: DatosPaciente) {
  return api<{ paciente: Paciente }>("/api/pacientes", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function actualizarPaciente(id: number, datos: DatosPaciente) {
  return api<{ paciente: Paciente }>(`/api/pacientes/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

// Edad cumplida según la fecha de nacimiento (AAAA-MM-DD)
export function edadDesde(fecha: string): number | null {
  const partes = fecha.split("-").map(Number);
  if (partes.length !== 3 || partes.some(Number.isNaN)) return null;
  const [anio, mes, dia] = partes;
  const hoy = new Date();
  let edad = hoy.getFullYear() - anio;
  if (hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)) edad -= 1;
  return edad >= 0 ? edad : null;
}
