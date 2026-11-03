"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import {
  actualizarMedico,
  crearMedico,
  type DatosMedico,
  type Especialidad,
  type HorarioMedico,
  type Medico,
} from "@/lib/medicos";
import Campo, { estiloControl } from "@/components/ui/Campo";
import Boton from "@/components/ui/Boton";
import Aviso from "@/components/ui/Aviso";

const DIAS = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

function horarioInicial(medico: Medico | null): HorarioMedico[] {
  if (medico) return medico.horarios.map(({ dia_semana, hora_inicio, hora_fin }) => ({ dia_semana, hora_inicio, hora_fin }));
  return [1, 2, 3, 4, 5].map((dia_semana) => ({ dia_semana, hora_inicio: "08:00", hora_fin: "13:00" }));
}

export default function FormularioMedico({
  medico,
  especialidades,
  alGuardar,
  alCancelar,
}: {
  medico: Medico | null;
  especialidades: Especialidad[];
  alGuardar: (medico: Medico) => void;
  alCancelar: () => void;
}) {
  const [datos, setDatos] = useState<DatosMedico>({
    nombre: medico?.nombre ?? "",
    apellido: medico?.apellido ?? "",
    correo: medico?.correo ?? "",
    password: "",
    especialidad_id: medico?.especialidad_id ?? especialidades[0]?.id ?? 0,
    colegiado: medico?.colegiado ?? "",
    telefono: medico?.telefono ?? "",
    horarios: horarioInicial(medico),
  });
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  function cambiarHorario(dia: number, campo: "hora_inicio" | "hora_fin", valor: string) {
    setDatos((actual) => ({
      ...actual,
      horarios: actual.horarios.map((h) => h.dia_semana === dia ? { ...h, [campo]: valor } : h),
    }));
  }

  function alternarDia(dia: number, habilitado: boolean) {
    setDatos((actual) => ({
      ...actual,
      horarios: habilitado
        ? [...actual.horarios, { dia_semana: dia, hora_inicio: "08:00", hora_fin: "13:00" }].sort((a, b) => a.dia_semana - b.dia_semana)
        : actual.horarios.filter((h) => h.dia_semana !== dia),
    }));
  }

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError("");
    setGuardando(true);
    const cuerpo = { ...datos };
    if (!cuerpo.password) delete cuerpo.password;
    try {
      const respuesta = medico
        ? await actualizarMedico(medico.id, cuerpo)
        : await crearMedico(cuerpo);
      alGuardar(respuesta.medico);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "No se pudo guardar el médico.");
      setGuardando(false);
    }
  }

  return (
    <form noValidate onSubmit={guardar} className="space-y-5">
      <div>
        <p className="text-xs font-semibold tracking-[0.14em] text-hoja uppercase">Personal clínico</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-pino">{medico ? "Editar médico" : "Registrar médico"}</h2>
      </div>
      {error && <Aviso>{error}</Aviso>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="m-nombre" etiqueta="Nombre" required value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} />
        <Campo id="m-apellido" etiqueta="Apellido" required value={datos.apellido} onChange={(e) => setDatos({ ...datos, apellido: e.target.value })} />
      </div>
      <Campo id="m-correo" etiqueta="Correo de acceso" type="email" required value={datos.correo} onChange={(e) => setDatos({ ...datos, correo: e.target.value })} />
      <Campo
        id="m-password"
        etiqueta={medico ? "Nueva contraseña (opcional)" : "Contraseña inicial"}
        type="password"
        required={!medico}
        autoComplete="new-password"
        value={datos.password ?? ""}
        onChange={(e) => setDatos({ ...datos, password: e.target.value })}
        ayuda="Mínimo 8 caracteres, con al menos una letra y un número."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo id="m-colegiado" etiqueta="Colegiado" required value={datos.colegiado} onChange={(e) => setDatos({ ...datos, colegiado: e.target.value })} />
        <Campo id="m-telefono" etiqueta="Teléfono" type="tel" value={datos.telefono} onChange={(e) => setDatos({ ...datos, telefono: e.target.value })} />
        <Campo id="m-especialidad" etiqueta="Especialidad">
          <select id="m-especialidad" required value={datos.especialidad_id} onChange={(e) => setDatos({ ...datos, especialidad_id: Number(e.target.value) })} className={estiloControl}>
            <option value={0} disabled>Elige una especialidad</option>
            {especialidades.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </Campo>
      </div>
      <fieldset className="space-y-3 rounded-xl border border-tinta/10 p-4">
        <legend className="px-1 font-semibold text-pino">Horario semanal</legend>
        <p className="text-sm text-tinta/60">El sistema ofrece citas de 20 minutos dentro de estos horarios.</p>
        <div className="space-y-2">
          {DIAS.slice(1).map((nombreDia, indice) => {
            const dia = indice + 1;
            const horario = datos.horarios.find((h) => h.dia_semana === dia);
            return (
              <div key={dia} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 sm:grid-cols-[7rem_1fr_1fr_auto]">
                <label htmlFor={`dia-${dia}`} className="flex items-center gap-2 text-sm font-medium">
                  <input id={`dia-${dia}`} type="checkbox" checked={Boolean(horario)} onChange={(e) => alternarDia(dia, e.target.checked)} className="accent-hoja" />
                  {nombreDia}
                </label>
                {horario ? (
                  <>
                    <input aria-label={`${nombreDia}, desde`} type="time" min="08:00" max="12:40" value={horario.hora_inicio} onChange={(e) => cambiarHorario(dia, "hora_inicio", e.target.value)} className={`${estiloControl} mt-0`} />
                    <span className="text-center text-xs text-tinta/55">a</span>
                    <input aria-label={`${nombreDia}, hasta`} type="time" min="08:20" max="13:00" value={horario.hora_fin} onChange={(e) => cambiarHorario(dia, "hora_fin", e.target.value)} className={`${estiloControl} mt-0`} />
                  </>
                ) : <span className="col-span-2 text-sm text-tinta/45 sm:col-span-3">Sin atención</span>}
              </div>
            );
          })}
        </div>
      </fieldset>
      <div className="flex flex-wrap justify-end gap-3">
        <Boton variante="secundario" onClick={alCancelar}>Cancelar</Boton>
        <Boton type="submit" disabled={guardando || especialidades.length === 0}>{guardando ? "Guardando…" : "Guardar médico"}</Boton>
      </div>
    </form>
  );
}
