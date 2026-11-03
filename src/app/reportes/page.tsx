"use client";

import { useState } from "react";
import SoloRoles from "@/components/SoloRoles";
import Aviso from "@/components/ui/Aviso";
import Boton from "@/components/ui/Boton";
import Paginacion from "@/components/ui/Paginacion";
import Icono from "@/components/Icono";
import { listarMedicos } from "@/lib/medicos";
import { descargarReporte, listarBitacora, listarReporte, type FilaReporte, type RegistroBitacora } from "@/lib/reportes";
import { useConsulta } from "@/lib/useConsulta";

function fechaHoy() {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
}

const estadoTexto: Record<string, string> = {
  programada: "Programada", confirmada: "Confirmada", en_atencion: "En atención",
  atendida: "Atendida", cancelada: "Cancelada", no_asistio: "No asistió",
};

function fechaLegible(valor: string) {
  const fecha = new Date(valor);
  return Number.isNaN(fecha.valueOf()) ? valor : new Intl.DateTimeFormat("es-GT", { dateStyle: "short", timeStyle: "short" }).format(fecha);
}

function Reportes() {
  const hoy = fechaHoy();
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [medicoId, setMedicoId] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [pestana, setPestana] = useState<"citas" | "bitacora">("citas");
  const [descargando, setDescargando] = useState(false);
  const [errorDescarga, setErrorDescarga] = useState("");
  const medicos = useConsulta("reportes-medicos", listarMedicos);
  const filtros = { desde, hasta, pagina };
  const clave = `${desde}-${hasta}-${medicoId}-${pagina}-${pestana}`;
  const citas = useConsulta(clave, () => listarReporte({ ...filtros, medico_id: medicoId || undefined }));
  const bitacora = useConsulta(clave, () => listarBitacora(filtros));
  const cargando = pestana === "citas" ? citas.cargando : bitacora.cargando;
  const error = pestana === "citas" ? citas.error : bitacora.error;
  const paginacion = pestana === "citas" ? citas.datos?.paginacion : bitacora.datos?.paginacion;

  function cambiarRango(campo: "desde" | "hasta", valor: string) {
    if (campo === "desde") setDesde(valor);
    else setHasta(valor);
    setPagina(1);
  }

  async function exportar(formato: "xlsx" | "csv") {
    setErrorDescarga("");
    setDescargando(true);
    try { await descargarReporte({ desde, hasta, medico_id: medicoId || undefined, formato }); }
    catch (e) { setErrorDescarga(e instanceof Error ? e.message : "No se pudo exportar el reporte."); }
    finally { setDescargando(false); }
  }

  return <section className="mx-auto w-full max-w-[88rem] space-y-5 sm:space-y-6">
    <header>
      <p className="text-xs font-bold tracking-[0.16em] text-hoja uppercase">Administración · Análisis</p>
      <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-pino sm:text-5xl">Reportes y actividad</h1>
      <p className="mt-1.5 max-w-3xl text-base text-tinta/65">Consulta las citas por periodo, exporta los resultados y revisa la actividad en expedientes.</p>
    </header>

    <div className="grid gap-3 rounded-2xl border border-white/90 bg-white/85 p-4 shadow-[0_6px_20px_rgba(18,55,42,0.065)] ring-1 ring-pino/[0.035] backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto] lg:items-end lg:gap-3.5 lg:p-5">
      <label className="text-sm font-semibold text-tinta">Desde<span className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-[#d2e5dd] bg-white px-1.5 transition focus-within:border-hoja focus-within:ring-2 focus-within:ring-hoja/20"><span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Icono nombre="citas" className="size-5" /></span><input aria-label="Fecha desde" type="date" value={desde} max={hasta} onChange={e => cambiarRango("desde", e.target.value)} className="h-full min-w-0 flex-1 border-0 bg-transparent px-1 text-sm font-normal text-tinta outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0" /></span></label>
      <label className="text-sm font-semibold text-tinta">Hasta<span className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-[#d2e5dd] bg-white px-1.5 transition focus-within:border-hoja focus-within:ring-2 focus-within:ring-hoja/20"><span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Icono nombre="citas" className="size-5" /></span><input aria-label="Fecha hasta" type="date" value={hasta} min={desde} onChange={e => cambiarRango("hasta", e.target.value)} className="h-full min-w-0 flex-1 border-0 bg-transparent px-1 text-sm font-normal text-tinta outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0" /></span></label>
      <label className="text-sm font-semibold text-tinta">Médico<span className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-[#d2e5dd] bg-white px-1.5 transition focus-within:border-hoja focus-within:ring-2 focus-within:ring-hoja/20"><span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-700"><Icono nombre="medicos" className="size-5" /></span><select aria-label="Filtrar por médico" value={medicoId} onChange={e => { setMedicoId(Number(e.target.value)); setPagina(1); }} className="h-full min-w-0 flex-1 border-0 bg-transparent px-1 text-sm font-normal text-tinta outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"><option value={0}>Todos</option>{medicos.datos?.medicos.map(m => <option key={m.id} value={m.id}>{m.nombre} {m.apellido}</option>)}</select></span></label>
      <Boton variante="secundario" disabled={descargando} onClick={() => void exportar("xlsx")} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border-emerald-100 bg-emerald-50/80 px-4 text-emerald-900 hover:bg-emerald-100"><span className="grid size-7 place-items-center rounded-lg bg-emerald-100 text-emerald-700"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z"/><path d="M13 3v7h7M8 14l4 5m0-5-4 5"/></svg></span>{descargando ? "Preparando…" : "Exportar Excel"}</Boton>
      <Boton variante="secundario" disabled={descargando} onClick={() => void exportar("csv")} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border-sky-100 bg-sky-50/80 px-4 text-sky-900 hover:bg-sky-100"><span className="grid size-7 place-items-center rounded-lg bg-sky-100 text-sky-700"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z"/><path d="M13 3v7h7M8 14h8M8 17h8"/></svg></span>CSV</Boton>
    </div>
    {errorDescarga && <Aviso>{errorDescarga}</Aviso>}

    <div className="flex gap-2 border-b border-tinta/10" role="tablist" aria-label="Tipo de reporte">
      <button type="button" role="tab" aria-selected={pestana === "citas"} onClick={() => { setPestana("citas"); setPagina(1); }} className={`inline-flex items-center gap-2.5 border-b-[3px] px-4 py-3 font-semibold transition-colors ${pestana === "citas" ? "border-hoja bg-emerald-50/80 text-pino" : "border-transparent text-tinta/60 hover:bg-white/60"}`}><Icono nombre="citas" className="size-5" />Citas</button>
      <button type="button" role="tab" aria-selected={pestana === "bitacora"} onClick={() => { setPestana("bitacora"); setPagina(1); }} className={`inline-flex items-center gap-2.5 border-b-[3px] px-4 py-3 font-semibold transition-colors ${pestana === "bitacora" ? "border-hoja bg-emerald-50/80 text-pino" : "border-transparent text-tinta/60 hover:bg-white/60"}`}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></svg>Bitácora de expedientes</button>
    </div>

    {(error || medicos.error) && <Aviso>{error || medicos.error}</Aviso>}
    <div className="overflow-hidden rounded-2xl border border-white/90 bg-white/85 shadow-[0_8px_26px_rgba(18,55,42,0.075)] ring-1 ring-pino/[0.035] backdrop-blur-sm" aria-busy={cargando}>
      {cargando ? <p className="p-8 text-center text-tinta/60">Cargando reporte…</p> : pestana === "citas" ? <TablaCitas filas={citas.datos?.datos ?? []} /> : <TablaBitacora filas={bitacora.datos?.datos ?? []} />}
    </div>
    {paginacion && <Paginacion paginacion={paginacion} alCambiar={setPagina} />}
  </section>;
}

function TablaCitas({ filas }: { filas: FilaReporte[] }) {
  if (!filas.length) return <div className="grid min-h-[290px] place-items-center px-5 py-12 text-center sm:min-h-[330px]"><div><span className="mx-auto grid size-24 place-items-center rounded-full bg-emerald-100/70 text-emerald-700"><span className="relative"><Icono nombre="citas" className="size-11"/><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="absolute -bottom-2 -right-3 size-7 rounded-full bg-emerald-100"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg></span></span><h2 className="mt-5 font-display text-xl font-bold text-pino">No hay citas para los filtros seleccionados.</h2><p className="mt-1.5 text-tinta/60">Intenta cambiar el rango de fechas, el médico o limpiar los filtros.</p></div></div>;
  return <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#f2f8f5] text-xs uppercase tracking-[0.07em] text-tinta/60"><tr>{["Fecha", "Paciente", "Médico", "Especialidad", "Estado", "Motivo"].map(x => <th key={x} className="px-4 py-3.5 font-bold">{x}</th>)}</tr></thead><tbody className="divide-y divide-tinta/10">{filas.map((fila, i) => <tr key={`${fila.fecha}-${fila.hora}-${i}`} className="transition-colors hover:bg-[#f7fbf9]"><td className="whitespace-nowrap px-4 py-3.5 font-medium text-pino">{fila.fecha} · {fila.hora}</td><td className="px-4 py-3.5">{fila.paciente}</td><td className="px-4 py-3.5">{fila.medico}</td><td className="px-4 py-3.5">{fila.especialidad}</td><td className="px-4 py-3.5"><span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{estadoTexto[fila.estado] ?? fila.estado}</span></td><td className="max-w-56 px-4 py-3.5">{fila.motivo_cancelacion || fila.motivo || "—"}</td></tr>)}</tbody></table></div>;
}

function TablaBitacora({ filas }: { filas: RegistroBitacora[] }) {
  if (!filas.length) return <div className="grid min-h-[290px] place-items-center px-5 py-12 text-center sm:min-h-[330px]"><div><span className="mx-auto grid size-24 place-items-center rounded-full bg-violet-100/70 text-violet-700"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-11"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></svg></span><h2 className="mt-5 font-display text-xl font-bold text-pino">No hay actividad registrada en expedientes.</h2><p className="mt-1.5 text-tinta/60">Prueba con otro periodo para consultar movimientos.</p></div></div>;
  return <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-[#f2f8f5] text-xs uppercase tracking-[0.07em] text-tinta/60"><tr>{["Fecha y hora", "Usuario", "Paciente", "Acción", "Detalle"].map(x => <th key={x} className="px-4 py-3.5 font-bold">{x}</th>)}</tr></thead><tbody className="divide-y divide-tinta/10">{filas.map(fila => <tr key={fila.id} className="transition-colors hover:bg-[#f7fbf9]"><td className="whitespace-nowrap px-4 py-3.5 font-medium text-pino">{fechaLegible(fila.fecha)}</td><td className="px-4 py-3.5">{fila.usuario}</td><td className="px-4 py-3.5">{fila.paciente}</td><td className="px-4 py-3.5"><span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">{fila.accion}</span></td><td className="max-w-72 px-4 py-3.5">{fila.detalle || "—"}</td></tr>)}</tbody></table></div>;
}

export default function ReportesPage() {
  return <SoloRoles roles={["administrador"]}><Reportes /></SoloRoles>;
}
