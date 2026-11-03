"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

type Props = {
  titulo: string;
  descripcion: string;
  children: ReactNode;
};

export default function PortalAuthShell({ titulo, descripcion, children }: Props) {
  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-[#f3faf7] px-4 py-8 sm:px-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_5%_5%,rgba(191,241,223,0.82),transparent_38%),radial-gradient(ellipse_at_95%_92%,rgba(179,235,217,0.62),transparent_40%),linear-gradient(145deg,#f4faf7,#ffffff_56%,#effaf5)]"
      />
      <div aria-hidden="true" className="absolute -left-48 top-[18%] -z-10 size-[28rem] rounded-full border border-emerald-800/5 shadow-[0_0_0_2rem_rgba(8,113,94,0.025),0_0_0_5rem_rgba(8,113,94,0.018)]" />
      <div aria-hidden="true" className="absolute -right-36 bottom-[-14rem] -z-10 size-[34rem] rounded-full border-[2.2rem] border-emerald-800/[0.04]" />

      <div className="w-full max-w-xl">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-md px-1 py-2 text-sm font-semibold text-[#075344] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hoja/40"
        >
          <span aria-hidden="true">←</span> Volver al inicio de sesión
        </Link>

        <section className="mt-3 rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-[0_24px_70px_rgba(8,75,59,0.12)] backdrop-blur-xl sm:p-10">
          <BrandLogo size={126} className="mx-auto drop-shadow-[0_8px_18px_rgba(0,85,69,0.12)]" />
          <div className="mt-4 text-center">
            <p className="text-xs font-bold tracking-[0.18em] text-[#13836d] uppercase">Portal NovaSalud</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{titulo}</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">{descripcion}</p>
          </div>
          {children}
        </section>

        <p className="mt-5 text-center text-xs text-slate-500">Clínica NovaSalud · Tu salud en buenas manos</p>
      </div>
    </main>
  );
}
