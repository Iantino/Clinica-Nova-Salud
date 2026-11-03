"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import SoloRoles from "@/components/SoloRoles";
import Aviso from "@/components/ui/Aviso";
import Boton from "@/components/ui/Boton";
import Campo, { estiloControl } from "@/components/ui/Campo";
import { useConsulta } from "@/lib/useConsulta";
import { emitirReceta, obtenerConsulta, type MedicamentoReceta } from "@/lib/consultas";

const nuevoMedicamento = (): MedicamentoReceta => ({ medicamento: "", dosis: "", frecuencia: "", duracion: "" });

function RecetaPageContent() {
  const { id } = useParams<{ id: string }>();
  const { datos, error, cargando, recargar } = useConsulta(`consulta-receta-${id}`, () => obtenerConsulta(Number(id)));
  const [indicaciones, setIndicaciones] = useState("");
  const [medicamentos, setMedicamentos] = useState<MedicamentoReceta[]>([nuevoMedicamento()]);
  const [errorGuardar, setErrorGuardar] = useState("");
  const [guardando, setGuardando] = useState(false);
  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErrorGuardar(""); setGuardando(true);
    try {
      await emitirReceta(Number(id), { indicaciones_generales: indicaciones, medicamentos });
      recargar();
    } catch (e) { setErrorGuardar(e instanceof Error ? e.message : "No se pudo emitir la receta."); }
    finally { setGuardando(false); }
  }
  if (cargando) return <p role="status" className="text-tinta/60">Cargando consulta…</p>;
  if (error || !datos) return <div className="max-w-xl space-y-4"><Aviso>{error ?? "No se encontró la consulta."}</Aviso><Link href="/citas" className="font-semibold text-hoja">Volver a citas</Link></div>;
  const c = datos.consulta;
  return <section className="mx-auto max-w-3xl space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden"><Link href={`/pacientes/${c.paciente_id}/historial`} className="text-sm font-semibold text-hoja hover:underline">← Historial clínico</Link>{c.receta && <Boton variante="secundario" onClick={() => window.print()}>Imprimir receta</Boton>}</div>
    {errorGuardar && <Aviso>{errorGuardar}</Aviso>}
    <article className="receta-imprimible rounded-2xl border border-tinta/10 bg-white p-6 shadow-sm sm:p-10 print:border-0 print:p-0 print:shadow-none">
      <header className="flex items-start justify-between gap-5 border-b-2 border-hoja pb-5"><div><p className="text-sm font-semibold tracking-[0.16em] text-hoja uppercase">Clínica NovaSalud</p><h1 className="mt-2 font-display text-3xl font-bold text-pino">{c.receta ? "Receta médica" : "Consulta clínica"}</h1><p className="mt-2 text-sm text-tinta/60">{new Intl.DateTimeFormat("es-GT", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${c.fecha}T12:00:00Z`))}</p></div><Image src="/clinica-nova-salud-logo-transparente.png" alt="Clínica NovaSalud" width={1254} height={1254} priority className="size-20 shrink-0 object-contain print:size-16" /></header>
      <div className="grid gap-4 border-b border-tinta/10 py-5 sm:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-tinta/50">Paciente</p><p className="mt-1 font-semibold">{c.paciente_nombre} {c.paciente_apellido}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-tinta/50">Profesional</p><p className="mt-1 font-semibold">Dr. {c.medico_nombre} {c.medico_apellido}</p><p className="text-sm text-tinta/60">{c.especialidad}</p></div></div>
      <div className="space-y-4 border-b border-tinta/10 py-5"><div><h2 className="text-xs font-semibold uppercase tracking-wide text-tinta/50">Motivo de consulta</h2><p className="mt-1 whitespace-pre-wrap">{c.motivo_consulta}</p></div><div><h2 className="text-xs font-semibold uppercase tracking-wide text-tinta/50">Diagnóstico</h2><p className="mt-1 whitespace-pre-wrap">{c.diagnostico}</p></div>{c.tratamiento && <div><h2 className="text-xs font-semibold uppercase tracking-wide text-tinta/50">Tratamiento</h2><p className="mt-1 whitespace-pre-wrap">{c.tratamiento}</p></div>}</div>
      {c.receta ? <section className="space-y-5 py-6"><h2 className="font-display text-2xl font-bold text-pino">Medicamentos</h2><ol className="space-y-4">{c.receta.medicamentos.map((m, i) => <li key={m.id ?? i} className="rounded-lg bg-papel p-4 print:border print:border-tinta/20 print:bg-white"><p className="font-semibold">{i + 1}. {m.medicamento}</p><p className="mt-1 text-sm">Dosis: {m.dosis} · Frecuencia: {m.frecuencia} · Duración: {m.duracion}</p></li>)}</ol>{c.receta.indicaciones_generales && <div><h3 className="text-xs font-semibold uppercase tracking-wide text-tinta/50">Indicaciones</h3><p className="mt-1 whitespace-pre-wrap">{c.receta.indicaciones_generales}</p></div>}<div className="pt-12 text-right"><div className="ml-auto w-56 border-t border-tinta/40 pt-2 text-center text-sm">Firma y sello del profesional</div></div></section> : <div className="print:hidden"><h2 className="mt-6 font-display text-2xl font-bold text-pino">Emitir receta</h2><form onSubmit={guardar} className="mt-4 space-y-5"><div className="space-y-4">{medicamentos.map((m, i) => <fieldset key={i} className="rounded-xl border border-tinta/10 p-4"><legend className="px-2 font-semibold text-pino">Medicamento {i + 1}</legend><div className="grid gap-3 sm:grid-cols-2"><Campo id={`med-${i}-nombre`} etiqueta="Medicamento" required maxLength={120} value={m.medicamento} onChange={e => setMedicamentos(items => items.map((x, j) => j === i ? { ...x, medicamento: e.target.value } : x))} /><Campo id={`med-${i}-dosis`} etiqueta="Dosis" required maxLength={60} value={m.dosis} onChange={e => setMedicamentos(items => items.map((x, j) => j === i ? { ...x, dosis: e.target.value } : x))} /><Campo id={`med-${i}-frecuencia`} etiqueta="Frecuencia" required maxLength={60} placeholder="Cada 8 horas" value={m.frecuencia} onChange={e => setMedicamentos(items => items.map((x, j) => j === i ? { ...x, frecuencia: e.target.value } : x))} /><Campo id={`med-${i}-duracion`} etiqueta="Duración" required maxLength={60} placeholder="5 días" value={m.duracion} onChange={e => setMedicamentos(items => items.map((x, j) => j === i ? { ...x, duracion: e.target.value } : x))} /></div>{medicamentos.length > 1 && <button type="button" className="mt-3 text-sm font-semibold text-error" onClick={() => setMedicamentos(items => items.filter((_, j) => j !== i))}>Quitar medicamento</button>}</fieldset>)}</div><Boton variante="secundario" onClick={() => setMedicamentos(items => [...items, nuevoMedicamento()])}>Agregar medicamento</Boton><Campo id="indicaciones-generales" etiqueta="Indicaciones generales" maxLength={5000} value={indicaciones} onChange={e => setIndicaciones(e.target.value)}><textarea id="indicaciones-generales" rows={3} maxLength={5000} value={indicaciones} onChange={e => setIndicaciones(e.target.value)} className={estiloControl} /></Campo><div className="flex justify-end"><Boton type="submit" disabled={guardando}>{guardando ? "Emitiendo…" : "Guardar receta"}</Boton></div></form></div>}
    </article>
  </section>;
}

export default function RecetaPage() { return <SoloRoles roles={["medico"]}><RecetaPageContent /></SoloRoles>; }
