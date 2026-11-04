"use client";

import { useState } from "react";
import Link from "next/link";
import SoloRoles from "@/components/SoloRoles";
import Aviso from "@/components/ui/Aviso";
import Paginacion from "@/components/ui/Paginacion";
import { estiloControl } from "@/components/ui/Campo";
import Icono from "@/components/Icono";
import { useDebounce } from "@/lib/useDebounce";
import { useConsulta } from "@/lib/useConsulta";
import { useSesion } from "@/lib/sesion";
import { listarPacientes, MINIMO_BUSQUEDA } from "@/lib/pacientes";

function Pacientes() {
  const { usuario } = useSesion();
  const [texto, setTexto] = useState("");
  const [pagina, setPagina] = useState(1);

  const termino = useDebounce(texto.trim());
  const buscar = termino.length >= MINIMO_BUSQUEDA ? termino : "";
  const filtros = { buscar, pagina };
  const { datos, error, cargando } = useConsulta(JSON.stringify(filtros), () => listarPacientes(filtros));

  const puedeRegistrar = usuario.rol !== "medico";
  const faltanLetras = texto.trim().length > 0 && texto.trim().length < MINIMO_BUSQUEDA;
  const tonosAvatar = [
    "bg-emerald-100 text-emerald-700",
    "bg-violet-100 text-violet-700",
    "bg-sky-100 text-sky-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
  ];

  return (
    <div className="mx-auto w-full max-w-[88rem]">
      <header className="flex flex-wrap items-start justify-between gap-4 sm:items-end sm:gap-5">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-hoja uppercase">Atención clínica · directorio</p>
          <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-pino sm:text-5xl">Pacientes</h1>
          <p className="mt-1.5 text-base text-tinta/65">
            {datos ? `${datos.paginacion.total} ${buscar ? "coinciden con la búsqueda" : "registrados"}` : " "}
          </p>
        </div>
        {puedeRegistrar && (
          <Link
            href="/pacientes/nuevo"
            className="group inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#075344] to-[#11765d] px-5 py-3 font-semibold text-white shadow-[0_9px_22px_rgba(7,83,68,0.2)] transition duration-200 hover:-translate-y-0.5 hover:from-[#06493c] hover:to-[#0c684f] hover:shadow-[0_13px_28px_rgba(7,83,68,0.28)] focus-visible:ring-2 focus-visible:ring-hoja/50 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
          >
            <span className="grid size-7 place-items-center rounded-lg bg-white/15">
              <Icono nombre="pacientes" className="size-5" />
            </span>
            Registrar paciente
          </Link>
        )}
      </header>

      <div className="mt-7">
        <label htmlFor="buscar-paciente" className="mb-2 block text-sm font-bold text-tinta sm:text-base">
          Buscar por nombre, DPI o teléfono
        </label>
        <div className="relative">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute top-1/2 left-4 size-6 -translate-y-1/2 text-hoja/75">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4.5 4.5" />
          </svg>
          <input
            id="buscar-paciente"
            type="search"
            value={texto}
            onChange={(e) => { setTexto(e.target.value); setPagina(1); }}
            aria-describedby="buscar-ayuda"
            placeholder="Buscar por nombre, DPI o teléfono…"
            className={`${estiloControl} h-[3.65rem] rounded-xl border-hoja/25 bg-white/90 pl-12 text-base shadow-[0_4px_14px_rgba(18,55,42,0.045)] placeholder:text-tinta/40 focus:border-hoja focus-visible:ring-4 focus-visible:ring-hoja/10`}
          />
        </div>
        <p id="buscar-ayuda" className="mt-1.5 min-h-5 text-sm text-tinta/60">
          {faltanLetras ? `Escribe al menos ${MINIMO_BUSQUEDA} caracteres para buscar.` : " "}
        </p>
      </div>

      {error && <div className="mb-3"><Aviso>{error}</Aviso></div>}

      <div className="mt-2 overflow-hidden rounded-2xl border border-white/90 bg-white/90 p-2 shadow-[0_8px_26px_rgba(18,55,42,0.075)] ring-1 ring-pino/[0.035] backdrop-blur-sm sm:p-2.5" aria-busy={cargando}>
        <div className="space-y-3 p-1 sm:hidden">
          {datos?.datos.map((paciente, indice) => (
            <article key={paciente.id} className="rounded-xl border border-tinta/10 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className={`grid size-11 shrink-0 place-items-center rounded-full text-sm font-bold ${tonosAvatar[indice % tonosAvatar.length]}`}>
                  {`${paciente.nombre[0] ?? ""}${paciente.apellido[0] ?? ""}`.toLocaleUpperCase("es-GT")}
                </span>
                <div className="min-w-0 flex-1">
                  <Link href={`/pacientes/${paciente.id}`} className="block truncate font-semibold text-pino underline-offset-4 hover:text-hoja hover:underline focus-visible:ring-2 focus-visible:ring-hoja/40 focus-visible:outline-none">
                    {paciente.apellido}, {paciente.nombre}
                  </Link>
                  <p className="mt-0.5 break-all text-sm text-tinta/60">DPI: {paciente.dpi ?? "Sin DPI"}</p>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-tinta/10 pt-3">
                <div>
                  <dt className="text-[0.68rem] font-bold tracking-[0.08em] text-tinta/55 uppercase">Teléfono</dt>
                  <dd className="mt-0.5 font-medium tabular-nums text-tinta">{paciente.telefono}</dd>
                </div>
                <div>
                  <dt className="text-[0.68rem] font-bold tracking-[0.08em] text-tinta/55 uppercase">Edad</dt>
                  <dd className="mt-0.5 font-medium tabular-nums text-tinta">{paciente.edad} años</dd>
                </div>
              </dl>
              <div className="mt-3 flex justify-end gap-2 border-t border-tinta/10 pt-3">
                <Link href={`/pacientes/${paciente.id}`} aria-label={`Ver ficha de ${paciente.nombre} ${paciente.apellido}`} title="Ver ficha" className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-emerald-600/30 focus-visible:outline-none"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.7"/></svg></Link>
                {puedeRegistrar && <Link href={`/pacientes/${paciente.id}`} aria-label={`Editar ficha de ${paciente.nombre} ${paciente.apellido}`} title="Editar ficha" className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-700 transition hover:bg-sky-100 focus-visible:ring-2 focus-visible:ring-sky-600/30 focus-visible:outline-none"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="m15 5 4 4M4 20l4.5-1 10.8-10.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z"/></svg></Link>}
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-xl sm:block">
          <table className="w-full min-w-[880px] text-left">
            <thead className="border-b border-tinta/10 bg-[#f2f8f5] text-xs tracking-[0.07em] text-tinta/65 uppercase">
              <tr>
                <th scope="col" className="px-5 py-3.5 font-bold">Paciente</th>
                <th scope="col" className="px-5 py-3.5 font-bold">DPI</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Teléfono</th>
                <th scope="col" className="px-5 py-3.5 text-center font-bold">Edad</th>
                <th scope="col" className="px-5 py-3.5 text-center font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-tinta/10 ${cargando ? "opacity-60" : ""}`}>
              {datos?.datos.map((paciente, indice) => (
                <tr key={paciente.id} className="group transition-colors hover:bg-[#f7fbf9]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span aria-hidden="true" className={`grid size-12 shrink-0 place-items-center rounded-full text-sm font-bold ${tonosAvatar[indice % tonosAvatar.length]}`}>{`${paciente.nombre[0] ?? ""}${paciente.apellido[0] ?? ""}`.toLocaleUpperCase("es-GT")}</span>
                      <Link href={`/pacientes/${paciente.id}`} className="font-semibold text-pino underline-offset-4 group-hover:text-hoja group-hover:underline focus-visible:ring-2 focus-visible:ring-hoja/40 focus-visible:outline-none">
                        {paciente.apellido}, {paciente.nombre}
                      </Link>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 tabular-nums">
                    {paciente.dpi ?? <span className="text-tinta/50">Sin DPI</span>}
                  </td>
                  <td className="px-5 py-3.5 tabular-nums">{paciente.telefono}</td>
                  <td className="px-5 py-3.5 text-center font-medium tabular-nums">{paciente.edad}</td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/pacientes/${paciente.id}`} aria-label={`Ver ficha de ${paciente.nombre} ${paciente.apellido}`} title="Ver ficha" className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-emerald-600/30 focus-visible:outline-none"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.7"/></svg></Link>
                      {puedeRegistrar && <Link href={`/pacientes/${paciente.id}`} aria-label={`Editar ficha de ${paciente.nombre} ${paciente.apellido}`} title="Editar ficha" className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-700 transition hover:bg-sky-100 focus-visible:ring-2 focus-visible:ring-sky-600/30 focus-visible:outline-none"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="m15 5 4 4M4 20l4.5-1 10.8-10.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z"/></svg></Link>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {datos && datos.datos.length === 0 && (
          <div className="px-4 py-10 text-center">
            <p className="font-semibold text-pino">
              {buscar ? `Ningún paciente coincide con “${buscar}”.` : "Todavía no hay pacientes registrados."}
            </p>
            {puedeRegistrar && (
              <Link href="/pacientes/nuevo" className="mt-2 inline-block font-semibold text-hoja underline underline-offset-4">
                Registrar paciente
              </Link>
            )}
          </div>
        )}
        {!datos && cargando && <p className="px-4 py-8 text-center text-tinta/70">Cargando pacientes…</p>}
      </div>

      {datos && <Paginacion paginacion={datos.paginacion} alCambiar={setPagina} />}
    </div>
  );
}

export default function PacientesPage() {
  return <SoloRoles roles={["administrador", "recepcionista", "medico"]}><Pacientes /></SoloRoles>;
}
