"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { iniciarSesion } from "@/lib/auth";
import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ErroresCampo = { correo?: string; password?: string };

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errores, setErrores] = useState<ErroresCampo>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Validación en el cliente (RNF-06); el servidor vuelve a validar
  function validar(): ErroresCampo {
    const nuevos: ErroresCampo = {};
    if (!correo.trim()) nuevos.correo = "Escribe tu correo.";
    else if (!CORREO_VALIDO.test(correo.trim()))
      nuevos.correo = "Usa el formato nombre@dominio.com.";
    if (!password) nuevos.password = "Escribe tu contraseña.";
    return nuevos;
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorGeneral("");

    const nuevos = validar();
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setEnviando(true);
    try {
      await iniciarSesion(correo.trim(), password);
      router.replace("/panel");
    } catch (error) {
      if (error instanceof ApiError && error.status === 400 && error.errores) {
        setErrores(Object.fromEntries(error.errores.map((e) => [e.campo, e.mensaje])));
      } else {
        setErrorGeneral(
          error instanceof ApiError ? error.message : "Ocurrió un error inesperado."
        );
        setPassword("");
      }
      setEnviando(false);
    }
  }

  return (
    <main className="grid min-h-dvh lg:grid-cols-[55%_45%]">
      <section className="relative isolate flex min-h-[36rem] flex-col justify-between gap-10 overflow-hidden bg-gradient-to-br from-[#052f2b] via-[#06483d] to-[#08715e] px-6 py-8 text-menta sm:px-10 sm:py-10 lg:min-h-dvh lg:px-16 lg:py-14">
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(ellipse at 25% 20%, #24d6ae 0, transparent 44%), radial-gradient(ellipse at 80% 80%, #16a58b 0, transparent 50%)" }} />
        <div aria-hidden="true" className="absolute -left-52 top-[24%] -z-10 size-[34rem] rounded-full border border-emerald-200/10 shadow-[0_0_0_2rem_rgba(255,255,255,0.025),0_0_0_5rem_rgba(255,255,255,0.02)]" />
        <div aria-hidden="true" className="absolute -bottom-64 -right-36 -z-10 size-[36rem] rounded-full border-[2.5rem] border-emerald-200/[0.08]" />
        <BrandLogo size={190} className="drop-shadow-[0_8px_26px_rgba(0,0,0,0.18)]" />

        <div className="max-w-2xl">
          <h1 className="font-display text-5xl leading-[0.98] font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">Bienvenido<br />a <span className="text-[#54e0bd]">NovaSalud</span></h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">Un sistema diseñado para una atención más humana y eficiente.</p>

          <div className="mt-9 grid max-w-[28rem] grid-cols-3 gap-3 sm:gap-5">
            {[
              { nombre: "pacientes" as const, titulo: "Pacientes", detalle: "Gestión completa", color: "text-[#55e0bd]" },
              { nombre: "citas" as const, titulo: "Citas", detalle: "Organización fácil", color: "text-[#55e0bd]" },
              { nombre: "reportes" as const, titulo: "Reportes", detalle: "Información clara", color: "text-[#55e0bd]" },
            ].map((elemento) => (
              <div key={elemento.titulo} className="text-center">
                <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] shadow-inner shadow-white/5 sm:size-[4.5rem]"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`size-7 ${elemento.color}`}><IconoTrazos nombre={elemento.nombre} /></svg></span>
                <p className="mt-2 text-sm font-semibold text-white sm:text-base">{elemento.titulo}</p>
                <p className="mt-0.5 text-xs text-white/65 sm:text-sm">{elemento.detalle}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="flex items-start gap-3 text-sm leading-relaxed text-white/75 sm:text-base">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 size-6 shrink-0 text-[#55e0bd]"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
          <span>Atención de lunes a viernes, de 8:00 a 13:00.<br />Zona 1, Mazatenango.</span>
        </p>
      </section>

      <section className="relative isolate flex items-center justify-center overflow-hidden bg-[#f6fbf9] px-5 py-12 sm:px-10 lg:min-h-dvh lg:px-12">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_95%_8%,rgba(192,244,227,0.65),transparent_38%),radial-gradient(ellipse_at_0%_100%,rgba(218,246,234,0.65),transparent_45%)]" />
        <div aria-hidden="true" className="absolute -right-24 top-5 -z-10 size-72 opacity-[0.08]" style={{ background: "url('/clinica-nova-salud-logo-transparente.png') center / contain no-repeat", filter: "grayscale(1)" }} />
        <div className="w-full max-w-[35rem]">
          <div className="mb-4 inline-flex rounded-xl bg-emerald-100/80 px-3.5 py-2 text-sm font-bold tracking-wide text-emerald-700">INICIA SESIÓN</div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Accede a tu cuenta</h2>
          <p className="mt-2 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">Ingresa con la cuenta de tu clínica o crea una cuenta de paciente para gestionar tus citas.</p>

          <form noValidate onSubmit={manejarEnvio} className="mt-8 space-y-4.5">
            {errorGeneral && (
              <p
                role="alert"
                className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error"
              >
                {errorGeneral}
              </p>
            )}

            <label htmlFor="correo" className="flex min-h-[5.1rem] items-center gap-4 rounded-xl border border-slate-200 bg-white/90 px-3.5 py-3 shadow-[0_3px_12px_rgba(17,53,42,0.035)] transition focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/15">
              <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-800"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">Correo electrónico</span><input
                id="correo"
                type="email"
                placeholder="tu@correo.com"
                autoComplete="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                aria-invalid={Boolean(errores.correo)}
                aria-describedby={errores.correo ? "correo-error" : undefined}
                className="mt-0.5 w-full border-0 bg-transparent p-0 text-base text-slate-800 outline-none placeholder:text-slate-400 focus:border-0 focus:outline-none focus:ring-0"
              /></span>
            </label>
              {errores.correo && (
                <p id="correo-error" className="mt-1.5 text-sm text-error">
                  {errores.correo}
                </p>
              )}

            <label htmlFor="password" className="flex min-h-[5.1rem] items-center gap-4 rounded-xl border border-slate-200 bg-white/90 px-3.5 py-3 shadow-[0_3px_12px_rgba(17,53,42,0.035)] transition focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/15">
              <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-800"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 4v3"/></svg></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">Contraseña</span><input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(errores.password)}
                  aria-describedby={errores.password ? "password-error" : undefined}
                  className="mt-0.5 w-full border-0 bg-transparent p-0 pr-10 text-base text-slate-800 outline-none placeholder:text-slate-400 focus:border-0 focus:outline-none focus:ring-0"
              /></span>
                <button
                  type="button"
                  onClick={() => setMostrarPassword((valor) => !valor)}
                  aria-pressed={mostrarPassword}
                  aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-pino focus-visible:ring-2 focus-visible:ring-hoja/40 focus-visible:outline-none"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">{mostrarPassword ? <><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3 3.7M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4-.8"/></> : <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>}</svg>
                </button>
            </label>
              {errores.password && (
                <p id="password-error" className="mt-1.5 text-sm text-error">
                  {errores.password}
                </p>
              )}

            <button
              type="submit"
              disabled={enviando}
              className="flex min-h-[4.1rem] w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#075344] to-[#08735e] px-4 py-3 text-lg font-bold text-white shadow-[0_8px_22px_rgba(7,83,68,0.2)] transition hover:-translate-y-0.5 hover:from-[#06493c] hover:to-[#0c684f] hover:shadow-[0_12px_26px_rgba(7,83,68,0.26)] focus-visible:ring-2 focus-visible:ring-hoja/50 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-70"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="size-6"><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></svg>
              {enviando ? "Iniciando sesión…" : "Iniciar sesión"}
            </button>
          </form>
          <div className="my-5 flex items-center gap-3" aria-hidden="true"><span className="h-px flex-1 bg-slate-200"/><span className="grid size-8 place-items-center rounded-full bg-white text-xs font-semibold text-slate-500 shadow-sm">o</span><span className="h-px flex-1 bg-slate-200"/></div>
          <Link href="/registro" className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-emerald-600/60 bg-white/30 px-4 py-3 font-semibold text-emerald-900 transition hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-hoja/40 focus-visible:ring-offset-2 focus-visible:outline-none"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-6"><circle cx="10" cy="8" r="4"/><path d="M3 21v-2a7 7 0 0 1 12-4.9M19 16v6m-3-3h6"/></svg>Crear una cuenta de paciente</Link>
        </div>
      </section>
    </main>
  );
}

function IconoTrazos({ nombre }: { nombre: "pacientes" | "citas" | "reportes" }) {
  if (nombre === "pacientes") return <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>;
  if (nombre === "citas") return <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h3"/></>;
  return <><path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/></>;
}
