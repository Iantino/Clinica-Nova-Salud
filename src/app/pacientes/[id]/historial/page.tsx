"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import SoloRoles from "@/components/SoloRoles";
import Aviso from "@/components/ui/Aviso";
import { useConsulta } from "@/lib/useConsulta";
import { historialPaciente } from "@/lib/consultas";

function Historial() {
  const { id } = useParams<{ id: string }>();
  const { datos, error, cargando } = useConsulta(`historial-${id}`, () => historialPaciente(Number(id)));
  return <section className="mx-auto max-w-4xl space-y-6">
    <Link href={`/pacientes/${id}`} className="text-sm font-semibold text-hoja hover:underline">← Ficha del paciente</Link>
    <header><p className="text-xs font-semibold tracking-[0.15em] text-hoja uppercase">Expediente confidencial</p><h1 className="mt-1 font-display text-3xl font-bold text-pino">Historial clínico</h1><p className="mt-1 text-tinta/65">Consultas registradas para este paciente, ordenadas de la más reciente.</p></header>
    {error && <Aviso>{error}</Aviso>}
    {cargando ? <p role="status" className="text-tinta/60">Cargando historial…</p> : datos?.consultas.length === 0 ? <div className="rounded-xl border border-tinta/10 bg-white p-10 text-center text-tinta/65">Todavía no hay consultas registradas.</div> : <div className="space-y-4">{datos?.consultas.map(c => <article key={c.id} className="rounded-xl border border-tinta/10 bg-white p-5 shadow-sm sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-pino">{new Intl.DateTimeFormat("es-GT", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${c.fecha}T12:00:00Z`))} · {c.hora_inicio}</p><p className="mt-1 text-sm text-tinta/60">Dr. {c.medico_nombre} {c.medico_apellido} · {c.especialidad}</p></div><Link href={`/consultas/${c.id}/receta`} className="text-sm font-semibold text-hoja hover:underline">Ver receta / consulta</Link></header>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase tracking-wide text-tinta/50">Motivo</dt><dd className="mt-1 text-sm">{c.motivo_consulta}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-tinta/50">Diagnóstico</dt><dd className="mt-1 whitespace-pre-wrap text-sm">{c.diagnostico}</dd></div>{c.tratamiento && <div><dt className="text-xs font-semibold uppercase tracking-wide text-tinta/50">Tratamiento</dt><dd className="mt-1 whitespace-pre-wrap text-sm">{c.tratamiento}</dd></div>}{(c.presion_arterial || c.frecuencia_cardiaca || c.temperatura || c.peso_kg || c.talla_cm) && <div><dt className="text-xs font-semibold uppercase tracking-wide text-tinta/50">Signos vitales</dt><dd className="mt-1 text-sm">{[c.presion_arterial && `Presión ${c.presion_arterial}`, c.frecuencia_cardiaca && `FC ${c.frecuencia_cardiaca} lpm`, c.temperatura && `Temp. ${c.temperatura} °C`, c.peso_kg && `Peso ${c.peso_kg} kg`, c.talla_cm && `Talla ${c.talla_cm} cm`].filter(Boolean).join(" · ")}</dd></div>}{c.notas && <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-tinta/50">Notas</dt><dd className="mt-1 whitespace-pre-wrap text-sm">{c.notas}</dd></div>}</dl>
    </article>)}</div>}
  </section>;
}

export default function HistorialPage() { return <SoloRoles roles={["medico"]}><Historial /></SoloRoles>; }
