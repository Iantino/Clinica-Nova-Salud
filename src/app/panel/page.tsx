"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cerrarSesion, obtenerSesion, type Usuario } from "@/lib/auth";

const NOMBRE_ROL: Record<Usuario["rol"], string> = {
  administrador: "Administración",
  recepcionista: "Recepción",
  medico: "Médico",
  paciente: "Paciente",
};

// Página temporal: se reemplaza con el layout por rol de la HU-07
export default function PanelPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    obtenerSesion()
      .then(({ usuario }) => setUsuario(usuario))
      .catch(() => router.replace("/login"));
  }, [router]);

  async function salir() {
    await cerrarSesion().catch(() => undefined);
    router.replace("/login");
  }

  if (!usuario) {
    return <p className="p-8 text-tinta/70">Cargando tu sesión…</p>;
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm font-semibold text-hoja">{NOMBRE_ROL[usuario.rol]}</p>
      <h1 className="mt-1 font-display text-4xl font-bold text-pino">
        Hola, {usuario.nombre}
      </h1>
      <p className="mt-3 text-tinta/70">Iniciaste sesión como {usuario.correo}.</p>
      <button
        type="button"
        onClick={salir}
        className="mt-8 rounded-md border border-pino px-4 py-2.5 font-semibold text-pino hover:bg-menta/60 focus-visible:ring-2 focus-visible:ring-hoja/50 focus-visible:outline-none"
      >
        Cerrar sesión
      </button>
    </main>
  );
}
