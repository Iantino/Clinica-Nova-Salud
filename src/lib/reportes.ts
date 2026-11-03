import { api, ApiError } from "./api";

export type ResumenDiario = {
  fecha: string;
  total: number;
  programadas: number;
  confirmadas: number;
  atendidas: number;
  canceladas: number;
  inasistencias: number;
};

export type FilaReporte = {
  fecha: string;
  hora: string;
  paciente: string;
  medico: string;
  especialidad: string;
  estado: string;
  motivo: string;
  motivo_cancelacion: string;
};

export type RegistroBitacora = {
  id: number;
  fecha: string;
  accion: string;
  detalle: string | null;
  usuario: string;
  paciente: string;
};

export type Pagina<T> = {
  datos: T[];
  paginacion: { pagina: number; porPagina: number; total: number; totalPaginas: number };
};

export function obtenerResumen(fecha: string) {
  return api<{ resumen: ResumenDiario }>(`/api/reportes/resumen?fecha=${encodeURIComponent(fecha)}`);
}

export function listarReporte(filtros: { desde: string; hasta: string; medico_id?: number; pagina: number }) {
  const params = new URLSearchParams({ desde: filtros.desde, hasta: filtros.hasta, pagina: String(filtros.pagina) });
  if (filtros.medico_id) params.set("medico_id", String(filtros.medico_id));
  return api<Pagina<FilaReporte>>(`/api/reportes/citas?${params}`);
}

export function listarBitacora(filtros: { desde: string; hasta: string; pagina: number }) {
  const params = new URLSearchParams({ desde: filtros.desde, hasta: filtros.hasta, pagina: String(filtros.pagina) });
  return api<Pagina<RegistroBitacora>>(`/api/reportes/bitacora?${params}`);
}

export async function descargarReporte(filtros: { desde: string; hasta: string; medico_id?: number; formato: "xlsx" | "csv" }) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === "production" ? "" : "http://localhost:4000");
  const params = new URLSearchParams({ desde: filtros.desde, hasta: filtros.hasta, formato: filtros.formato });
  if (filtros.medico_id) params.set("medico_id", String(filtros.medico_id));
  let respuesta: Response;
  try {
    respuesta = await fetch(`${base}/api/reportes/exportar?${params}`, { credentials: "include" });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor. Intenta de nuevo en unos minutos.", 0);
  }
  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => ({}));
    throw new ApiError(datos.message ?? "No se pudo descargar el reporte.", respuesta.status, datos.errores, datos.datos);
  }
  const url = URL.createObjectURL(await respuesta.blob());
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `reporte-citas-${filtros.desde}-${filtros.hasta}.${filtros.formato}`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
