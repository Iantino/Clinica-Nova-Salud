"use client";

import { useState } from "react";
import Link from "next/link";
import { useSesion } from "@/lib/sesion";
import { menuPara, NOMBRE_ROL } from "@/lib/navegacion";
import { obtenerResumen } from "@/lib/reportes";
import { useConsulta } from "@/lib/useConsulta";
import { listarMisCitas, type CitaPortal } from "@/lib/portal";
import { cambiarEstadoCita, listarCitas, type Cita, type EstadoCita } from "@/lib/citas";
import { listarMedicos } from "@/lib/medicos";
import Aviso from "@/components/ui/Aviso";
import Icono, { type NombreIcono } from "@/components/Icono";

const DESCRIPCION: Record<string, string> = {
  "/pacientes": "Registra pacientes y búscalos por nombre, DPI o teléfono.",
  "/citas": "Consulta la agenda, programa citas y registra la atención.",
  "/medicos": "Administra médicos, especialidades y horarios de atención.",
  "/usuarios": "Crea cuentas para el personal y controla quién puede entrar.",
  "/reportes": "Revisa indicadores, consulta la bitácora y descarga reportes de citas.",
};

function fechaHoy() {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
}

const ETIQUETA_ESTADO_CITA: Record<Cita["estado"], string> = {
  programada: "Programada",
  confirmada: "Confirmada",
  en_atencion: "En atención",
  atendida: "Atendida",
  cancelada: "Cancelada",
  no_asistio: "No asistió",
};

function ResumenAdministrador() {
  const fecha = fechaHoy();
  const { datos, error, cargando } = useConsulta(`panel-${fecha}`, () => obtenerResumen(fecha));
  const resumen = datos?.resumen;
  const metricas: { titulo: string; valor: number | undefined; icono: NombreIcono; color: string }[] = [
    { titulo: "Citas de hoy", valor: resumen?.total, icono: "citas", color: "emerald" },
    { titulo: "Atendidas", valor: resumen?.atendidas, icono: "pacientes", color: "blue" },
    { titulo: "Canceladas", valor: resumen?.canceladas, icono: "cancelar", color: "rose" },
    { titulo: "No asistieron", valor: resumen?.inasistencias, icono: "usuarios", color: "amber" },
  ];

  const tonos: Record<string, string> = {
    emerald: "border-emerald-200/80 bg-gradient-to-br from-white via-white to-emerald-50/80 text-emerald-700",
    blue: "border-sky-200/80 bg-gradient-to-br from-white via-white to-sky-50/90 text-sky-700",
    rose: "border-rose-200/80 bg-gradient-to-br from-white via-white to-rose-50/90 text-rose-700",
    amber: "border-amber-200/80 bg-gradient-to-br from-white via-white to-amber-50/90 text-amber-700",
  };

  return <section aria-label="Resumen diario" className="mt-8">
    <div className="mb-4">
      <p className="text-xs font-bold tracking-[0.17em] text-hoja uppercase">{fecha}</p>
      <h2 className="mt-1 font-display text-2xl font-bold text-pino">Indicadores de hoy</h2>
    </div>
    {error && <div className="mb-3"><Aviso>{error}</Aviso></div>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metricas.map(({ titulo, valor, icono, color }) => (
        <article key={titulo} className={`group relative flex min-h-28 items-center gap-4 overflow-hidden rounded-2xl border p-4 shadow-[0_5px_16px_rgba(19,55,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(19,55,42,0.11)] ${tonos[color]}`}>
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-current/10">
            <Icono nombre={icono} className="size-7" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-tinta/65">{titulo}</p>
            <p className="mt-0.5 font-display text-3xl font-bold text-pino">{cargando ? "—" : valor ?? 0}</p>
          </div>
          <span aria-hidden="true" className="pointer-events-none absolute -right-5 -bottom-12 size-28 rounded-full border-[14px] border-current opacity-[0.045] transition-transform duration-300 group-hover:scale-125" />
        </article>
      ))}
    </div>
  </section>;
}

function fechaLegible(fecha: string) {
  return new Intl.DateTimeFormat("es-GT", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${fecha}T12:00:00Z`));
}

function horaActual() {
  const ahora = new Date();
  return `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
}

function citaEsFutura(cita: CitaPortal) {
  if (cita.estado !== "programada" && cita.estado !== "confirmada") return false;
  const hoy = fechaHoy();
  return cita.fecha > hoy || (cita.fecha === hoy && cita.hora_inicio > horaActual());
}

function PanelPaciente({ nombre }: { nombre: string }) {
  const citas = useConsulta("panel-citas-paciente", () => listarMisCitas(1));
  const proxima = citas.datos?.datos
    .filter(citaEsFutura)
    .sort((a, b) => `${a.fecha} ${a.hora_inicio}`.localeCompare(`${b.fecha} ${b.hora_inicio}`))[0];

  return <div className="space-y-6">
    <header className="relative isolate flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#06483b] via-[#075642] to-[#08735d] px-6 py-7 text-white shadow-[0_10px_28px_rgba(7,83,68,0.16)] sm:px-8 sm:py-8">
      <div aria-hidden="true" className="absolute -right-8 -top-28 -z-10 size-80 opacity-[0.13]" style={{ background: "url('/clinica-nova-salud-logo-transparente.png') center / contain no-repeat", filter: "grayscale(1) brightness(0) invert(1)" }} />
      <div><p className="text-xs font-bold tracking-[0.18em] text-emerald-100/85 uppercase">Portal del paciente</p><h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">Hola, {nombre}</h1><p className="mt-2 text-base text-white/80 sm:text-lg">Consulta tus citas y reserva un espacio con nuestros profesionales.</p></div>
      <Link href="/mis-citas" className="inline-flex min-h-14 shrink-0 items-center gap-3 whitespace-nowrap rounded-xl bg-white px-5 py-3 text-base font-bold text-[#12372a] shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#075642] focus-visible:outline-none"><span className="inline-grid size-7 place-items-center rounded-full bg-emerald-100 text-emerald-800"><Icono nombre="citas" className="size-4" /></span>Ver mis citas</Link>
    </header>

    {citas.error && <Aviso>{citas.error}</Aviso>}

    <section aria-label="Resumen de tus citas" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article className="flex min-h-28 items-center gap-4 rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-[0_5px_18px_rgba(18,55,42,0.06)]">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Icono nombre="citas" className="size-7" /></span>
        <div><p className="text-sm font-medium text-tinta/65">Citas registradas</p><p className="mt-0.5 font-display text-3xl font-bold text-pino">{citas.cargando ? "—" : citas.datos?.paginacion.total ?? 0}</p></div>
      </article>
      <article className="flex min-h-28 items-center gap-4 rounded-2xl border border-sky-100 bg-white/90 p-5 shadow-[0_5px_18px_rgba(18,55,42,0.06)]">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700"><Icono nombre="citas" className="size-7" /></span>
        <div className="min-w-0"><p className="text-sm font-medium text-tinta/65">Próxima visita</p><p className="mt-0.5 truncate font-display text-xl font-bold text-pino">{citas.cargando ? "Buscando…" : proxima ? fechaLegible(proxima.fecha) : "Sin cita próxima"}</p></div>
      </article>
      <article className="flex min-h-28 items-center gap-4 rounded-2xl border border-violet-100 bg-white/90 p-5 shadow-[0_5px_18px_rgba(18,55,42,0.06)] sm:col-span-2 xl:col-span-1">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-700"><Icono nombre="medicos" className="size-7" /></span>
        <div className="min-w-0"><p className="text-sm font-medium text-tinta/65">Profesional</p><p className="mt-0.5 truncate font-display text-xl font-bold text-pino">{citas.cargando ? "Buscando…" : proxima ? `Dr. ${proxima.medico_nombre} ${proxima.medico_apellido}` : "Elige tu próxima visita"}</p></div>
      </article>
    </section>

    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(17rem,0.85fr)]">
      <article className="relative isolate flex min-h-[17rem] flex-col justify-center overflow-hidden rounded-2xl border border-white/90 bg-white/90 p-6 shadow-[0_8px_28px_rgba(18,55,42,0.075)] ring-1 ring-emerald-900/[0.035] sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-10 -z-10 size-56 rounded-full border-[24px] border-emerald-100/50" />
        {proxima ? <>
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-[0.16em] text-hoja uppercase">Tu próxima cita</p><h2 className="mt-2 font-display text-2xl font-bold text-pino sm:text-3xl">{fechaLegible(proxima.fecha)}</h2></div><span className="rounded-full bg-emerald-100 px-3.5 py-1.5 text-sm font-semibold text-emerald-800">{proxima.estado === "confirmada" ? "Confirmada" : "Programada"}</span></div>
          <div className="mt-6 flex items-center gap-4"><span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Icono nombre="medicos" className="size-7" /></span><div><p className="font-semibold text-slate-900">Dr. {proxima.medico_nombre} {proxima.medico_apellido}</p><p className="mt-0.5 text-sm text-slate-500">{proxima.especialidad} · {proxima.hora_inicio}</p></div></div>
          {proxima.motivo && <p className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600"><span className="font-semibold text-slate-700">Motivo:</span> {proxima.motivo}</p>}
        </> : <div className="flex flex-col items-start"><span className="mb-4 grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Icono nombre="citas" className="size-7" /></span><p className="text-xs font-bold tracking-[0.16em] text-hoja uppercase">Agenda</p><h2 className="mt-2 font-display text-2xl font-bold text-pino">{citas.cargando ? "Cargando tus citas" : "Todavía no tienes una cita próxima"}</h2><p className="mt-2 max-w-xl text-base text-tinta/65">{citas.cargando ? "En un momento verás aquí la información de tu próxima visita." : "Cuando reserves una consulta, aquí encontrarás la fecha y los datos de tu profesional."}</p></div>}
      </article>

      <aside className="flex min-h-[17rem] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#e7faf3] via-white to-[#eaf5ff] p-6 shadow-[0_8px_26px_rgba(18,55,42,0.06)] sm:p-7">
        <div><span className="grid size-12 place-items-center rounded-2xl bg-white text-hoja shadow-sm"><Icono nombre="pacientes" className="size-6" /></span><h2 className="mt-5 font-display text-xl font-bold text-pino">Tu salud, a tu ritmo</h2><p className="mt-2 text-sm leading-6 text-tinta/65">Revisa tus próximas consultas, actualiza una cita o encuentra un horario disponible desde tu portal.</p></div>
        <Link href="/mis-citas" className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-xl bg-[#075642] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#06483b] focus-visible:ring-2 focus-visible:ring-hoja/50 focus-visible:ring-offset-2 focus-visible:outline-none">Gestionar mis citas <span aria-hidden="true">→</span></Link>
      </aside>
    </section>
  </div>;
}

function PanelRecepcion({ nombre }: { nombre: string }) {
  const fecha = fechaHoy();
  const agenda = useConsulta(`panel-recepcion-${fecha}`, () => listarCitas({ desde: fecha, hasta: fecha, pagina: 1 }));
  const citasHoy = [...(agenda.datos?.datos ?? [])].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  const hora = `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`;
  const proxima = citasHoy.find((cita) =>
    (cita.estado === "programada" || cita.estado === "confirmada") && cita.hora_inicio >= hora,
  );

  return <div className="space-y-6">
    <header className="relative isolate flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#06483b] via-[#075642] to-[#08735d] px-6 py-7 text-white shadow-[0_10px_28px_rgba(7,83,68,0.16)] sm:px-8 sm:py-8">
      <div aria-hidden="true" className="absolute -right-8 -top-28 -z-10 size-80 opacity-[0.13]" style={{ background: "url('/clinica-nova-salud-logo-transparente.png') center / contain no-repeat", filter: "grayscale(1) brightness(0) invert(1)" }} />
      <div><p className="text-xs font-bold tracking-[0.18em] text-emerald-100/85 uppercase">Recepción · {fechaLegible(fecha)}</p><h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">Hola, {nombre}</h1><p className="mt-2 text-base text-white/80 sm:text-lg">Tu agenda y las tareas de recepción, en un solo lugar.</p></div>
      <Link href="/citas" className="inline-flex min-h-14 shrink-0 items-center gap-3 whitespace-nowrap rounded-xl bg-white px-5 py-3 text-base font-bold text-[#12372a] shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#075642] focus-visible:outline-none"><span className="inline-grid size-7 place-items-center rounded-full bg-emerald-100 text-emerald-800"><Icono nombre="citas" className="size-4" /></span>Abrir agenda</Link>
    </header>

    {agenda.error && <Aviso>{agenda.error}</Aviso>}

    <section aria-label="Resumen de recepción" className="grid gap-4 sm:grid-cols-2">
      <article className="flex min-h-28 items-center gap-4 rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-[0_5px_18px_rgba(18,55,42,0.06)]">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Icono nombre="citas" className="size-7" /></span>
        <div><p className="text-sm font-medium text-tinta/65">Citas en agenda hoy</p><p className="mt-0.5 font-display text-3xl font-bold text-pino">{agenda.cargando ? "—" : agenda.datos?.paginacion.total ?? 0}</p></div>
      </article>
      <article className="flex min-h-28 items-center gap-4 rounded-2xl border border-sky-100 bg-white/90 p-5 shadow-[0_5px_18px_rgba(18,55,42,0.06)]">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700"><Icono nombre="pacientes" className="size-7" /></span>
        <div className="min-w-0"><p className="text-sm font-medium text-tinta/65">Siguiente atención</p><p className="mt-0.5 truncate font-display text-xl font-bold text-pino">{agenda.cargando ? "Buscando…" : proxima ? `${proxima.hora_inicio} · ${proxima.paciente_nombre} ${proxima.paciente_apellido}` : "No hay más citas pendientes"}</p>{proxima && <p className="mt-0.5 truncate text-sm text-tinta/60">Dr. {proxima.medico_nombre} {proxima.medico_apellido}</p>}</div>
      </article>
    </section>

    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(17rem,0.85fr)]">
      <article className="overflow-hidden rounded-2xl border border-white/90 bg-white/90 shadow-[0_8px_28px_rgba(18,55,42,0.075)] ring-1 ring-emerald-900/[0.035]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-4 sm:px-6"><div><h2 className="font-display text-xl font-bold text-pino">Agenda de hoy</h2><p className="mt-0.5 text-sm text-tinta/60">Próximas consultas y pacientes programados</p></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800">{agenda.datos?.paginacion.total ?? 0} citas</span></div>
        {agenda.cargando ? <p role="status" className="p-8 text-center text-tinta/60">Cargando agenda…</p> : citasHoy.length === 0 ? <div className="flex min-h-56 flex-col items-center justify-center px-5 py-10 text-center"><span className="mb-4 grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Icono nombre="citas" className="size-8" /></span><h3 className="font-display text-lg font-bold text-pino">La agenda está despejada</h3><p className="mt-1 text-sm text-tinta/60">Cuando se programen citas para hoy, aparecerán aquí.</p></div> : <div className="divide-y divide-slate-200/80">{citasHoy.slice(0, 4).map((cita: Cita) => <article key={cita.id} className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4 sm:px-6"><div className="w-16 shrink-0"><p className="font-display text-lg font-bold text-hoja">{cita.hora_inicio}</p><p className="text-xs text-tinta/50">{cita.hora_fin}</p></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-pino">{cita.paciente_nombre} {cita.paciente_apellido}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cita.estado === "confirmada" ? "bg-sky-100 text-sky-900" : cita.estado === "en_atencion" ? "bg-amber-100 text-amber-900" : cita.estado === "atendida" ? "bg-emerald-100 text-emerald-900" : cita.estado === "cancelada" ? "bg-rose-100 text-rose-800" : "bg-menta text-pino"}`}>{ETIQUETA_ESTADO_CITA[cita.estado]}</span></div><p className="mt-1 text-sm text-tinta/65">Dr. {cita.medico_nombre} {cita.medico_apellido} · {cita.especialidad}</p>{cita.motivo && <p className="mt-1 truncate text-sm text-tinta/55">Motivo: {cita.motivo}</p>}</div></article>)}</div>}
        <div className="border-t border-slate-200/80 px-5 py-3.5 text-right sm:px-6"><Link href="/citas" className="text-sm font-semibold text-hoja hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-hoja">Ver agenda completa →</Link></div>
      </article>

      <aside className="flex flex-col gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#e7faf3] via-white to-[#eaf5ff] p-6 shadow-[0_8px_26px_rgba(18,55,42,0.06)]"><span className="grid size-12 place-items-center rounded-2xl bg-white text-hoja shadow-sm"><Icono nombre="pacientes" className="size-6" /></span><h2 className="mt-5 font-display text-xl font-bold text-pino">Atención a pacientes</h2><p className="mt-2 text-sm leading-6 text-tinta/65">Registra pacientes nuevos o encuentra rápidamente su información.</p><Link href="/pacientes" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#075642] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#06483b] focus-visible:ring-2 focus-visible:ring-hoja/50 focus-visible:ring-offset-2 focus-visible:outline-none">Abrir pacientes <span aria-hidden="true">→</span></Link></div>
        <div className="rounded-2xl border border-emerald-100 bg-white/85 p-5 shadow-[0_5px_18px_rgba(18,55,42,0.05)]"><p className="text-xs font-bold tracking-[0.14em] text-hoja uppercase">Atajo</p><h2 className="mt-1 font-display text-lg font-bold text-pino">¿Necesitas programar una visita?</h2><p className="mt-1 text-sm text-tinta/60">Consulta horarios y crea una cita desde la agenda.</p><Link href="/citas" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-hoja hover:underline">Ir a citas <span aria-hidden="true">→</span></Link></div>
      </aside>
    </section>
  </div>;
}

function PanelMedico({ nombre }: { nombre: string }) {
  const fecha = fechaHoy();
  const perfil = useConsulta("panel-perfil-medico", listarMedicos);
  const medico = perfil.datos?.medicos[0];
  const agenda = useConsulta(`panel-agenda-medico-${fecha}-${medico?.id ?? "cargando"}`, () =>
    medico
      ? listarCitas({ desde: fecha, hasta: fecha, medico_id: medico.id, pagina: 1 })
      : Promise.resolve({ datos: [], paginacion: { pagina: 1, porPagina: 20, total: 0, totalPaginas: 1 } }),
  );
  const [ocupado, setOcupado] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const citasHoy = [...(agenda.datos?.datos ?? [])].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  const ahora = new Date();
  const hora = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
  const proxima = citasHoy.find((cita) =>
    cita.estado === "programada" || cita.estado === "confirmada",
  );

  async function iniciarAtencion(cita: Cita) {
    setOcupado(cita.id); setMensaje(""); setErrorAccion("");
    try {
      await cambiarEstadoCita(cita.id, "en_atencion");
      setMensaje("La consulta está lista para registrarse.");
      agenda.recargar();
    } catch (e) {
      setErrorAccion(e instanceof Error ? e.message : "No se pudo iniciar la atención.");
    } finally {
      setOcupado(null);
    }
  }

  const tonoEstado: Record<EstadoCita, string> = {
    programada: "bg-menta text-pino",
    confirmada: "bg-sky-100 text-sky-900",
    en_atencion: "bg-amber-100 text-amber-900",
    atendida: "bg-emerald-100 text-emerald-900",
    cancelada: "bg-rose-100 text-rose-800",
    no_asistio: "bg-tinta/10 text-tinta/70",
  };

  return <div className="space-y-6">
    <header className="relative isolate flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#06483b] via-[#075642] to-[#08735d] px-6 py-7 text-white shadow-[0_10px_28px_rgba(7,83,68,0.16)] sm:px-8 sm:py-8">
      <div aria-hidden="true" className="absolute -right-8 -top-28 -z-10 size-80 opacity-[0.13]" style={{ background: "url('/clinica-nova-salud-logo-transparente.png') center / contain no-repeat", filter: "grayscale(1) brightness(0) invert(1)" }} />
      <div><p className="text-xs font-bold tracking-[0.18em] text-emerald-100/85 uppercase">Atención médica · {fechaLegible(fecha)}</p><h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">Hola, Dr. {nombre}</h1><p className="mt-2 text-base text-white/80 sm:text-lg">Revisa tu agenda y continúa con la atención de tus pacientes.</p></div>
      <Link href="/citas" className="inline-flex min-h-14 shrink-0 items-center gap-3 whitespace-nowrap rounded-xl bg-white px-5 py-3 text-base font-bold text-[#12372a] shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#075642] focus-visible:outline-none"><span className="inline-grid size-7 place-items-center rounded-full bg-emerald-100 text-emerald-800"><Icono nombre="citas" className="size-4" /></span>Ver agenda completa</Link>
    </header>

    {perfil.error && <Aviso>{perfil.error}</Aviso>}
    {perfil.datos && !medico && <Aviso>No encontramos un perfil médico vinculado a esta cuenta. Pide a administración que revise la configuración.</Aviso>}
    {agenda.error && <Aviso>{agenda.error}</Aviso>}
    {mensaje && <Aviso tono="exito">{mensaje}</Aviso>}
    {errorAccion && <Aviso>{errorAccion}</Aviso>}

    <section aria-label="Resumen de agenda médica" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article className="flex min-h-28 items-center gap-4 rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-[0_5px_18px_rgba(18,55,42,0.06)]"><span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Icono nombre="citas" className="size-7" /></span><div><p className="text-sm font-medium text-tinta/65">Citas de hoy</p><p className="mt-0.5 font-display text-3xl font-bold text-pino">{agenda.cargando || perfil.cargando ? "—" : agenda.datos?.paginacion.total ?? 0}</p></div></article>
      <article className="flex min-h-28 items-center gap-4 rounded-2xl border border-sky-100 bg-white/90 p-5 shadow-[0_5px_18px_rgba(18,55,42,0.06)]"><span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700"><Icono nombre="pacientes" className="size-7" /></span><div className="min-w-0"><p className="text-sm font-medium text-tinta/65">Siguiente paciente</p><p className="mt-0.5 truncate font-display text-xl font-bold text-pino">{agenda.cargando ? "Buscando…" : proxima ? `${proxima.hora_inicio} · ${proxima.paciente_nombre} ${proxima.paciente_apellido}` : "Sin pacientes pendientes"}</p></div></article>
      <article className="flex min-h-28 items-center gap-4 rounded-2xl border border-violet-100 bg-white/90 p-5 shadow-[0_5px_18px_rgba(18,55,42,0.06)] sm:col-span-2 xl:col-span-1"><span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-700"><Icono nombre="medicos" className="size-7" /></span><div className="min-w-0"><p className="text-sm font-medium text-tinta/65">Especialidad</p><p className="mt-0.5 truncate font-display text-xl font-bold text-pino">{perfil.cargando ? "Cargando…" : medico?.especialidad ?? "Perfil no disponible"}</p></div></article>
    </section>

    <section className="overflow-hidden rounded-2xl border border-white/90 bg-white/90 shadow-[0_8px_28px_rgba(18,55,42,0.075)] ring-1 ring-emerald-900/[0.035]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-4 sm:px-6"><div><h2 className="font-display text-xl font-bold text-pino">Agenda de hoy</h2><p className="mt-0.5 text-sm text-tinta/60">Tus consultas y pacientes programados</p></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800">{agenda.datos?.paginacion.total ?? 0} citas</span></div>
      {agenda.cargando || perfil.cargando ? <p role="status" className="p-8 text-center text-tinta/60">Cargando tu agenda…</p> : citasHoy.length === 0 ? <div className="flex min-h-56 flex-col items-center justify-center px-5 py-10 text-center"><span className="mb-4 grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Icono nombre="citas" className="size-8" /></span><h3 className="font-display text-lg font-bold text-pino">No tienes consultas programadas para hoy</h3><p className="mt-1 text-sm text-tinta/60">Cuando se agende una cita contigo, aparecerá aquí.</p></div> : <div className="divide-y divide-slate-200/80">{citasHoy.slice(0, 8).map((cita) => <article key={cita.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:px-6"><div className="w-16 shrink-0"><p className="font-display text-lg font-bold text-hoja">{cita.hora_inicio}</p><p className="text-xs text-tinta/50">{cita.hora_fin}</p></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-pino">{cita.paciente_nombre} {cita.paciente_apellido}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tonoEstado[cita.estado]}`}>{ETIQUETA_ESTADO_CITA[cita.estado]}</span></div><p className="mt-1 text-sm text-tinta/65">{cita.especialidad}</p>{cita.motivo && <p className="mt-1 text-sm text-tinta/55">Motivo: {cita.motivo}</p>}</div><div className="flex shrink-0 items-center sm:ml-auto">{cita.estado === "en_atencion" ? <Link href={`/citas/${cita.id}/consulta`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#075642] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#06483b] focus-visible:ring-2 focus-visible:ring-hoja/50 focus-visible:ring-offset-2 focus-visible:outline-none">Registrar consulta</Link> : cita.estado === "atendida" ? <Link href={`/pacientes/${cita.paciente_id}/historial`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-800/40 px-4 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-hoja/40 focus-visible:outline-none">Ver historial</Link> : (cita.estado === "programada" || cita.estado === "confirmada") && cita.hora_inicio <= hora ? <button type="button" disabled={ocupado === cita.id} onClick={() => void iniciarAtencion(cita)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#075642] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#06483b] focus-visible:ring-2 focus-visible:ring-hoja/50 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60">{ocupado === cita.id ? "Iniciando…" : "Iniciar atención"}</button> : <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">{cita.estado === "programada" || cita.estado === "confirmada" ? `Próxima · ${cita.hora_inicio}` : ETIQUETA_ESTADO_CITA[cita.estado]}</span>}</div></article>)}</div>}
      <div className="border-t border-slate-200/80 px-5 py-3.5 text-right sm:px-6"><Link href="/citas" className="text-sm font-semibold text-hoja hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-hoja">Ver agenda completa →</Link></div>
    </section>
  </div>;
}

const ICONO_MODULO: Record<string, { icono: NombreIcono; tono: string }> = {
  "/pacientes": { icono: "pacientes", tono: "bg-emerald-50 text-emerald-700" },
  "/citas": { icono: "citas", tono: "bg-blue-50 text-blue-700" },
  "/medicos": { icono: "medicos", tono: "bg-violet-50 text-violet-700" },
  "/usuarios": { icono: "usuarios", tono: "bg-amber-50 text-amber-700" },
  "/reportes": { icono: "reportes", tono: "bg-sky-50 text-sky-700" },
  "/mis-citas": { icono: "citas", tono: "bg-blue-50 text-blue-700" },
};

export default function PanelPage() {
  const { usuario } = useSesion();
  const modulos = menuPara(usuario.rol).filter((m) => m.href !== "/panel");

  if (usuario.rol === "paciente") {
    return <div className="mx-auto w-full max-w-[88rem]"><PanelPaciente nombre={usuario.nombre} /></div>;
  }
  if (usuario.rol === "recepcionista") {
    return <div className="mx-auto w-full max-w-[88rem]"><PanelRecepcion nombre={usuario.nombre} /></div>;
  }
  if (usuario.rol === "medico") {
    return <div className="mx-auto w-full max-w-[88rem]"><PanelMedico nombre={usuario.nombre} /></div>;
  }

  return (
    <div className="mx-auto w-full max-w-[88rem]">
      <header className="mb-1">
        <p className="text-sm font-semibold text-hoja">{NOMBRE_ROL[usuario.rol]}</p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-pino sm:text-5xl">Hola, {usuario.nombre}</h1>
        <p className="mt-2 text-base text-tinta/65">¿Qué necesitas hacer hoy?</p>
      </header>

      {usuario.rol === "administrador" && <ResumenAdministrador />}

      <ul className="mt-8 grid gap-3 lg:gap-3.5">
        {modulos.map((modulo) => {
          const visual = ICONO_MODULO[modulo.href] ?? { icono: "inicio" as const, tono: "bg-emerald-50 text-emerald-700" };
          return (
            <li key={modulo.href}>
            <Link
              href={modulo.href}
              className="group flex min-h-[5.75rem] items-center gap-4 rounded-2xl border border-white/80 bg-white/85 px-4 py-4 shadow-[0_5px_20px_rgba(18,55,42,0.055)] ring-1 ring-pino/[0.035] backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-hoja/20 hover:bg-white hover:shadow-[0_13px_30px_rgba(18,55,42,0.1)] focus-visible:ring-2 focus-visible:ring-hoja/40 focus-visible:outline-none sm:px-5"
            >
              <span className={`grid size-14 shrink-0 place-items-center rounded-2xl ${visual.tono}`}>
                <Icono nombre={visual.icono} className="size-7 transition-transform duration-200 group-hover:scale-110" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl font-bold text-pino">
                  {modulo.texto}
                </span>
                <span className="mt-0.5 block text-sm text-tinta/65 sm:text-base">{DESCRIPCION[modulo.href]}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-hoja sm:text-base">
                <span className="hidden sm:inline">Abrir</span>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 transition-transform group-hover:translate-x-1"><path d="m9 18 6-6-6-6" /></svg>
              </span>
            </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
