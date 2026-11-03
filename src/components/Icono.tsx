import type { ReactNode } from "react";

type NombreIcono = "inicio" | "pacientes" | "citas" | "medicos" | "usuarios" | "reportes" | "cancelar" | "dermatologia" | "pediatria";

const trazos: Record<NombreIcono, ReactNode> = {
  inicio: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-7h6v7"/></>,
  pacientes: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  citas: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h3"/></>,
  medicos: <><path d="M8 3v5a4 4 0 0 0 8 0V3M6 3h4M14 3h4M12 12v2a5 5 0 0 0 10 0v-1"/><circle cx="22" cy="11" r="1"/></>,
  usuarios: <><circle cx="9" cy="8" r="4"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 4.5a4 4 0 0 1 0 7.5M18 15a5 5 0 0 1 3 4.5V21"/></>,
  reportes: <><path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/></>,
  cancelar: <><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/></>,
  dermatologia: <><path d="M5 13h4l1.4 1.5h4.8l4.3-3.1a1.8 1.8 0 0 1 2.5 2.5l-5.2 5.4H8l-3-2.5H2"/><path d="M4 13v6M13 6.2c0 1.6-2 3.8-2 3.8s-2-2.2-2-3.8a2 2 0 1 1 4 0ZM20 4.8c0 1.2-1.5 2.7-1.5 2.7S17 6 17 4.8a1.5 1.5 0 1 1 3 0Z"/></>,
  pediatria: <><circle cx="12" cy="13" r="7.5"/><path d="M7.2 8.5 5.5 6.8M16.8 8.5l1.7-1.7M9.3 13h.1m5.2 0h.1M10 16.2c1.2.9 2.8.9 4 0M9 4.5c1.8-2 4.2-2 6 0"/><path d="M4.7 12.3 3 11m17 1.3 1.7-1.3"/></>,
};

export default function Icono({ nombre, className = "" }: { nombre: NombreIcono; className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>{trazos[nombre]}</svg>;
}

export type { NombreIcono };
