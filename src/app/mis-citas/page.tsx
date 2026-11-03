"use client";

import { useState } from "react";
import Aviso from "@/components/ui/Aviso";
import Boton from "@/components/ui/Boton";
import Paginacion from "@/components/ui/Paginacion";
import Icono from "@/components/Icono";
import SoloRoles from "@/components/SoloRoles";
import { useSesion } from "@/lib/sesion";
import { useConsulta } from "@/lib/useConsulta";
import { cancelarMiCita, listarMedicosPortal, listarMisCitas, type CitaPortal } from "@/lib/portal";
import type { EstadoCita } from "@/lib/citas";
import FormularioPortalCita from "./FormularioPortalCita";

const nombresEstado: Record<EstadoCita, string> = {
  programada: "Programada", confirmada: "Confirmada", en_atencion: "En atención",
  atendida: "Atendida", cancelada: "Cancelada", no_asistio: "No asististe",
};
const colorEstado: Record<EstadoCita, string> = {
  programada: "bg-menta text-pino", confirmada: "bg-sky-100 text-sky-900",
  en_atencion: "bg-amber-100 text-amber-900", atendida: "bg-emerald-100 text-emerald-900",
  cancelada: "bg-rose-100 text-rose-800", no_asistio: "bg-tinta/10 text-tinta/70",
};

function fechaActual() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function modificable(cita: CitaPortal) {
  if (cita.estado !== "programada" && cita.estado !== "confirmada") return false;
  const ahora = new Date();
  const hora = String(ahora.getHours()).padStart(2, "0") + ":" + String(ahora.getMinutes()).padStart(2, "0");
  const hoy = fechaActual();
  return cita.fecha > hoy || (cita.fecha === hoy && cita.hora_inicio > hora);
}

function MisCitas() {
  const { usuario } = useSesion();
  const [pagina, setPagina] = useState(1);
  const [modal, setModal] = useState<null | "nueva" | CitaPortal>(null);
  const [citaCancelar, setCitaCancelar] = useState<CitaPortal | null>(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [cancelando, setCancelando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const medicos = useConsulta("medicos-portal-paciente", listarMedicosPortal);
  const citas = useConsulta("mis-citas-pagina-" + pagina, () => listarMisCitas(pagina));

  async function confirmarCancelacion() {
    if (!citaCancelar) return;
    const motivo = motivoCancelacion.trim();
    if (motivo.length < 3) { setError("Escribe un motivo de al menos 3 caracteres."); return; }
    setError(""); setMensaje(""); setCancelando(true);
    try {
      await cancelarMiCita(citaCancelar.id, motivo);
      setMensaje("La cita se canceló. El horario volvió a quedar disponible.");
      setCitaCancelar(null); setMotivoCancelacion("");
      citas.recargar();
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo cancelar la cita."); }
    finally { setCancelando(false); }
  }

  return <section className="mx-auto w-full max-w-[88rem] space-y-6">
    <header className="relative isolate flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#06483b] via-[#075642] to-[#08735d] px-6 py-7 text-white shadow-[0_10px_28px_rgba(7,83,68,0.16)] sm:px-8 sm:py-8">
      <div aria-hidden="true" className="absolute -right-8 -top-28 -z-10 size-80 opacity-[0.13]" style={{ background: "url('/clinica-nova-salud-logo-transparente.png') center / contain no-repeat", filter: "grayscale(1) brightness(0) invert(1)" }} />
      <div><p className="text-xs font-bold tracking-[0.18em] text-emerald-100/85 uppercase">Portal del paciente</p><h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">Hola, {usuario.nombre}</h1><p className="mt-2 text-base text-white/80 sm:text-lg">Consulta tus citas y reserva un espacio con nuestros profesionales.</p></div>
      <button type="button" className="inline-flex min-h-14 shrink-0 items-center gap-3 whitespace-nowrap rounded-xl bg-white px-5 py-3 text-base font-bold text-[#12372a] shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#075642] focus-visible:outline-none" onClick={() => setModal("nueva")}><span className="inline-grid size-7 place-items-center rounded-full bg-emerald-100 text-emerald-800"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="size-4"><path d="M12 5v14M5 12h14" /></svg></span><span>Solicitar cita</span></button>
    </header>
    {mensaje && <Aviso tono="exito">{mensaje}</Aviso>}
    {error && <Aviso>{error}</Aviso>}
    {citas.error && <Aviso>{citas.error}</Aviso>}
    {medicos.error && <Aviso>{medicos.error}</Aviso>}
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-4"><span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-emerald-100/80 text-emerald-800"><Icono nombre="citas" className="size-8" /></span><div><h2 className="font-display text-3xl font-bold tracking-tight text-slate-900">Mis citas</h2><p className="mt-1 text-base text-slate-500">Solo tú puedes consultar o gestionar estas citas.</p></div></div>{citas.datos && <span className="rounded-full border border-emerald-100 bg-emerald-50/90 px-4 py-2 text-sm font-semibold text-slate-700">{citas.datos.paginacion.total} en total</span>}</div>
    <div className="overflow-hidden rounded-2xl border border-white/90 bg-white/90 shadow-[0_8px_28px_rgba(18,55,42,0.075)] ring-1 ring-emerald-900/[0.035] backdrop-blur-sm" aria-busy={citas.cargando}>
      {citas.cargando ? <p className="p-8 text-center text-tinta/60">Cargando tus citas…</p> : citas.datos?.datos.length === 0 ? <div className="flex min-h-[18rem] flex-col items-center justify-center px-5 py-12 text-center"><span className="mb-5 grid size-24 place-items-center rounded-full bg-emerald-100/70 text-emerald-700"><Icono nombre="citas" className="size-11" /></span><p className="font-display text-xl font-bold text-pino">Todavía no tienes citas</p><p className="mt-1.5 text-base text-tinta/60">Solicita una para ver los horarios disponibles.</p><Boton className="mt-5 rounded-xl" onClick={() => setModal("nueva")}>Buscar horario</Boton></div> : <div className="divide-y divide-slate-200/80">{citas.datos?.datos.map(cita => <article key={cita.id} className="flex flex-col gap-4 p-5 transition-colors hover:bg-[#fbfdfc] sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-start gap-4"><span className={`grid size-[4.25rem] shrink-0 place-items-center rounded-full ${cita.estado === "cancelada" ? "bg-rose-100 text-rose-600" : cita.estado === "atendida" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-7"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>{cita.estado === "cancelada" ? <path d="m9 13 6 6m0-6-6 6"/> : <path d="M8 14h.01M12 14h.01M16 14h.01"/>}</svg></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-xl font-bold text-slate-900">{new Intl.DateTimeFormat("es-GT", { dateStyle: "long", timeZone: "UTC" }).format(new Date(cita.fecha + "T12:00:00Z"))} · {cita.hora_inicio}</h3><span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${colorEstado[cita.estado]}`}><span className={`size-2 rounded-full ${cita.estado === "cancelada" ? "bg-rose-600" : cita.estado === "atendida" ? "bg-emerald-600" : cita.estado === "no_asistio" ? "bg-tinta/50" : "bg-sky-600"}`} />{nombresEstado[cita.estado]}</span></div><p className="mt-1.5 text-base text-slate-500">Dr. {cita.medico_nombre} {cita.medico_apellido} · {cita.especialidad}</p>{cita.motivo && <p className="mt-2 text-base text-slate-500">Motivo: {cita.motivo}</p>}{cita.motivo_cancelacion && <p className="mt-1 text-base text-slate-500">Motivo de cancelación: {cita.motivo_cancelacion}</p>}</div></div>
        {modificable(cita) && <div className="flex gap-2 sm:pt-1"><Boton variante="texto" className="rounded-lg px-3 py-2 text-base" onClick={() => setModal(cita)}>Reprogramar</Boton><Boton variante="texto" className="rounded-lg px-3 py-2 text-base" onClick={() => { setCitaCancelar(cita); setMotivoCancelacion(""); setError(""); }}>Cancelar</Boton></div>}
      </article>)}</div>}
    </div>
    {citas.datos && <Paginacion paginacion={citas.datos.paginacion} alCambiar={setPagina} />}
    {modal && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={e => e.target === e.currentTarget && setModal(null)}><div role="dialog" aria-modal="true" aria-label={modal === "nueva" ? "Solicitar cita" : "Reprogramar cita"} className="relative isolate my-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/90 bg-gradient-to-br from-white via-white to-[#effaf6] p-5 shadow-[0_24px_70px_rgba(7,48,39,0.25)] sm:p-8"><div aria-hidden="true" className="pointer-events-none absolute -right-4 -top-12 size-56 opacity-[0.09]" style={{ background: "url('/clinica-nova-salud-logo-transparente.png') center / contain no-repeat", filter: "grayscale(1)" }} /><FormularioPortalCita cita={modal === "nueva" ? null : modal} medicos={medicos.datos?.medicos ?? []} alCancelar={() => setModal(null)} alGuardar={() => { setModal(null); setMensaje("Tu cita quedó registrada."); citas.recargar(); }} /></div></div>}
    {citaCancelar && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-tinta/55 p-4" role="presentation" onMouseDown={e => e.target === e.currentTarget && !cancelando && setCitaCancelar(null)}><section role="dialog" aria-modal="true" aria-labelledby="cancelar-cita-titulo" className="my-8 w-full max-w-lg rounded-2xl bg-papel p-6 shadow-xl"><p className="text-xs font-semibold tracking-[0.15em] text-hoja uppercase">Gestión de cita</p><h2 id="cancelar-cita-titulo" className="mt-1 font-display text-2xl font-bold text-pino">Cancelar cita</h2><p className="mt-2 text-sm text-tinta/65">Cuéntanos por qué necesitas cancelar. El horario quedará disponible para otra persona.</p>{error && <div className="mt-4"><Aviso>{error}</Aviso></div>}<label htmlFor="motivo-cancelacion" className="mt-5 block text-sm font-semibold text-tinta">Motivo</label><textarea id="motivo-cancelacion" rows={4} maxLength={500} required value={motivoCancelacion} onChange={e => setMotivoCancelacion(e.target.value)} placeholder="Escribe al menos 3 caracteres" className="mt-1.5 w-full resize-y rounded-md border border-tinta/20 bg-white px-3.5 py-2.5 outline-none focus-visible:border-hoja focus-visible:ring-2 focus-visible:ring-hoja/30" /><p className="mt-1 text-right text-xs text-tinta/55">{motivoCancelacion.length}/500</p><div className="mt-5 flex justify-end gap-3"><Boton variante="secundario" disabled={cancelando} onClick={() => { setCitaCancelar(null); setError(""); }}>Volver</Boton><Boton disabled={cancelando || motivoCancelacion.trim().length < 3} onClick={() => void confirmarCancelacion()}>{cancelando ? "Cancelando…" : "Confirmar cancelación"}</Boton></div></section></div>}
  </section>;
}

export default function MisCitasPage() { return <SoloRoles roles={["paciente"]}><MisCitas /></SoloRoles>; }
