"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cerrarSesion, obtenerSesion, type Usuario } from "./auth";

type Sesion = { usuario: Usuario; salir: () => Promise<void> };

const SesionContext = createContext<Sesion | null>(null);

// Carga la sesión una vez y la comparte con todas las pantallas internas.
// Si no hay sesión, envía al inicio de sesión.
export function SesionProvider({ children }: { children: ReactNode }) {
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
    return (
      <p role="status" className="p-8 text-tinta/70">
        Cargando tu sesión…
      </p>
    );
  }

  return <SesionContext.Provider value={{ usuario, salir }}>{children}</SesionContext.Provider>;
}

export function useSesion() {
  const sesion = useContext(SesionContext);
  if (!sesion) throw new Error("useSesion debe usarse dentro de SesionProvider");
  return sesion;
}
