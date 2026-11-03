"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SoloRoles from "@/components/SoloRoles";
import { useSesion } from "@/lib/sesion";
import { PACIENTE_VACIO } from "@/lib/pacientes";
import FormularioPaciente from "../FormularioPaciente";

export default function NuevoPacientePage() {
  const router = useRouter();
  const { usuario } = useSesion();

  return (
    <SoloRoles roles={["administrador", "recepcionista"]}>
      <Link href="/pacientes" className="text-sm font-semibold text-hoja underline-offset-4 hover:underline">
        Pacientes
      </Link>
      <h1 className="mt-2 mb-8 font-display text-3xl font-bold text-pino">Registrar paciente</h1>
      <FormularioPaciente
        inicial={PACIENTE_VACIO}
        ocultarDatosSalud={usuario.rol === "recepcionista"}
        alGuardar={(p) => router.replace(`/pacientes/${p.id}?nuevo=1`)}
      />
    </SoloRoles>
  );
}

