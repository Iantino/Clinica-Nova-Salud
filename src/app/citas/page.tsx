"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSesion } from "@/lib/sesion";
import { cambiarEstadoCita, cancelarCita, listarCitas, type Cita, type EstadoCita } from "@/lib/citas";
import { listarMedicos } from "@/lib/medicos";
import { useConsulta } from "@/lib/useConsulta";
import SoloRoles from "@/components/SoloRoles";
import Aviso from "@/components/ui/Aviso";
import Boton from "@/components/ui/Boton";
import Paginacion from "@/components/ui/Paginacion";
import Icono from "@/components/Icono";
import FormularioCita from "./FormularioCita";

const nombresEstado: Record<EstadoCita, string> = {
  programada: "Programada", confirmada: "Confirmada", en_atencion: "En atención",
  atendida: "Atendida", cancelada: "Cancelada", no_asistio: "No asistió",
};
const colorEstado: Record<EstadoCita, string> = {
  programada: "bg-menta text-pino", confirmada: "bg-sky-100 text-sky-900",
  en_atencion: "bg-amber-100 text-amber-900", atendida: "bg-emerald-100 text-emerald-900",
  cancelada: "bg-rose-100 text-rose-800", no_asistio: "bg-tinta/10 text-tinta/70",
};

function fechaLocal(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function sumarDias(fecha: string, dias: number) {
  const d = new Date(`${fecha}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return fechaLocal(d);
}
function textoFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-GT", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${fecha}T12:00:00Z`));
}
function terminoLaCita(fecha: string, horaFin: string) {
  const ahora = new Date();
  const hoy = fechaLocal(ahora);
  const horaActual = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
  return fecha < hoy || (fecha === hoy && horaFin <= horaActual);
}
function rangoSemana(fecha: string) {
  const d = new Date(`${fecha}T12:00:00`);
  const desplazamiento = (d.getDay() + 6) % 7;
  const lunes = new Date(d); lunes.setDate(d.getDate() - desplazamiento);
  const viernes = new Date(lunes); viernes.setDate(lunes.getDate() + 4);
  return [fechaLocal(lunes), fechaLocal(viernes)] as const;
}

function Agenda() {
  const { usuario } = useSesion();
  const [fecha, setFecha] = useState(() => fechaLocal(new Date()));
  const [vista, setVista] = useState<"dia" | "semana">("dia");
  const [medicoId, setMedicoId] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [modal, setModal] = useState<null | "nueva" | Cita>(null);
  const [citaCancelar, setCitaCancelar] = useState<Cita | null>(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [errorCancelacion, setErrorCancelacion] = useState("");
  const [cancelando, setCancelando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [ocupado, setOcupado] = useState<number | null>(null);
  const doctores = useConsulta("agenda-medicos", listarMedicos);
  const [desde, hasta] = vista === "dia" ? [fecha, fecha] : rangoSemana(fecha);
  const clave = `${desde}-${hasta}-${medicoId}-${pagina}`;
  const agenda = useConsulta(clave, () => listarCitas({ desde, hasta, medico_id: medicoId || undefined, pagina }));
  const citas = useMemo(() => agenda.datos?.datos ?? [], [agenda.datos]);
  const puedeGestionar = usuario.rol === "administrador" || usuario.rol === "recepcionista";

  async function actualizar(cita: Cita, accion: "confirmar" | "iniciar" | "no_asistio") {
    setErrorAccion(""); setMensaje(""); setOcupado(cita.id);
    try {
      const destino: EstadoCita = accion === "confirmar" ? "confirmada" : accion === "iniciar" ? "en_atencion" : "no_asistio";
      await cambiarEstadoCita(cita.id, destino);
      setMensaje("Se actualizó el estado de la cita.");
      agenda.recargar();
    } catch (e) { setErrorAccion(e instanceof Error ? e.message : "No se pudo actualizar la cita."); }
    finally { setOcupado(null); }
  }

  async function confirmarCancelacion() {
    if (!citaCancelar) return;
    const motivo = motivoCancelacion.trim();
    if (motivo.length < 3) { setErrorCancelacion("Escribe un motivo de al menos 3 caracteres."); return; }
    setErrorCancelacion(""); setErrorAccion(""); setMensaje(""); setCancelando(true);
    try {
      await cancelarCita(citaCancelar.id, motivo);
      setMensaje("La cita se canceló y el horario volvió a quedar disponible.");
      setCitaCancelar(null); setMotivoCancelacion(""); agenda.recargar();
    } catch (e) { setErrorCancelacion(e instanceof Error ? e.message : "No se pudo cancelar la cita."); }
    finally { setCancelando(false); }
  }

  return <section className="mx-auto w-full max-w-[88rem] space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-5">
      <div><p className="text-xs font-bold tracking-[0.16em] text-hoja uppercase">Atención clínica</p><h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-pino sm:text-5xl">Agenda de citas</h1><p className="mt-1.5 text-base text-tinta/65">Organiza las consultas y da seguimiento a cada visita.</p></div>
      {puedeGestionar && <Boton className="rounded-xl bg-gradient-to-r from-[#075344] to-[#11765d] px-5 py-3 shadow-[0_9px_22px_rgba(7,83,68,0.2)] hover:-translate-y-0.5 hover:from-[#06493c] hover:to-[#0c684f] hover:shadow-[0_13px_28px_rgba(7,83,68,0.28)]" onClick={() => setModal("nueva")}><span className="mr-2 inline-grid size-6 align-middle place-items-center rounded-full border border-white/70"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="M12 5v14M5 12h14" /></svg></span>Nueva cita</Boton>}
    </header>
    {mensaje && <Aviso tono="exito">{mensaje}</Aviso>}{errorAccion && <Aviso>{errorAccion}</Aviso>}{agenda.error && <Aviso>{agenda.error}</Aviso>}
    <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-white/90 bg-white/85 p-3.5 shadow-[0_7px_24px_rgba(18,55,42,0.065)] ring-1 ring-pino/[0.035] backdrop-blur-sm sm:gap-3 sm:p-4">
      <div className="flex items-center gap-2">
        <Boton aria-label="Periodo anterior" variante="secundario" className="grid size-11 shrink-0 place-items-center rounded-xl border-emerald-100 bg-emerald-50/80 p-0 text-hoja hover:bg-emerald-100" onClick={() => { setFecha(sumarDias(fecha, vista === "dia" ? -1 : -7)); setPagina(1); }}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="m15 18-6-6 6-6M9 12h12" /></svg></Boton>
        <label className="sr-only" htmlFor="agenda-fecha">Fecha</label><span className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-[#d2e5dd] bg-white px-1.5"><span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Icono nombre="citas" className="size-5" /></span><input id="agenda-fecha" aria-label="Fecha de la agenda" type="date" value={fecha} onChange={(e) => { setFecha(e.target.value); setPagina(1); }} className="h-full min-w-0 flex-1 border-0 bg-transparent px-1 text-sm text-tinta outline-none ring-0 focus:outline-none focus:ring-0" /></span>
        <Boton aria-label="Periodo siguiente" variante="secundario" className="grid size-11 shrink-0 place-items-center rounded-xl border-emerald-100 bg-emerald-50/80 p-0 text-hoja hover:bg-emerald-100" onClick={() => { setFecha(sumarDias(fecha, vista === "dia" ? 1 : 7)); setPagina(1); }}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="m9 18 6-6-6-6M3 12h12" /></svg></Boton>
      </div>
      <span className="hidden h-9 border-l border-tinta/10 sm:block" aria-hidden="true" />
      <Boton variante="texto" className="h-11 rounded-xl bg-emerald-50/80 px-5 text-base text-pino hover:bg-emerald-100" onClick={() => { setFecha(fechaLocal(new Date())); setPagina(1); }}>Hoy</Boton>
      <div className="flex items-center rounded-xl bg-[#f0f5f2] p-1" role="group" aria-label="Vista de agenda">
        <button type="button" aria-pressed={vista === "dia"} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition sm:px-4 ${vista === "dia" ? "bg-emerald-100 font-semibold text-pino shadow-sm ring-1 ring-emerald-200" : "text-tinta/65 hover:text-pino"}`} onClick={() => { setVista("dia"); setPagina(1); }}><Icono nombre="citas" className="size-4.5" />Día</button>
        <button type="button" aria-pressed={vista === "semana"} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition sm:px-4 ${vista === "semana" ? "bg-emerald-100 font-semibold text-pino shadow-sm ring-1 ring-emerald-200" : "text-tinta/65 hover:text-pino"}`} onClick={() => { setVista("semana"); setPagina(1); }}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4.5"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M7 14h2m3 0h2m3 0h2M7 17h2m3 0h2"/></svg>Semana</button>
      </div>
      {usuario.rol !== "medico" && <span className="flex h-11 w-full min-w-0 items-center gap-2 rounded-xl border border-[#d2e5dd] bg-white px-1.5 sm:ml-auto sm:w-auto sm:min-w-52"><span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Icono nombre="medicos" className="size-5" /></span><select aria-label="Filtrar por médico" value={medicoId} onChange={(e) => { setMedicoId(Number(e.target.value)); setPagina(1); }} className="h-full min-w-0 flex-1 border-0 bg-transparent px-1 text-sm text-tinta outline-none ring-0 focus:outline-none focus:ring-0"><option value={0}>Todos los médicos</option>{doctores.datos?.medicos.filter(m => m.activo).map(m => <option key={m.id} value={m.id}>{m.nombre} {m.apellido}</option>)}</select></span>}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-2xl font-bold text-pino capitalize sm:text-3xl">{vista === "dia" ? textoFecha(fecha) : `Semana del ${textoFecha(desde)} al ${textoFecha(hasta)}`}</h2><span className="inline-flex items-center gap-2 rounded-2xl bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-800"><Icono nombre="citas" className="size-5" />{agenda.datos?.paginacion.total ?? 0} citas</span></div>
    <div className="overflow-hidden rounded-2xl border border-white/90 bg-white/85 shadow-[0_8px_26px_rgba(18,55,42,0.065)] ring-1 ring-pino/[0.035] backdrop-blur-sm">
      {agenda.cargando ? <p className="p-8 text-center text-tinta/60">Cargando agenda…</p> : citas.length === 0 ? <div className="flex min-h-[18rem] flex-col items-center justify-center px-5 py-12 text-center">
        <span className="mb-5 grid size-20 place-items-center rounded-full bg-gradient-to-br from-[#e7faf1] to-[#d1f4e6] text-[#07846a] shadow-inner shadow-white">
          <svg aria-hidden="true" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-11"><rect x="7" y="10" width="30" height="29" rx="4"/><path d="M15 6v8m14-8v8M7 19h30m-21 7h8m-8 7h5"/><circle cx="36" cy="35" r="7" fill="#e7faf1"/><path d="m41 40 4 4"/></svg>
        </span>
        <p className="font-display text-xl font-bold text-pino">No hay citas en este periodo</p>
        <p className="mt-1.5 max-w-md text-base text-tinta/60">Prueba con otra fecha o agenda una nueva cita.</p>
      </div> : <div className="divide-y divide-tinta/10">{citas.map(cita => <article key={cita.id} className="grid gap-4 p-4 transition-colors hover:bg-[#f8fbf9] sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-center sm:p-5">
        <div className="font-display text-xl font-bold text-hoja">{cita.hora_inicio}<span className="mt-1 block font-sans text-xs font-normal text-tinta/50">{vista === "semana" ? new Intl.DateTimeFormat("es-GT", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${cita.fecha}T12:00:00Z`)) : "20 min"}</span></div>
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-pino">{cita.paciente_nombre} {cita.paciente_apellido}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colorEstado[cita.estado]}`}>{nombresEstado[cita.estado]}</span></div><p className="mt-1 text-sm text-tinta/65">{cita.medico_nombre} {cita.medico_apellido} · {cita.especialidad}</p>{cita.motivo && <p className="mt-1 text-sm text-tinta/70">Motivo: {cita.motivo}</p>}</div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {puedeGestionar && (cita.estado === "programada" || cita.estado === "confirmada") && <><Boton variante="texto" disabled={ocupado === cita.id} onClick={() => setModal(cita)}>Reprogramar</Boton><Boton variante="texto" disabled={ocupado === cita.id} onClick={() => { setCitaCancelar(cita); setMotivoCancelacion(""); setErrorCancelacion(""); }}>Cancelar</Boton></>}
          {cita.estado === "programada" && usuario.rol !== "medico" && <Boton variante="secundario" disabled={ocupado === cita.id} onClick={() => void actualizar(cita, "confirmar")}>Confirmar</Boton>}
          {(cita.estado === "programada" || cita.estado === "confirmada") && <Boton disabled={ocupado === cita.id} onClick={() => void actualizar(cita, "iniciar")}>Iniciar atención</Boton>}
          {(cita.estado === "programada" || cita.estado === "confirmada") && terminoLaCita(cita.fecha, cita.hora_fin) && <Boton variante="texto" disabled={ocupado === cita.id} onClick={() => void actualizar(cita, "no_asistio")}>No asistió</Boton>}
          {cita.estado === "en_atencion" && <Link href={`/citas/${cita.id}/consulta`} className="rounded-md bg-pino px-4 py-2.5 font-semibold text-white hover:bg-hoja">Registrar consulta</Link>}
          {cita.estado === "atendida" && usuario.rol === "medico" && <Link href={`/pacientes/${cita.paciente_id}/historial`} className="font-semibold text-hoja hover:underline">Ver historial</Link>}
        </div>
      </article>)}</div>}
    </div>
    {agenda.datos && <Paginacion paginacion={agenda.datos.paginacion} alCambiar={setPagina} />}
    {modal && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setModal(null)}><div role="dialog" aria-modal="true" aria-label={modal === "nueva" ? "Nueva cita" : "Reprogramar cita"} className="relative isolate my-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/90 bg-gradient-to-br from-white via-white to-[#effaf6] p-5 shadow-[0_24px_70px_rgba(7,48,39,0.25)] sm:p-8"><div aria-hidden="true" className="pointer-events-none absolute -right-4 -top-12 size-56 opacity-[0.09]" style={{ background: "url('/clinica-nova-salud-logo-transparente.png') center / contain no-repeat", filter: "grayscale(1)" }} /><FormularioCita cita={modal === "nueva" ? null : modal} medicos={doctores.datos?.medicos ?? []} alCancelar={() => setModal(null)} alGuardar={() => { setModal(null); setMensaje("La cita se guardó correctamente."); agenda.recargar(); }} /></div></div>}
    {citaCancelar && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-tinta/55 p-4" role="presentation" onMouseDown={e => e.target === e.currentTarget && !cancelando && setCitaCancelar(null)}><section role="dialog" aria-modal="true" aria-labelledby="cancelar-cita-titulo" className="my-8 w-full max-w-lg rounded-2xl bg-papel p-6 shadow-xl"><p className="text-xs font-semibold tracking-[0.15em] text-hoja uppercase">Agenda de la clínica</p><h2 id="cancelar-cita-titulo" className="mt-1 font-display text-2xl font-bold text-pino">Cancelar cita</h2><p className="mt-2 text-sm text-tinta/65">Indica el motivo para dejar constancia y liberar el horario.</p>{errorCancelacion && <div className="mt-4"><Aviso>{errorCancelacion}</Aviso></div>}<label htmlFor="motivo-cancelacion-personal" className="mt-5 block text-sm font-semibold text-tinta">Motivo de cancelación</label><textarea id="motivo-cancelacion-personal" rows={4} maxLength={255} required value={motivoCancelacion} onChange={e => setMotivoCancelacion(e.target.value)} placeholder="Escribe al menos 3 caracteres" className="mt-1.5 w-full resize-y rounded-md border border-tinta/20 bg-white px-3.5 py-2.5 outline-none focus-visible:border-hoja focus-visible:ring-2 focus-visible:ring-hoja/30" /><p className="mt-1 text-right text-xs text-tinta/55">{motivoCancelacion.length}/255</p><div className="mt-5 flex justify-end gap-3"><Boton variante="secundario" disabled={cancelando} onClick={() => { setCitaCancelar(null); setErrorCancelacion(""); }}>Volver</Boton><Boton disabled={cancelando || motivoCancelacion.trim().length < 3} onClick={() => void confirmarCancelacion()}>{cancelando ? "Cancelando…" : "Confirmar cancelación"}</Boton></div></section></div>}
  </section>;
}

export default function CitasPage() { return <SoloRoles roles={["administrador", "recepcionista", "medico"]}><Agenda /></SoloRoles>; }
