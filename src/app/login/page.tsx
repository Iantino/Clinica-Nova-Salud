"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { iniciarSesion } from "@/lib/auth";

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ErroresCampo = { correo?: string; password?: string };

// La fecha se calcula en el navegador; en el servidor queda vacía.
// Así no se congela el día en que se compiló la página.
const sinSuscripcion = () => () => {};

function useFechaDeHoy(opciones: Intl.DateTimeFormatOptions) {
  return useSyncExternalStore(
    sinSuscripcion,
    () => new Date().toLocaleDateString("es-GT", opciones),
    () => ""
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errores, setErrores] = useState<ErroresCampo>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);

  const dia = useFechaDeHoy({ weekday: "long" });
  const fecha = useFechaDeHoy({ day: "numeric", month: "long" });

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
    <main className="grid min-h-dvh lg:grid-cols-[5fr_7fr]">
      <section className="flex flex-col justify-between gap-10 bg-pino px-6 py-8 text-menta sm:px-10 lg:px-14 lg:py-14">
        <p className="font-display text-lg font-semibold text-white">Clínica NovaSalud</p>

        <div>
          <p className="min-h-[0.95em] font-display text-5xl leading-[0.95] font-bold text-white first-letter:uppercase sm:text-6xl lg:text-8xl">
            {dia}
          </p>
          <p className="mt-3 min-h-[1.5em] font-display text-2xl text-menta sm:text-3xl lg:text-4xl">
            {fecha}
          </p>
        </div>

        <p className="max-w-xs text-sm leading-relaxed text-menta/80">
          Atención de lunes a viernes, de 8:00 a 13:00.
          <br />
          Zona 1, Mazatenango.
        </p>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-bold text-pino">Inicia sesión</h1>
          <p className="mt-2 leading-relaxed text-tinta/70">
            Usa el correo y la contraseña que te asignó la administración de la clínica.
          </p>

          <form noValidate onSubmit={manejarEnvio} className="mt-8 space-y-5">
            {errorGeneral && (
              <p
                role="alert"
                className="rounded-md border border-error/30 bg-error/5 px-4 py-3 text-sm text-error"
              >
                {errorGeneral}
              </p>
            )}

            <div>
              <label htmlFor="correo" className="block text-sm font-semibold">
                Correo
              </label>
              <input
                id="correo"
                type="email"
                autoComplete="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                aria-invalid={Boolean(errores.correo)}
                aria-describedby={errores.correo ? "correo-error" : undefined}
                className="mt-1.5 w-full rounded-md border border-tinta/20 bg-white px-3.5 py-2.5 outline-none focus-visible:border-hoja focus-visible:ring-2 focus-visible:ring-hoja/30 aria-invalid:border-error"
              />
              {errores.correo && (
                <p id="correo-error" className="mt-1.5 text-sm text-error">
                  {errores.correo}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold">
                Contraseña
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(errores.password)}
                  aria-describedby={errores.password ? "password-error" : undefined}
                  className="w-full rounded-md border border-tinta/20 bg-white py-2.5 pr-20 pl-3.5 outline-none focus-visible:border-hoja focus-visible:ring-2 focus-visible:ring-hoja/30 aria-invalid:border-error"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword((valor) => !valor)}
                  aria-pressed={mostrarPassword}
                  className="absolute inset-y-1 right-1 rounded px-3 text-sm font-semibold text-hoja hover:bg-menta/60 focus-visible:ring-2 focus-visible:ring-hoja/40 focus-visible:outline-none"
                >
                  {mostrarPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {errores.password && (
                <p id="password-error" className="mt-1.5 text-sm text-error">
                  {errores.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-md bg-pino px-4 py-3 font-semibold text-white transition-colors hover:bg-hoja focus-visible:ring-2 focus-visible:ring-hoja/50 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-70"
            >
              {enviando ? "Iniciando sesión…" : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
