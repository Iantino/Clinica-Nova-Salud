"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import PortalAuthShell from "@/components/PortalAuthShell";
import { ApiError } from "@/lib/api";
import { restablecerContrasena } from "@/lib/auth";

export default function RestablecerContrasenaPage() {
  const [token, setToken] = useState("");
  const [tokenListo, setTokenListo] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState("");
  const [guardada, setGuardada] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
    setTokenListo(true);
  }, []);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError("");
    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setGuardando(true);
    try {
      await restablecerContrasena(token, password);
      setGuardada(true);
      setPassword("");
      setConfirmacion("");
    } catch (errorPeticion) {
      setError(errorPeticion instanceof ApiError ? errorPeticion.message : "No se pudo cambiar la contraseña. Solicita otro enlace e inténtalo de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <PortalAuthShell
      titulo="Crea una contraseña nueva"
      descripcion="Elige una contraseña segura para volver a acceder a tu cuenta."
    >
      {!tokenListo ? (
        <p className="mt-7 text-center text-sm text-slate-500" role="status">Validando el enlace…</p>
      ) : guardada ? (
        <div className="mt-7 space-y-5" role="status" aria-live="polite">
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">Tu contraseña se cambió correctamente. Ya puedes iniciar sesión.</p>
          <Link href="/login" className="flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#075344] to-[#08735e] px-4 py-3 font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hoja/50 focus-visible:ring-offset-2">
            Ir a iniciar sesión
          </Link>
        </div>
      ) : !token ? (
        <div className="mt-7 space-y-5">
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">Este enlace no es válido. Solicita uno nuevo para continuar.</p>
          <Link href="/recuperar-contrasena" className="flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#075344] to-[#08735e] px-4 py-3 font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hoja/50 focus-visible:ring-offset-2">
            Solicitar otro enlace
          </Link>
        </div>
      ) : (
        <form onSubmit={manejarEnvio} className="mt-7 space-y-5">
          {error && <p role="alert" className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{error}</p>}
          <div>
            <label htmlFor="nueva-password" className="block text-sm font-semibold text-slate-800">Nueva contraseña</label>
            <input
              id="nueva-password"
              type="password"
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              value={password}
              onChange={(evento) => setPassword(evento.target.value)}
              placeholder="Crea una contraseña"
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            />
            <p className="mt-1.5 text-xs text-slate-500">Al menos 8 caracteres, una letra y un número.</p>
          </div>
          <div>
            <label htmlFor="confirmar-password" className="block text-sm font-semibold text-slate-800">Confirmar contraseña</label>
            <input
              id="confirmar-password"
              type="password"
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              value={confirmacion}
              onChange={(evento) => setConfirmacion(evento.target.value)}
              placeholder="Escribe la contraseña otra vez"
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            />
          </div>
          <button type="submit" disabled={guardando || !password || !confirmacion} className="flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#075344] to-[#08735e] px-4 py-3 font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hoja/50 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70">
            {guardando ? "Guardando…" : "Guardar contraseña nueva"}
          </button>
        </form>
      )}
    </PortalAuthShell>
  );
}
