"use client";

import Link from "next/link";
import { useState, type InputHTMLAttributes, type ReactNode, type FormEvent } from "react";
import Aviso from "@/components/ui/Aviso";
import Boton from "@/components/ui/Boton";
import { ApiError } from "@/lib/api";
import { edadDesde, PACIENTE_VACIO, type DatosPaciente } from "@/lib/pacientes";
import { registrarPaciente } from "@/lib/portal";

type IconoRegistro = "persona" | "calendario" | "sexo" | "dpi" | "telefono" | "correo" | "candado" | "direccion";

function Trazos({ nombre }: { nombre: IconoRegistro }) {
  switch (nombre) {
    case "persona": return <><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></>;
    case "calendario": return <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h3"/></>;
    case "sexo": return <><circle cx="10" cy="14" r="6"/><path d="m14.5 9.5 6-6m-5 0h5v5M10 20v3m-3-3h6"/></>;
    case "dpi": return <><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5.5 16a3 3 0 0 1 5 0M14 10h4m-4 4h4"/></>;
    case "telefono": return <><path d="M7 3H5a2 2 0 0 0-2 2c0 8.8 7.2 16 16 16a2 2 0 0 0 2-2v-2l-5-2-2 3a14 14 0 0 1-7-7l3-2-3-5Z"/></>;
    case "correo": return <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>;
    case "candado": return <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 4v3"/></>;
    case "direccion": return <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>;
  }
}

function Icono({ nombre, className = "size-5" }: { nombre: IconoRegistro; className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><Trazos nombre={nombre} /></svg>;
}

function CampoIcono({ id, etiqueta, icono, ayuda, suffix, className, ...props }: {
  id: string;
  etiqueta: string;
  icono: IconoRegistro;
  ayuda?: string;
  suffix?: ReactNode;
  } & Omit<InputHTMLAttributes<HTMLInputElement>, "id">) {
  return <div className={`min-w-0 ${className ?? ""}`}>
    <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-800">{etiqueta}</label>
    <span className="flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-1.5 transition focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/15">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Icono nombre={icono} className="size-[1.1rem]" /></span>
      <input id={id} {...props} className="control-icono h-full min-w-0 flex-1 border-0 bg-transparent px-1 text-sm text-slate-800 outline-none placeholder:text-slate-400" />
      {suffix}
    </span>
    {ayuda && <p className="mt-1 text-xs text-slate-500">{ayuda}</p>}
  </div>;
}

function BotonMostrar({ visible, alternar, etiqueta }: { visible: boolean; alternar: () => void; etiqueta: string }) {
  return <button type="button" aria-label={visible ? `Ocultar ${etiqueta}` : `Mostrar ${etiqueta}`} aria-pressed={visible} onClick={alternar} className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-pino focus-visible:ring-2 focus-visible:ring-hoja/40 focus-visible:outline-none">
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">{visible ? <><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3 3.7M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4-.8"/></> : <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>}</svg>
  </button>;
}

function EncabezadoSeccion({ icono, titulo, descripcion }: { icono: "persona" | "telefono"; titulo: string; descripcion: string }) {
  return <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-3">
    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100/70 text-emerald-700"><Icono nombre={icono} className="size-5" /></span>
    <div><h2 className="font-display text-lg font-bold text-slate-900">{titulo}</h2><p className="text-xs text-slate-500">{descripcion}</p></div>
  </div>;
}

export default function RegistroPacientePage() {
  const [datos, setDatos] = useState<DatosPaciente>(PACIENTE_VACIO);
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [error, setError] = useState("");
  const [registrado, setRegistrado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const edad = edadDesde(datos.fecha_nacimiento);
  const esMenor = edad !== null && edad < 18;
  const cambiar = (campo: keyof DatosPaciente, valor: string) => setDatos((actual) => ({ ...actual, [campo]: valor }));

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault(); setError("");
    if (password !== confirmar) { setError("Las contraseñas no coinciden."); return; }
    setEnviando(true);
    try {
      await registrarPaciente({ ...datos, correo: datos.correo.trim().toLowerCase(), password });
      setRegistrado(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "No se pudo crear la cuenta.");
    } finally { setEnviando(false); }
  }

  return <main className="relative isolate min-h-dvh overflow-hidden bg-[#f3faf7] px-4 py-6 sm:px-7 sm:py-9">
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_95%_5%,rgba(192,244,227,0.65),transparent_38%),radial-gradient(ellipse_at_0%_100%,rgba(218,246,234,0.7),transparent_45%)]" />
    <div aria-hidden="true" className="absolute -right-20 top-0 -z-10 size-80 opacity-[0.075]" style={{ background: "url('/clinica-nova-salud-logo-transparente.png') center / contain no-repeat", filter: "grayscale(1)" }} />
    <div className="mx-auto max-w-[56rem]">
      <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"><span aria-hidden="true">←</span> Volver al inicio de sesión</Link>
      <header className="mb-5 mt-4">
        <p className="text-xs font-bold tracking-[0.16em] text-emerald-700 uppercase">Portal NovaSalud</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Crea tu cuenta de paciente</h1>
        <p className="mt-1.5 text-sm text-slate-600 sm:text-base">Usa tus datos para consultar y gestionar tus citas.</p>
      </header>
      {error && <div className="mb-4"><Aviso>{error}</Aviso></div>}
      {registrado ? <div className="space-y-5 rounded-2xl border border-white/90 bg-white/90 p-6 shadow-[0_10px_30px_rgba(18,55,42,0.08)] backdrop-blur-sm"><Aviso tono="exito">Tu cuenta quedó creada. Ya puedes iniciar sesión y solicitar una cita.</Aviso><Link href="/login" className="inline-flex rounded-xl bg-gradient-to-r from-[#075344] to-[#11765d] px-4 py-2.5 font-semibold text-white shadow-sm hover:from-[#06493c] hover:to-[#0c684f]">Ir a iniciar sesión</Link></div> : <form onSubmit={enviar} className="space-y-5 rounded-2xl border border-white/90 bg-white/90 p-4 shadow-[0_10px_32px_rgba(18,55,42,0.08)] ring-1 ring-emerald-900/[0.035] backdrop-blur-sm sm:p-6">
        <section>
          <EncabezadoSeccion icono="persona" titulo="Datos personales" descripcion="Ingresa tu información básica." />
          <div className="grid gap-x-5 gap-y-3.5 sm:grid-cols-2">
            <CampoIcono id="registro-nombre" etiqueta="Nombre" icono="persona" required minLength={2} maxLength={80} autoComplete="given-name" placeholder="Tu nombre" value={datos.nombre} onChange={e => cambiar("nombre", e.target.value)} />
            <CampoIcono id="registro-apellido" etiqueta="Apellido" icono="persona" required minLength={2} maxLength={80} autoComplete="family-name" placeholder="Tu apellido" value={datos.apellido} onChange={e => cambiar("apellido", e.target.value)} />
            <CampoIcono id="registro-nacimiento" etiqueta="Fecha de nacimiento" icono="calendario" type="date" required max={new Date().toISOString().slice(0, 10)} value={datos.fecha_nacimiento} onChange={e => cambiar("fecha_nacimiento", e.target.value)} ayuda={edad !== null ? `${edad} ${edad === 1 ? "año" : "años"}` : undefined} />
            <div><label htmlFor="registro-sexo" className="mb-1.5 block text-sm font-semibold text-slate-800">Sexo</label><span className="flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-1.5 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/15"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Icono nombre="sexo" className="size-[1.1rem]" /></span><select id="registro-sexo" required value={datos.sexo} onChange={e => cambiar("sexo", e.target.value)} className="control-icono h-full min-w-0 flex-1 border-0 bg-transparent px-1 text-sm text-slate-800 outline-none"><option value="">Elige una opción</option><option value="F">Femenino</option><option value="M">Masculino</option></select></span></div>
            <CampoIcono id="registro-dpi" etiqueta={esMenor ? "DPI (opcional)" : "DPI"} icono="dpi" required={!esMenor} inputMode="numeric" minLength={13} maxLength={13} pattern="[0-9]{13}" placeholder="Tu DPI" value={datos.dpi} onChange={e => cambiar("dpi", e.target.value)} ayuda="13 dígitos, sin espacios ni guiones." />
            <CampoIcono id="registro-encargado" etiqueta={esMenor ? "Nombre del encargado" : "Nombre del encargado (opcional)"} icono="persona" required={esMenor} maxLength={160} placeholder="Nombre del encargado" value={datos.nombre_encargado} onChange={e => cambiar("nombre_encargado", e.target.value)} />
          </div>
        </section>

        <section className="border-t border-slate-200 pt-4">
          <EncabezadoSeccion icono="telefono" titulo="Contacto y acceso" descripcion="Datos para tu cuenta y comunicación." />
          <div className="grid gap-x-5 gap-y-3.5 sm:grid-cols-2">
            <CampoIcono id="registro-telefono" etiqueta="Teléfono" icono="telefono" type="tel" required inputMode="numeric" minLength={8} maxLength={8} pattern="[0-9]{8}" autoComplete="tel" placeholder="Tu número de teléfono" value={datos.telefono} onChange={e => cambiar("telefono", e.target.value)} ayuda="8 dígitos." />
            <CampoIcono id="registro-correo" etiqueta="Correo electrónico" icono="correo" type="email" required autoComplete="email" placeholder="tu@correo.com" value={datos.correo} onChange={e => cambiar("correo", e.target.value)} />
            <CampoIcono id="registro-password" etiqueta="Contraseña" icono="candado" type={mostrarPassword ? "text" : "password"} required minLength={8} maxLength={72} autoComplete="new-password" placeholder="Crea una contraseña" value={password} onChange={e => setPassword(e.target.value)} ayuda="Al menos 8 caracteres, una letra y un número." suffix={<BotonMostrar visible={mostrarPassword} alternar={() => setMostrarPassword(v => !v)} etiqueta="contraseña" />} />
            <CampoIcono id="registro-confirmar" etiqueta="Confirmar contraseña" icono="candado" type={mostrarConfirmar ? "text" : "password"} required minLength={8} autoComplete="new-password" placeholder="Confirma tu contraseña" value={confirmar} onChange={e => setConfirmar(e.target.value)} suffix={<BotonMostrar visible={mostrarConfirmar} alternar={() => setMostrarConfirmar(v => !v)} etiqueta="contraseña" />} />
            <CampoIcono id="registro-direccion" etiqueta="Dirección (opcional)" icono="direccion" maxLength={255} autoComplete="street-address" placeholder="Tu dirección" value={datos.direccion} onChange={e => cambiar("direccion", e.target.value)} className="sm:col-span-2" />
          </div>
        </section>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-600">¿Ya tienes cuenta? <Link href="/login" className="font-semibold text-emerald-800 hover:underline">Inicia sesión</Link></p>
          <Boton type="submit" disabled={enviando} className="rounded-xl bg-gradient-to-r from-[#075344] to-[#11765d] px-5 py-3 text-white shadow-[0_7px_18px_rgba(7,83,68,0.18)] hover:from-[#06493c] hover:to-[#0c684f]">{enviando ? "Creando cuenta…" : <><Icono nombre="persona" className="mr-2 inline size-5" />Crear cuenta</>}</Boton>
        </div>
      </form>}
    </div>
  </main>;
}
