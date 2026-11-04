"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SesionProvider, useSesion } from "@/lib/sesion";
import { menuPara, NOMBRE_ROL } from "@/lib/navegacion";
import BrandLogo from "@/components/BrandLogo";
import Icono, { type NombreIcono } from "@/components/Icono";

const iconosMenu: Record<string, NombreIcono> = {
  "/panel": "inicio", "/pacientes": "pacientes", "/citas": "citas",
  "/medicos": "medicos", "/usuarios": "usuarios", "/reportes": "reportes",
  "/mis-citas": "citas",
};

function Menu({ alNavegar }: { alNavegar?: () => void }) {
  const { usuario, salir } = useSesion();
  const ruta = usePathname();

  return (
    <div className="flex min-h-full flex-col">
      <div className="relative flex justify-center px-5 pt-7 pb-2">
        <BrandLogo size={188} />
      </div>

      <nav aria-label="Principal" className="relative mt-6 flex-1 px-3.5">
        <ul className="space-y-2">
          {menuPara(usuario.rol).map((enlace) => {
            const activo = ruta === enlace.href || ruta.startsWith(`${enlace.href}/`);
            return (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  onClick={alNavegar}
                  aria-current={activo ? "page" : undefined}
                  className="group flex items-center gap-3 rounded-xl px-3.5 py-3 font-medium text-white/80 transition-all duration-200 hover:translate-x-0.5 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#83e3c4] focus-visible:outline-none aria-[current=page]:bg-gradient-to-r aria-[current=page]:from-[#c7f3df] aria-[current=page]:to-[#e7fbf3] aria-[current=page]:text-[#0a483b] aria-[current=page]:shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg text-[#b9eedd] transition-colors group-aria-[current=page]:bg-white/60 group-aria-[current=page]:text-[#08785d]">
                    <Icono nombre={iconosMenu[enlace.href] ?? "inicio"} className="size-5" />
                  </span>
                  <span>{enlace.texto}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="relative border-t border-white/15 px-6 py-5">
        <p className="font-semibold text-white">
          {usuario.nombre} {usuario.apellido}
        </p>
        <p className="text-sm text-menta/75">{NOMBRE_ROL[usuario.rol]}</p>
        <button
          type="button"
          onClick={salir}
          className="mt-3 text-sm font-semibold text-[#b9eedd] underline-offset-4 hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-menta focus-visible:outline-none"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function Estructura({ children }: { children: ReactNode }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    if (!menuAbierto) return;

    const overflowAnterior = document.body.style.overflow;
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setMenuAbierto(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, [menuAbierto]);

  return (
    <div className="app-shell min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      {/* Barra superior en celulares */}
      <header className="sticky top-0 z-20 flex items-center justify-between bg-pino px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2 font-display font-semibold text-white">
          <BrandLogo size={36} className="rounded-md" iconOnly />
          <span>Clínica NovaSalud</span>
        </div>
        <button
          type="button"
          onClick={() => setMenuAbierto(true)}
          aria-expanded={menuAbierto}
          aria-controls="menu-lateral"
          className="rounded-md px-3 py-1.5 text-sm font-semibold text-menta ring-1 ring-menta/40 focus-visible:ring-2 focus-visible:ring-menta focus-visible:outline-none"
        >
          Menú
        </button>
      </header>

      {menuAbierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setMenuAbierto(false)}
          className="fixed inset-0 z-30 bg-tinta/50 lg:hidden"
        />
      )}

      <aside
        id="menu-lateral"
        className={`sidebar-surface fixed inset-y-0 left-0 z-40 h-dvh w-[min(17rem,84vw)] overscroll-contain transition-transform lg:sticky lg:top-0 lg:h-dvh lg:w-auto lg:translate-x-0 ${
          menuAbierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Menu alNavegar={() => setMenuAbierto(false)} />
      </aside>

      <main className="app-canvas relative min-w-0 px-4 py-7 sm:px-7 lg:px-10 lg:py-9 xl:px-12">
        <div className="app-watermark" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}

// Estructura de todas las pantallas internas: sesión, menú por rol y contenido
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <SesionProvider>
      <Estructura>{children}</Estructura>
    </SesionProvider>
  );
}
