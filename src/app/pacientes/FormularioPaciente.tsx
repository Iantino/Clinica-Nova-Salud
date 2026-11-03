"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import {
  actualizarPaciente,
  crearPaciente,
  edadDesde,
  type DatosPaciente,
  type Paciente,
} from "@/lib/pacientes";
import Campo, { estiloControl } from "@/components/ui/Campo";
import Boton from "@/components/ui/Boton";
import Aviso from "@/components/ui/Aviso";

type Errores = Partial<Record<keyof DatosPaciente, string>>;
type Existente = { id: number; nombre: string; apellido: string };

export default function FormularioPaciente({
  id,
  inicial,
  soloLectura = false,
  ocultarDatosSalud = false,
  alGuardar,
}: {
  id?: number;
  inicial: DatosPaciente;
  soloLectura?: boolean;
  ocultarDatosSalud?: boolean;
  alGuardar: (paciente: Paciente) => void;
}) {
  const [datos, setDatos] = useState(inicial);
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [existente, setExistente] = useState<Existente | null>(null);
  const [guardando, setGuardando] = useState(false);

  const edad = edadDesde(datos.fecha_nacimiento);
  const esMenor = edad !== null && edad < 18;

  const campo = (nombre: keyof DatosPaciente) => ({
    id: `p-${nombre}`,
    value: datos[nombre],
    error: errores[nombre],
    onChange: (e: { target: { value: string } }) =>
      setDatos((d) => ({ ...d, [nombre]: e.target.value })),
  });

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrores({});
    setErrorGeneral("");
    setExistente(null);
    setGuardando(true);

    try {
      const { paciente } = id ? await actualizarPaciente(id, datos) : await crearPaciente(datos);
      alGuardar(paciente);
    } catch (error) {
      if (error instanceof ApiError && error.errores) {
        setErrores(Object.fromEntries(error.errores.map((e) => [e.campo, e.mensaje])));
      } else if (error instanceof ApiError && error.status === 409) {
        setErrores({ dpi: "Este DPI ya está registrado." });
        setExistente((error.datos.pacienteExistente as Existente) ?? null);
        setErrorGeneral(error.message);
      } else {
        setErrorGeneral(error instanceof Error ? error.message : "No se pudo guardar.");
      }
      setGuardando(false);
    }
  }

  return (
    <form noValidate onSubmit={guardar} className="max-w-3xl">
      {errorGeneral && (
        <div className="mb-6">
          <Aviso>
            {errorGeneral}
            {existente && (
              <>
                {" "}
                <Link href={`/pacientes/${existente.id}`} className="font-semibold underline underline-offset-4">
                  Ver su ficha
                </Link>
              </>
            )}
          </Aviso>
        </div>
      )}

      <fieldset disabled={soloLectura || guardando} className="space-y-8">
        <section aria-labelledby="sec-identidad" className="space-y-4">
          <h2 id="sec-identidad" className="font-display text-xl font-semibold text-pino">
            Identificación
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Nombre" autoComplete="off" {...campo("nombre")} />
            <Campo etiqueta="Apellido" autoComplete="off" {...campo("apellido")} />
            <Campo
              etiqueta="Fecha de nacimiento"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              ayuda={edad !== null ? `${edad} ${edad === 1 ? "año" : "años"}` : undefined}
              {...campo("fecha_nacimiento")}
            />
            <Campo id="p-sexo" etiqueta="Sexo" error={errores.sexo}>
              <select
                id="p-sexo"
                value={datos.sexo}
                onChange={(e) => setDatos((d) => ({ ...d, sexo: e.target.value as DatosPaciente["sexo"] }))}
                aria-invalid={Boolean(errores.sexo)}
                className={estiloControl}
              >
                <option value="" disabled>
                  Elige una opción
                </option>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
              </select>
            </Campo>
            <Campo
              etiqueta={esMenor ? "DPI (opcional)" : "DPI"}
              inputMode="numeric"
              maxLength={13}
              ayuda="13 dígitos, sin espacios ni guiones."
              {...campo("dpi")}
            />
            <Campo
              etiqueta={esMenor ? "Nombre del encargado" : "Nombre del encargado (opcional)"}
              autoComplete="off"
              ayuda={esMenor ? "Obligatorio para menores de edad." : undefined}
              {...campo("nombre_encargado")}
            />
          </div>
        </section>

        <section aria-labelledby="sec-contacto" className="space-y-4">
          <h2 id="sec-contacto" className="font-display text-xl font-semibold text-pino">
            Contacto
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              etiqueta="Teléfono"
              type="tel"
              inputMode="numeric"
              maxLength={8}
              ayuda="8 dígitos."
              {...campo("telefono")}
            />
            <Campo etiqueta="Correo (opcional)" type="email" {...campo("correo")} />
            <Campo etiqueta="Dirección (opcional)" className="sm:col-span-2" {...campo("direccion")} />
          </div>
        </section>

        {!ocultarDatosSalud && (
        <section aria-labelledby="sec-salud" className="space-y-4">
          <h2 id="sec-salud" className="font-display text-xl font-semibold text-pino">
            Datos de salud
          </h2>
          {(["alergias", "antecedentes"] as const).map((nombre) => (
            <Campo
              key={nombre}
              id={`p-${nombre}`}
              etiqueta={nombre === "alergias" ? "Alergias (opcional)" : "Antecedentes (opcional)"}
              error={errores[nombre]}
            >
              <textarea
                id={`p-${nombre}`}
                rows={3}
                value={datos[nombre]}
                onChange={(e) => setDatos((d) => ({ ...d, [nombre]: e.target.value }))}
                className={estiloControl}
              />
            </Campo>
          ))}
        </section>
        )}
      </fieldset>

      {!soloLectura && (
        <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-tinta/10 pt-6">
          <Link
            href="/pacientes"
            className="rounded-md border border-pino px-4 py-2.5 font-semibold text-pino hover:bg-menta/60 focus-visible:ring-2 focus-visible:ring-hoja/50 focus-visible:outline-none"
          >
            Cancelar
          </Link>
          <Boton type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : id ? "Guardar cambios" : "Registrar paciente"}
          </Boton>
        </div>
      )}
    </form>
  );
}

