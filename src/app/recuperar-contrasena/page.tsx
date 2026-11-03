"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import PortalAuthShell from "@/components/PortalAuthShell";
import { ApiError } from "@/lib/api";
import { solicitarRestablecimiento } from "@/lib/auth";

export default function RecuperarContrasenaPage() {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await solicitarRestablecimiento(correo.trim());
      setEnviado(true);
    } catch (errorPeticion) {
      setError(errorPeticion instanceof ApiError ? errorPeticion.message : "No se pudo enviar la solicitud. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <PortalAuthShell
      titulo="Recupera tu cuenta"
      descripcion="Escribe el correo asociado a tu cuenta y te enviaremos las instrucciones para crear una contraseña nueva."
    >
      {enviado ? (
        <div className="mt-7 space-y-5" role="status" aria-live="polite">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-relaxed text-emerald-900">
            Si el correo corresponde a una cuenta activa, enviaremos un enlace para cambiar la contraseña. Revisa también la carpeta de correo no deseado.
          </div>
          <Link href="/login" className="flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#075344] to-[#08735e] px-4 py-3 font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hoja/50 focus-visible:ring-offset-2">
            Volver a iniciar sesión
          </Link>
        </div>
      ) : (
        <form onSubmit={manejarEnvio} className="mt-7 space-y-5">
          {error && <p role="alert" className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{error}</p>}
          <div>
            <label htmlFor="correo-recuperacion" className="block text-sm font-semibold text-slate-800">Correo electrónico</label>
            <input
              id="correo-recuperacion"
              type="email"
              required
              maxLength={120}
              autoComplete="email"
              autoFocus
              value={correo}
              onChange={(evento) => setCorreo(evento.target.value)}
              placeholder="tu@correo.com"
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            />
          </div>
          <button type="submit" disabled={enviando} className="flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#075344] to-[#08735e] px-4 py-3 font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hoja/50 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70">
            {enviando ? "Enviando solicitud…" : "Enviar enlace de recuperación"}
          </button>
        </form>
      )}
    </PortalAuthShell>
  );
}
