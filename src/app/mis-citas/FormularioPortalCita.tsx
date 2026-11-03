"use client";

import { useState, type FormEvent } from "react";
import Aviso from "@/components/ui/Aviso";
import Icono from "@/components/Icono";
import { ApiError } from "@/lib/api";
import { useConsulta } from "@/lib/useConsulta";
import {
  consultarDisponibilidad,
  reprogramarMiCita,
  solicitarCita,
  type CitaPortal,
  type MedicoPortal,
} from "@/lib/portal";

function hoyLocal() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

export default function FormularioPortalCita({
  medicos,
  cita,
  alGuardar,
  alCancelar,
}: {
  medicos: MedicoPortal[];
  cita: CitaPortal | null;
  alGuardar: () => void;
  alCancelar: () => void;
}) {
  const [medicoId, setMedicoId] = useState(cita?.medico_id ?? 0);
  const [fecha, setFecha] = useState(cita?.fecha ?? hoyLocal());
  const [hora, setHora] = useState(cita?.hora_inicio ?? "");
  const [motivo, setMotivo] = useState(cita?.motivo ?? "");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const clave = "disponibilidad-paciente-" + medicoId + "-" + fecha + "-" + (cita?.id ?? "nueva");
  const disponibilidad = useConsulta(clave, () =>
    medicoId && fecha
      ? consultarDisponibilidad(medicoId, fecha)
      : Promise.resolve({ horarios: [] as string[] }),
  );
  const horarios = disponibilidad.datos?.horarios ?? [];
  const mismaAgenda = cita && cita.fecha === fecha && cita.medico_id === medicoId;
  const opciones = mismaAgenda && !horarios.includes(cita.hora_inicio)
    ? [cita.hora_inicio, ...horarios]
    : horarios;

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault(); setError("");
    if (!hora) { setError("Elige uno de los horarios disponibles."); return; }
    setGuardando(true);
    try {
      if (cita) await reprogramarMiCita(cita.id, { medico_id: medicoId, fecha, hora_inicio: hora });
      else await solicitarCita({ medico_id: medicoId, fecha, hora_inicio: hora, motivo });
      alGuardar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "No se pudo guardar la cita.");
      setGuardando(false);
    }
  }

  return <form noValidate onSubmit={guardar} className="relative z-10 space-y-5">
    <div className="flex items-start justify-between gap-4 pr-1">
      <div><p className="text-xs font-bold tracking-[0.16em] text-emerald-700 uppercase">Portal NovaSalud</p><h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900">{cita ? "Reprogramar cita" : "Solicitar cita"}</h2><p className="mt-1.5 text-sm text-slate-500 sm:text-base">{cita ? "Selecciona un nuevo horario para tu cita con el profesional." : "Elige un profesional y un horario disponible."}</p></div>
      <button type="button" aria-label="Cerrar" onClick={alCancelar} className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-100/80 text-emerald-900 transition hover:bg-emerald-200 focus-visible:ring-2 focus-visible:ring-emerald-700/40 focus-visible:outline-none"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
    </div>
    {error && <Aviso>{error}</Aviso>}
    <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
      <div><label htmlFor="portal-medico" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-800"><Icono nombre="medicos" className="size-5 text-emerald-800" />Profesional</label><span className="flex h-12 items-center gap-2 rounded-xl border border-slate-300 bg-white px-1.5 shadow-sm transition focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/15"><span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Icono nombre="medicos" className="size-4.5" /></span><select id="portal-medico" required value={medicoId} onChange={e => { setMedicoId(Number(e.target.value)); setHora(""); }} className="control-icono h-full min-w-0 flex-1 border-0 bg-transparent px-1 text-sm text-slate-800 outline-none"><option value={0}>Elige un profesional</option>{medicos.map(m => <option key={m.id} value={m.id}>{m.nombre} {m.apellido} · {m.especialidad}</option>)}</select></span></div>
      <div><label htmlFor="portal-fecha" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-800"><Icono nombre="citas" className="size-5 text-emerald-800" />Fecha</label><span className="flex h-12 items-center gap-2 rounded-xl border border-slate-300 bg-white px-1.5 shadow-sm transition focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/15"><span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Icono nombre="citas" className="size-4.5" /></span><input id="portal-fecha" type="date" required min={hoyLocal()} value={fecha} onChange={e => { setFecha(e.target.value); setHora(""); }} className="control-icono h-full min-w-0 flex-1 border-0 bg-transparent px-1 text-sm text-slate-800 outline-none" /></span></div>
      <div><label htmlFor="portal-hora" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-800"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-emerald-800"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>Horario disponible</label><span className="flex h-12 items-center gap-2 rounded-xl border border-slate-300 bg-white px-1.5 shadow-sm transition focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/15"><span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><select id="portal-hora" required value={hora} onChange={e => setHora(e.target.value)} className="control-icono h-full min-w-0 flex-1 border-0 bg-transparent px-1 text-sm text-slate-800 outline-none"><option value="">{disponibilidad.cargando ? "Buscando horarios…" : "Elige una hora"}</option>{opciones.map(h => <option key={h} value={h}>{h}</option>)}</select></span>{!disponibilidad.cargando && medicoId && fecha && opciones.length === 0 && <p className="mt-1 text-xs text-slate-500">No hay espacios disponibles ese día.</p>}</div>
      {!cita && <div className="sm:col-span-2"><label htmlFor="portal-motivo" className="mb-1.5 block text-sm font-semibold text-slate-800">Motivo (opcional)</label><textarea id="portal-motivo" maxLength={255} value={motivo} onChange={e => setMotivo(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none focus-visible:border-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-700/15" /></div>}
    </div>
    <p className="text-xs text-slate-500 sm:text-sm">Cada consulta dura 20 minutos. Solo aparecen horarios libres de la clínica.</p>
    <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4"><button type="button" onClick={alCancelar} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-emerald-800/50 bg-white px-5 py-2.5 font-semibold text-emerald-950 transition hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-700/35 focus-visible:outline-none"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5"><path d="m6 6 12 12M18 6 6 18" /></svg>Cerrar</button><button type="submit" disabled={guardando || disponibilidad.cargando || !medicoId} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#075344] to-[#11765d] px-5 py-2.5 font-bold text-white shadow-[0_7px_18px_rgba(7,83,68,0.18)] transition hover:-translate-y-0.5 hover:from-[#06493c] hover:to-[#0c684f] focus-visible:ring-2 focus-visible:ring-emerald-700/40 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"><Icono nombre="citas" className="size-5" />{guardando ? "Guardando…" : cita ? "Reprogramar" : "Solicitar cita"}</button></div>
  </form>;
}
