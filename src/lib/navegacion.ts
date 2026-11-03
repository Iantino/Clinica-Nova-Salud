import type { Rol } from "./auth";

export type EnlaceMenu = { href: string; texto: string; roles: Rol[] };

// Cada módulo aparece solo para los roles que pueden usarlo.
// La API valida los mismos permisos (RNF-05).
export const MENU: EnlaceMenu[] = [
  { href: "/panel", texto: "Inicio", roles: ["administrador", "recepcionista", "medico"] },
  { href: "/pacientes", texto: "Pacientes", roles: ["administrador", "recepcionista", "medico"] },
  { href: "/citas", texto: "Citas", roles: ["administrador", "recepcionista", "medico"] },
  { href: "/medicos", texto: "Médicos", roles: ["administrador"] },
  { href: "/usuarios", texto: "Usuarios", roles: ["administrador"] },
  { href: "/reportes", texto: "Reportes", roles: ["administrador"] },
  { href: "/mis-citas", texto: "Mis citas", roles: ["paciente"] },
];

export const NOMBRE_ROL: Record<Rol, string> = {
  administrador: "Administración",
  recepcionista: "Recepción",
  medico: "Médico",
  paciente: "Paciente",
};

export function menuPara(rol: Rol) {
  return MENU.filter((enlace) => enlace.roles.includes(rol));
}
