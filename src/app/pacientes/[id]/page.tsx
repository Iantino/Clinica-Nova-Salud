"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import SoloRoles from "@/components/SoloRoles";
import Aviso from "@/components/ui/Aviso";
import { useConsulta } from "@/lib/useConsulta";
import { useSesion } from "@/lib/sesion";
import { obtenerPaciente, type DatosPaciente, type Paciente } from "@/lib/pacientes";
import FormularioPaciente from "../FormularioPaciente";

// Convierte los null de la API en textos vacíos para el formulario
function aFormulario(p: Paciente): DatosPaciente {
  return {
    dpi: p.dpi ?? "",
    nombre: p.nombre,
    apellido: p.apellido,
    fecha_nacimiento: p.fecha_nacimiento,
    sexo: p.sexo,
    telefono: p.telefono,
    correo: p.correo ?? "",
    direccion: p.direccion ?? "",
    nombre_encargado: p.nombre_encargado ?? "",
    alergias: p.alergias ?? "",
    antecedentes: p.antecedentes ?? "",
  };
}

function FichaPaciente() {
  const { id } = useParams<{ id: string }>();
  const { usuario } = useSesion();
  const recienRegistrado = useSearchParams().has("nuevo");
  const [guardado, setGuardado] = useState(0);
  const { datos, error, recargar } = useConsulta(`paciente-${id}`, () => obtenerPaciente(Number(id)));
  const soloLectura = usuario.rol === "medico";

  return (
    <>
      <Link href="/pacientes" className="text-sm font-semibold text-hoja underline-offset-4 hover:underline">
        Pacientes
      </Link>

      {error && (
        <div className="mt-4 max-w-xl">
          <Aviso>{error}</Aviso>
        </div>
      )}

      {datos && (
        <>
          <h1 className="mt-2 font-display text-3xl font-bold text-pino">
            {datos.paciente.nombre} {datos.paciente.apellido}
          </h1>
          <p className="mt-1 mb-8 text-tinta/70">
            {datos.paciente.edad} {datos.paciente.edad === 1 ? "año" : "años"}.
            {soloLectura && " Puedes consultar esta ficha, pero no editarla."}
          </p>
          {usuario.rol === "medico" && (
            <Link href={`/pacientes/${datos.paciente.id}/historial`} className="mb-6 inline-flex rounded-md bg-pino px-4 py-2.5 font-semibold text-white hover:bg-hoja">
              Ver historial clínico
            </Link>
          )}
          {(guardado > 0 || recienRegistrado) && (
            <div className="mb-6 max-w-3xl">
              <Aviso tono="exito">
                {guardado > 0
                  ? "Se guardaron los cambios."
                  : `Se registró a ${datos.paciente.nombre} ${datos.paciente.apellido}.`}
              </Aviso>
            </div>
          )}
          <FormularioPaciente
            key={datos.paciente.id}
            id={datos.paciente.id}
            inicial={aFormulario(datos.paciente)}
            soloLectura={soloLectura}
            ocultarDatosSalud={usuario.rol === "recepcionista"}
            alGuardar={() => {
              setGuardado((n) => n + 1);
              recargar();
            }}
          />
        </>
      )}
    </>
  );
}

export default function PacientePage() {
  return (
    <SoloRoles roles={["administrador", "recepcionista", "medico"]}>
      <Suspense>
        <FichaPaciente />
      </Suspense>
    </SoloRoles>
  );
}

