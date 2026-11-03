"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { Rol } from "@/lib/auth";
import { useSesion } from "@/lib/sesion";

// Muestra el contenido solo a los roles indicados
export default function SoloRoles({ roles, children }: { roles: Rol[]; children: ReactNode }) {
  const { usuario } = useSesion();

  if (!roles.includes(usuario.rol)) {
    return (
      <div className="max-w-md">
        <h1 className="font-display text-2xl font-bold text-pino">Esta sección no está disponible</h1>
        <p className="mt-2 text-tinta/70">Tu usuario no tiene permiso para ver esta página.</p>
        <Link href="/panel" className="mt-4 inline-block font-semibold text-hoja underline underline-offset-4">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return children;
}
