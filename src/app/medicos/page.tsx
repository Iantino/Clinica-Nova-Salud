"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import SoloRoles from "@/components/SoloRoles";
import Boton from "@/components/ui/Boton";
import Aviso from "@/components/ui/Aviso";
import { estiloControl } from "@/components/ui/Campo";
import Icono from "@/components/Icono";
import { useConsulta } from "@/lib/useConsulta";
import {
  actualizarEspecialidad,
  cambiarEstadoMedico,
  crearEspecialidad,
  listarEspecialidades,
  listarMedicos,
  type Especialidad,
  type Medico,
} from "@/lib/medicos";
import FormularioMedico from "./FormularioMedico";

type Edicion = { medico: Medico | null } | null;

const tonosAvatar = [
  "bg-violet-100 text-violet-800",
  "bg-rose-100 text-rose-800",
  "bg-sky-100 text-sky-800",
  "bg-fuchsia-100 text-fuchsia-800",
  "bg-emerald-100 text-emerald-800",
  "bg-blue-100 text-blue-800",
  "bg-amber-100 text-amber-800",
];

function visualEspecialidad(nombre: string) {
  const normalizado = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (normalizado.includes("dermat")) return { icono: "dermatologia" as const, tono: "bg-emerald-50 text-emerald-700" };
  if (normalizado.includes("pediatr") || normalizado.includes("infant")) return { icono: "pediatria" as const, tono: "bg-amber-50 text-amber-700" };
  if (normalizado.includes("medicina general") || normalizado.includes("medico general")) return { icono: "medicos" as const, tono: "bg-sky-50 text-sky-700" };
  return { icono: "medicos" as const, tono: "bg-violet-50 text-violet-700" };
}

function Medicos() {
  const [edicion, setEdicion] = useState<Edicion>(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [especialidadActiva, setEspecialidadActiva] = useState<Especialidad | null>(null);
  const [nombreEspecialidad, setNombreEspecialidad] = useState("");
  const [descripcionEspecialidad, setDescripcionEspecialidad] = useState("");
  const [guardandoEspecialidad, setGuardandoEspecialidad] = useState(false);
  const dialogo = useRef<HTMLDialogElement>(null);
  const medicos = useConsulta("medicos", listarMedicos);
  const especialidades = useConsulta("especialidades", listarEspecialidades);

  useEffect(() => {
    if (edicion) dialogo.current?.showModal();
    else dialogo.current?.close();
  }, [edicion]);

  async function alternarEstado(medico: Medico) {
    const accion = medico.activo ? "desactivar" : "activar";
    if (!window.confirm(`¿Quieres ${accion} a ${medico.nombre} ${medico.apellido}?`)) return;
    try {
      await cambiarEstadoMedico(medico.id, !medico.activo);
      setMensaje(`${medico.nombre} ${medico.apellido} quedó ${medico.activo ? "inactivo" : "activo"}.`);
      medicos.recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cambiar el estado.");
    }
  }

  async function guardarEspecialidad(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setGuardandoEspecialidad(true);
    setError("");
    try {
      const datos = { nombre: nombreEspecialidad, descripcion: descripcionEspecialidad };
      if (especialidadActiva) await actualizarEspecialidad(especialidadActiva.id, datos);
      else await crearEspecialidad(datos);
      setEspecialidadActiva(null);
      setNombreEspecialidad("");
      setDescripcionEspecialidad("");
      setMensaje(especialidadActiva ? "Se actualizó la especialidad." : "Se agregó la especialidad.");
      especialidades.recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar la especialidad.");
    } finally {
      setGuardandoEspecialidad(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[88rem] space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-hoja uppercase">Administración · Personal clínico</p>
            <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-pino sm:text-5xl">Médicos y horarios</h1>
            <p className="mt-1.5 text-base text-tinta/65">Configura especialidades y disponibilidad semanal.</p>
          </div>
          <Boton className="rounded-xl bg-gradient-to-r from-[#075344] to-[#11765d] px-5 py-3 text-white shadow-[0_9px_22px_rgba(7,83,68,0.2)] hover:-translate-y-0.5 hover:from-[#06493c] hover:to-[#0c684f] hover:shadow-[0_13px_28px_rgba(7,83,68,0.28)]" onClick={() => setEdicion({ medico: null })}>
            <span className="mr-2 inline-grid size-6 place-items-center rounded-full border border-white/70"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="M12 5v14M5 12h14" /></svg></span>Registrar médico
          </Boton>
      </header>

      {(mensaje || error || medicos.error || especialidades.error) && (
        <div className="space-y-3">
          {mensaje && <Aviso tono="exito">{mensaje}</Aviso>}
          {(error || medicos.error || especialidades.error) && <Aviso>{error || medicos.error || especialidades.error}</Aviso>}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-white/90 bg-white/85 p-2.5 shadow-[0_8px_26px_rgba(18,55,42,0.075)] ring-1 ring-pino/[0.035] backdrop-blur-sm sm:p-3.5" aria-busy={medicos.cargando}>
        <div className="flex items-center gap-3 px-2 py-2.5 sm:px-3">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Icono nombre="usuarios" className="size-7" /></span>
          <div>
            <h2 className="font-display text-xl font-bold text-pino">Equipo médico</h2>
            <p className="mt-0.5 text-sm text-tinta/55">Cuenta de acceso, especialidad y días de atención</p>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[#f2f8f5] text-[0.68rem] tracking-[0.08em] text-tinta/60 uppercase">
              <tr>
                <th className="px-5 py-3.5 font-bold sm:px-6">Médico</th>
                <th className="px-4 py-3.5 font-bold">Especialidad</th>
                <th className="px-4 py-3.5 font-bold">Colegiado</th>
                <th className="px-4 py-3.5 font-bold">Atiende</th>
                <th className="px-4 py-3.5 text-center font-bold">Estado</th>
                <th className="px-5 py-3.5 text-center font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tinta/10">
              {medicos.datos?.medicos.map((m) => (
                <tr key={m.id} className="transition-colors hover:bg-[#f7fbf9]">
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <span aria-hidden="true" className={`grid size-11 shrink-0 place-items-center rounded-xl text-sm font-bold ${tonosAvatar[(m.id - 1) % tonosAvatar.length]}`}>{`${m.nombre[0] ?? ""}${m.apellido[0] ?? ""}`.toLocaleUpperCase("es-GT")}</span>
                      <div className="min-w-0"><p className="font-semibold text-pino">{m.nombre} {m.apellido}</p><p className="mt-0.5 text-sm text-tinta/60">{m.correo}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-pino">{m.especialidad}</td>
                  <td className="px-4 py-4 text-sm tabular-nums">{m.colegiado}</td>
                  <td className="px-4 py-4 text-sm text-tinta/75">{[...new Set(m.horarios.map((h) => h.dia_semana))].sort().map((dia) => ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][dia - 1]).join(", ") || "Sin horario"}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${m.activo ? "bg-emerald-50 text-emerald-800" : "bg-tinta/5 text-tinta/60"}`}><span className={`size-1.5 rounded-full ${m.activo ? "bg-emerald-600" : "bg-tinta/40"}`} />{m.activo ? "Activo" : "Inactivo"}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    <div className="flex justify-center gap-2">
                      <Boton aria-label={`Editar a ${m.nombre} ${m.apellido}`} title="Editar médico" variante="texto" className="grid size-10 place-items-center rounded-xl bg-sky-50 p-0 text-sky-700 hover:bg-sky-100" onClick={() => setEdicion({ medico: m })}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="m15 5 4 4M4 20l4.5-1 10.8-10.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z" /></svg></Boton>
                      <Boton aria-label={`${m.activo ? "Desactivar" : "Activar"} a ${m.nombre} ${m.apellido}`} title={m.activo ? "Desactivar médico" : "Activar médico"} variante="texto" className="grid size-10 place-items-center rounded-xl bg-amber-50 p-0 text-amber-700 hover:bg-amber-100" onClick={() => alternarEstado(m)}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">{m.activo ? <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/><path d="m4 4 16 16"/></> : <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/></>}</svg></Boton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!medicos.datos && medicos.cargando && <p className="px-5 py-8 text-center text-tinta/60">Cargando médicos…</p>}
          {medicos.datos?.medicos.length === 0 && <p className="px-5 py-10 text-center text-tinta/60">Todavía no hay médicos registrados.</p>}
        </div>
      </section>

      <section className="grid gap-6 rounded-2xl border border-white/90 bg-white/85 p-4 shadow-[0_8px_26px_rgba(18,55,42,0.075)] ring-1 ring-pino/[0.035] backdrop-blur-sm sm:p-5 lg:grid-cols-[0.85fr_1.15fr] lg:gap-7 lg:p-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-700"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-7"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z"/><path d="M4 5.5v16M8 7h8m-8 4h8"/></svg></span>
            <div>
              <p className="text-[0.68rem] font-bold tracking-[0.15em] text-hoja uppercase">Catálogo</p>
              <h2 className="font-display text-xl font-bold text-pino">Especialidades</h2>
              <p className="mt-0.5 text-sm text-tinta/60">Mantén al día las áreas de atención de la clínica.</p>
            </div>
          </div>
          <form onSubmit={guardarEspecialidad} className="mt-5 space-y-3.5">
            <div>
              <label className="block text-sm font-semibold" htmlFor="especialidad-nombre">Nombre</label>
              <input id="especialidad-nombre" required maxLength={80} value={nombreEspecialidad} onChange={(e) => setNombreEspecialidad(e.target.value)} placeholder="Ej. Dermatología" className={`${estiloControl} mt-1.5 rounded-xl`} />
            </div>
            <div>
              <label className="block text-sm font-semibold" htmlFor="especialidad-descripcion">Descripción (opcional)</label>
              <textarea id="especialidad-descripcion" maxLength={255} value={descripcionEspecialidad} onChange={(e) => setDescripcionEspecialidad(e.target.value)} placeholder="Describe brevemente la especialidad…" className={`${estiloControl} mt-1.5 min-h-24 resize-y rounded-xl`} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Boton type="submit" disabled={guardandoEspecialidad} className="rounded-xl bg-gradient-to-r from-[#075344] to-[#11765d] shadow-[0_7px_18px_rgba(7,83,68,0.18)] hover:from-[#06493c] hover:to-[#0c684f]">{guardandoEspecialidad ? "Guardando…" : especialidadActiva ? "Guardar cambios" : <><span aria-hidden="true" className="mr-2 inline-grid size-5 place-items-center rounded-full border border-white/75">+</span>Agregar especialidad</>}</Boton>
              {especialidadActiva && <Boton variante="secundario" className="rounded-xl" onClick={() => { setEspecialidadActiva(null); setNombreEspecialidad(""); setDescripcionEspecialidad(""); }}>Cancelar edición</Boton>}
            </div>
          </form>
        </div>
        <div className="space-y-2.5">
          {especialidades.datos?.especialidades.map((e) => {
            const visual = visualEspecialidad(e.nombre);
            return (
              <div key={e.id} className="group flex items-center justify-between gap-3 rounded-2xl bg-[#f3f8f5]/90 px-3 py-3 transition-colors hover:bg-[#edf6f1] sm:px-4">
                <span className={`grid size-14 shrink-0 place-items-center rounded-2xl ${visual.tono}`}><Icono nombre={visual.icono} className="size-7" /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold text-pino">{e.nombre}</p>
                  {e.descripcion && <p className="mt-0.5 text-sm text-tinta/60">{e.descripcion}</p>}
                </div>
                <Boton aria-label={`Editar especialidad ${e.nombre}`} variante="texto" className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-50 p-0 text-sky-700 hover:bg-sky-100" onClick={() => { setEspecialidadActiva(e); setNombreEspecialidad(e.nombre); setDescripcionEspecialidad(e.descripcion ?? ""); }}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="m15 5 4 4M4 20l4.5-1 10.8-10.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z" /></svg></Boton>
              </div>
            );
          })}
          {!especialidades.datos && especialidades.cargando && <p className="py-5 text-sm text-tinta/60">Cargando especialidades…</p>}
          {especialidades.datos?.especialidades.length === 0 && <p className="rounded-xl bg-[#f3f8f5] px-4 py-8 text-center text-sm text-tinta/60">Aún no hay especialidades registradas.</p>}
        </div>
      </section>

      <dialog ref={dialogo} onClose={() => setEdicion(null)} aria-label={edicion?.medico ? "Editar médico" : "Registrar médico"} className="m-auto max-h-[90dvh] w-[min(100%-2rem,48rem)] overflow-y-auto rounded-2xl bg-papel p-6 shadow-xl backdrop:bg-tinta/50 sm:p-8">
        {edicion && especialidades.datos && (
          <FormularioMedico
            key={edicion.medico?.id ?? "nuevo"}
            medico={edicion.medico}
            especialidades={especialidades.datos.especialidades}
            alCancelar={() => setEdicion(null)}
            alGuardar={(m) => {
              setEdicion(null);
              setMensaje(`Se guardaron los datos del Dr. ${m.nombre} ${m.apellido}.`);
              medicos.recargar();
            }}
          />
        )}
      </dialog>
    </div>
  );
}

export default function MedicosPage() {
  return <SoloRoles roles={["administrador"]}><Medicos /></SoloRoles>;
}
