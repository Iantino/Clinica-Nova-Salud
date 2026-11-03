"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import SoloRoles from "@/components/SoloRoles";
import Aviso from "@/components/ui/Aviso";
import Boton from "@/components/ui/Boton";
import Campo, { estiloControl } from "@/components/ui/Campo";
import { useConsulta } from "@/lib/useConsulta";
import { obtenerCita } from "@/lib/citas";
import { crearConsulta, type DatosConsulta } from "@/lib/consultas";

function FormularioConsulta() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const cita = useConsulta(`cita-clinica-${id}`, () => obtenerCita(Number(id)));
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [consultaId, setConsultaId] = useState<number | null>(null);
  const [datos, setDatos] = useState<DatosConsulta>({
    cita_id: Number(id), motivo_consulta: "", presion_arterial: "", frecuencia_cardiaca: null,
    temperatura: null, peso_kg: null, talla_cm: null, diagnostico: "", tratamiento: "", notas: "",
  });
  const actualizar = (campo: keyof DatosConsulta, valor: string) => setDatos(actual => ({
    ...actual,
    [campo]: ["frecuencia_cardiaca", "temperatura", "peso_kg", "talla_cm"].includes(campo)
      ? (valor === "" ? null : Number(valor)) : valor,
  }));
  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setGuardando(true);
    try {
      const r = await crearConsulta(datos);
      setConsultaId(r.consulta.id);
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo guardar la consulta."); }
    finally { setGuardando(false); }
  }

  if (consultaId) return <div className="mx-auto max-w-2xl space-y-5"><Aviso tono="exito">La consulta quedó registrada y la cita aparece como atendida.</Aviso><div className="flex flex-wrap gap-3"><Link href={`/consultas/${consultaId}/receta`} className="rounded-md bg-pino px-4 py-2.5 font-semibold text-white hover:bg-hoja">Emitir receta</Link><Link href={`/pacientes/${cita.datos?.cita.paciente_id}/historial`} className="rounded-md border border-pino px-4 py-2.5 font-semibold text-pino hover:bg-menta/60">Ver historial clínico</Link><Boton variante="texto" onClick={() => router.push("/citas")}>Volver a la agenda</Boton></div></div>;
  if (cita.cargando) return <p role="status" className="text-tinta/60">Cargando cita…</p>;
  if (cita.error || !cita.datos) return <div className="max-w-xl space-y-4"><Aviso>{cita.error ?? "No se encontró la cita."}</Aviso><Link href="/citas" className="font-semibold text-hoja">Volver a la agenda</Link></div>;
  const c = cita.datos.cita;
  if (c.estado !== "en_atencion") return <div className="max-w-xl space-y-4"><Aviso>Solo puedes registrar una consulta después de iniciar la atención de la cita.</Aviso><Link href="/citas" className="font-semibold text-hoja">Volver a la agenda</Link></div>;

  return <div className="mx-auto max-w-4xl space-y-6">
    <Link href="/citas" className="text-sm font-semibold text-hoja hover:underline">← Agenda</Link>
    <header><p className="text-xs font-semibold tracking-[0.15em] text-hoja uppercase">Expediente clínico</p><h1 className="mt-1 font-display text-3xl font-bold text-pino">Registrar consulta</h1><p className="mt-2 text-tinta/70">{c.paciente_nombre} {c.paciente_apellido} · {new Intl.DateTimeFormat("es-GT", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${c.fecha}T12:00:00Z`))} · {c.hora_inicio}</p></header>
    {error && <Aviso>{error}</Aviso>}
    <form onSubmit={guardar} className="space-y-6 rounded-2xl border border-tinta/10 bg-white p-5 shadow-sm sm:p-8">
      <section className="grid gap-4 sm:grid-cols-2"><Campo id="motivo_consulta" etiqueta="Motivo de consulta" required maxLength={255} value={datos.motivo_consulta} onChange={e => actualizar("motivo_consulta", e.target.value)} className="sm:col-span-2" /><Campo id="presion_arterial" etiqueta="Presión arterial" placeholder="120/80" maxLength={10} value={datos.presion_arterial} onChange={e => actualizar("presion_arterial", e.target.value)} /><Campo id="frecuencia_cardiaca" etiqueta="Frecuencia cardíaca (lpm)" type="number" min="1" max="300" value={datos.frecuencia_cardiaca ?? ""} onChange={e => actualizar("frecuencia_cardiaca", e.target.value)} /><Campo id="temperatura" etiqueta="Temperatura (°C)" type="number" min="1" max="50" step="0.1" value={datos.temperatura ?? ""} onChange={e => actualizar("temperatura", e.target.value)} /><Campo id="peso_kg" etiqueta="Peso (kg)" type="number" min="0.1" max="500" step="0.1" value={datos.peso_kg ?? ""} onChange={e => actualizar("peso_kg", e.target.value)} /><Campo id="talla_cm" etiqueta="Talla (cm)" type="number" min="1" max="250" step="0.1" value={datos.talla_cm ?? ""} onChange={e => actualizar("talla_cm", e.target.value)} /></section>
      <Campo id="diagnostico" etiqueta="Diagnóstico" required maxLength={10000} value={datos.diagnostico} onChange={e => actualizar("diagnostico", e.target.value)}><textarea id="diagnostico" required maxLength={10000} rows={4} value={datos.diagnostico} onChange={e => actualizar("diagnostico", e.target.value)} className={estiloControl} /></Campo>
      <Campo id="tratamiento" etiqueta="Tratamiento" maxLength={10000} value={datos.tratamiento} onChange={e => actualizar("tratamiento", e.target.value)}><textarea id="tratamiento" maxLength={10000} rows={3} value={datos.tratamiento} onChange={e => actualizar("tratamiento", e.target.value)} className={estiloControl} /></Campo>
      <Campo id="notas" etiqueta="Notas clínicas" maxLength={10000} value={datos.notas} onChange={e => actualizar("notas", e.target.value)}><textarea id="notas" maxLength={10000} rows={3} value={datos.notas} onChange={e => actualizar("notas", e.target.value)} className={estiloControl} /></Campo>
      <div className="flex justify-end"><Boton type="submit" disabled={guardando}>{guardando ? "Guardando consulta…" : "Guardar consulta"}</Boton></div>
    </form>
  </div>;
}

export default function ConsultaPage() { return <SoloRoles roles={["medico"]}><FormularioConsulta /></SoloRoles>; }
