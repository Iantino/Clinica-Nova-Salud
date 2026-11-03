"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { crearCita, listarCitas, reprogramarCita, type Cita } from "@/lib/citas";
import { listarPacientes, type PacienteResumen } from "@/lib/pacientes";
import { type Medico } from "@/lib/medicos";
import { useConsulta } from "@/lib/useConsulta";
import { useDebounce } from "@/lib/useDebounce";
import Campo, { estiloControl } from "@/components/ui/Campo";
import Boton from "@/components/ui/Boton";
import Aviso from "@/components/ui/Aviso";

function fechaDeHoy() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
}

function diaSemana(fecha: string) {
  const dia = new Date(`${fecha}T00:00:00Z`).getUTCDay();
  return dia || 7;
}

function sumar20(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  const t = h * 60 + m + 20;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

export default function FormularioCita({
  cita,
  medicos,
  alGuardar,
  alCancelar,
}: {
  cita: Cita | null;
  medicos: Medico[];
  alGuardar: (cita: Cita) => void;
  alCancelar: () => void;
}) {
  const activos = medicos.filter((m) => m.activo);
  const [medicoId, setMedicoId] = useState(cita?.medico_id ?? activos[0]?.id ?? 0);
  const [fecha, setFecha] = useState(cita?.fecha ?? fechaDeHoy());
  const [hora, setHora] = useState(cita?.hora_inicio ?? "");
  const [motivo, setMotivo] = useState(cita?.motivo ?? "");
  const [pacienteId, setPacienteId] = useState(cita?.paciente_id ?? 0);
  const [busquedaPaciente, setBusquedaPaciente] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const termino = useDebounce(busquedaPaciente.trim());
  const pacienteClave = `pacientes-cita-${termino}`;
  const pacientes = useConsulta(pacienteClave, () => listarPacientes({
    buscar: termino.length >= 3 ? termino : undefined,
    pagina: 1,
  }));

  const citasClave = medicoId && fecha ? `ocupadas-${medicoId}-${fecha}-${cita?.id ?? "nueva"}` : "sin-filtros-cita";
  const citas = useConsulta(citasClave, () => medicoId && fecha
    ? listarCitas({ desde: fecha, hasta: fecha, medico_id: medicoId, pagina: 1 })
    : Promise.resolve({ datos: [], paginacion: { pagina: 1, porPagina: 20, total: 0, totalPaginas: 1 } }));

  const medico = activos.find((m) => m.id === medicoId);
  const horariosDelDia = useMemo(() => medicos.find((m) => m.id === medicoId && m.activo)?.horarios.filter((h) => h.dia_semana === diaSemana(fecha)) ?? [], [medicos, medicoId, fecha]);
  const horasDisponibles = useMemo(() => {
    const ocupadas = citas.datos?.datos.filter((c) => c.id !== cita?.id && c.estado !== "cancelada") ?? [];
    const horas: string[] = [];
    for (const horario of horariosDelDia) {
      const inicio = horario.hora_inicio.split(":").map(Number);
      const fin = horario.hora_fin.split(":").map(Number);
      const finMinutos = fin[0] * 60 + fin[1];
      for (let m = inicio[0] * 60 + inicio[1]; m + 20 <= finMinutos; m += 20) {
        const h = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
        const hFin = sumar20(h);
        if (!ocupadas.some((c) => h < c.hora_fin && hFin > c.hora_inicio)) horas.push(h);
      }
    }
    if (cita && !horas.includes(cita.hora_inicio)) horas.unshift(cita.hora_inicio);
    return horas;
  }, [citas.datos, cita, horariosDelDia]);

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError("");
    if (!cita && !pacienteId) {
      setError("Selecciona un paciente para la cita.");
      return;
    }
    if (!hora) {
      setError("Selecciona un horario disponible.");
      return;
    }
    setGuardando(true);
    try {
      const respuesta = cita
        ? await reprogramarCita(cita.id, { medico_id: medicoId, fecha, hora_inicio: hora })
        : await crearCita({ paciente_id: pacienteId, medico_id: medicoId, fecha, hora_inicio: hora, motivo });
      alGuardar(respuesta.cita);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "No se pudo guardar la cita.");
      setGuardando(false);
    }
  }

  const pacienteSeleccionado: PacienteResumen | undefined = pacientes.datos?.datos.find((p) => p.id === pacienteId);

  return (
    <form noValidate onSubmit={guardar} className="relative z-10 space-y-5">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/55 px-5 py-4">
        <p className="text-xs font-semibold tracking-[0.14em] text-hoja uppercase">Agenda clínica</p>
        <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-pino">{cita ? "Reprogramar cita" : "Nueva cita"}</h2>
      </div>
      <p className="-mt-3 text-sm text-slate-500">{cita ? "Selecciona un nuevo horario para esta visita." : "Completa los datos para reservar un horario con el profesional."}</p>
      {error && <Aviso>{error}</Aviso>}
      {!cita && (
        <div className="space-y-2 rounded-2xl border border-emerald-100 bg-white/75 p-4">
          <label htmlFor="buscar-paciente-cita" className="block text-sm font-semibold">Paciente</label>
          <input id="buscar-paciente-cita" type="search" value={busquedaPaciente} onChange={(e) => setBusquedaPaciente(e.target.value)} placeholder="Buscar por nombre, DPI o teléfono" className={`${estiloControl} mt-0`} />
          {pacienteSeleccionado && <p className="text-sm font-semibold text-hoja">Seleccionado: {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</p>}
          <select aria-label="Seleccionar paciente" value={pacienteId || ""} onChange={(e) => setPacienteId(Number(e.target.value))} className={`${estiloControl} mt-0`}>
            <option value="">Elige un paciente</option>
            {pacientes.datos?.datos.map((p) => <option key={p.id} value={p.id}>{p.apellido}, {p.nombre} · {p.telefono}</option>)}
          </select>
          {pacientes.error && <p className="text-sm text-error">{pacientes.error}</p>}
          {termino.length > 0 && termino.length < 3 && <p className="text-xs text-tinta/55">Escribe 3 caracteres para buscar en todo el listado.</p>}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="cita-fecha" etiqueta="Fecha" type="date" required min={fechaDeHoy()} value={fecha} onChange={(e) => { setFecha(e.target.value); setHora(""); }} />
        <Campo id="cita-medico" etiqueta="Médico">
          <select id="cita-medico" required value={medicoId} onChange={(e) => { setMedicoId(Number(e.target.value)); setHora(""); }} className={estiloControl}>
            <option value={0} disabled>Elige un médico</option>
            {activos.map((m) => <option key={m.id} value={m.id}>{m.nombre} {m.apellido} · {m.especialidad}</option>)}
          </select>
        </Campo>
        <Campo id="cita-hora" etiqueta="Hora disponible">
          <select id="cita-hora" required value={hora} onChange={(e) => setHora(e.target.value)} className={estiloControl}>
            <option value="">{citas.cargando ? "Buscando disponibilidad…" : "Elige una hora"}</option>
            {horasDisponibles.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          {!citas.cargando && horasDisponibles.length === 0 && <p className="mt-1 text-xs text-error">No hay espacios disponibles para este día.</p>}
        </Campo>
        {!cita && <Campo id="cita-motivo" etiqueta="Motivo (opcional)" maxLength={255} value={motivo} onChange={(e) => setMotivo(e.target.value)} />}
      </div>
      <p className="text-xs text-tinta/55">Duración de cada cita: 20 minutos. La API vuelve a validar el horario antes de reservar.</p>
      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4">
        <Boton variante="secundario" className="min-h-12 rounded-xl border-emerald-800/50 bg-white px-5 py-2.5 text-emerald-950 hover:bg-emerald-50" onClick={alCancelar}>Cancelar</Boton>
        <Boton type="submit" disabled={guardando || !medico || citas.cargando}>{guardando ? "Guardando…" : cita ? "Guardar cambio" : "Agendar cita"}</Boton>
      </div>
    </form>
  );
}
