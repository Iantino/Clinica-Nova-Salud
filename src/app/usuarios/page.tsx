"use client";

import { useEffect, useRef, useState } from "react";
import SoloRoles from "@/components/SoloRoles";
import Boton from "@/components/ui/Boton";
import Aviso from "@/components/ui/Aviso";
import Paginacion from "@/components/ui/Paginacion";
import Icono from "@/components/Icono";
import { estiloControl } from "@/components/ui/Campo";
import { useDebounce } from "@/lib/useDebounce";
import { useConsulta } from "@/lib/useConsulta";
import { useSesion } from "@/lib/sesion";
import { NOMBRE_ROL } from "@/lib/navegacion";
import { cambiarEstadoUsuario, listarUsuarios, type UsuarioGestion } from "@/lib/usuarios";
import FormularioUsuario from "./FormularioUsuario";

type Edicion = { usuario: UsuarioGestion | null } | null;

function Estado({ usuario }: { usuario: UsuarioGestion }) {
  if (!usuario.activo)
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-tinta/5 px-3 py-1.5 text-xs font-semibold text-tinta/60"><span className="size-1.5 rounded-full bg-tinta/40" />Inactivo</span>;
  if (usuario.bloqueado)
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-error/10 px-3 py-1.5 text-xs font-semibold text-error"><span className="size-1.5 rounded-full bg-error" />Bloqueado</span>;
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"><span className="size-1.5 rounded-full bg-emerald-600" />Activo</span>;
}

function TonoRol({ rol }: { rol: UsuarioGestion["rol"] }) {
  const tono = {
    administrador: "bg-violet-100/80 text-violet-900",
    recepcionista: "bg-orange-100/80 text-orange-900",
    medico: "bg-emerald-100/80 text-emerald-900",
    paciente: "bg-sky-100/80 text-sky-900",
  }[rol];
  return <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${tono}`}>{NOMBRE_ROL[rol]}</span>;
}

function Iniciales({ usuario }: { usuario: UsuarioGestion }) {
  const tono = {
    administrador: "bg-[#d6eee4] text-pino",
    recepcionista: "bg-[#dceefa] text-[#20506a]",
    medico: "bg-[#e6e4fa] text-[#4e4a83]",
    paciente: "bg-[#f7e9d5] text-[#755127]",
  }[usuario.rol];

  return (
    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${tono}`} aria-hidden="true">
      {`${usuario.nombre[0] ?? ""}${usuario.apellido[0] ?? ""}`.toLocaleUpperCase("es-GT")}
    </span>
  );
}

function Usuarios() {
  const { usuario: yo } = useSesion();
  const [texto, setTexto] = useState("");
  const [rol, setRol] = useState("");
  const [pagina, setPagina] = useState(1);
  const [edicion, setEdicion] = useState<Edicion>(null);
  const [mensaje, setMensaje] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const dialogo = useRef<HTMLDialogElement>(null);

  const buscar = useDebounce(texto.trim());
  const filtros = { buscar, rol, pagina };
  const { datos, error, cargando, recargar } = useConsulta(JSON.stringify(filtros), () =>
    listarUsuarios(filtros)
  );
  const usuariosPagina = datos?.datos ?? [];
  const activosPagina = usuariosPagina.filter((u) => u.activo).length;
  const medicosPagina = usuariosPagina.filter((u) => u.rol === "medico").length;

  // Abre o cierra el diálogo según haya un usuario en edición
  useEffect(() => {
    if (edicion) dialogo.current?.showModal();
    else dialogo.current?.close();
  }, [edicion]);

  function filtrar(cambio: () => void) {
    cambio();
    setPagina(1);
  }

  async function alternarEstado(u: UsuarioGestion) {
    const accion = u.activo ? "desactivar" : "activar";
    if (!window.confirm(`¿Quieres ${accion} a ${u.nombre} ${u.apellido}?`)) return;
    setErrorAccion("");
    try {
      await cambiarEstadoUsuario(u.id, !u.activo);
      setMensaje(`${u.nombre} ${u.apellido} quedó ${u.activo ? "inactivo" : "activo"}.`);
      recargar();
    } catch (e) {
      setErrorAccion(e instanceof Error ? e.message : "No se pudo cambiar el estado.");
    }
  }

  // Botones de cada fila; se muestran junto al nombre en celulares y en su columna en pantallas grandes
  function acciones(u: UsuarioGestion) {
    return (
      <div className="flex items-center gap-2">
        <Boton aria-label={`Editar a ${u.nombre} ${u.apellido}`} title="Editar usuario" variante="texto" className="grid size-9 place-items-center rounded-xl bg-sky-50 p-0 text-sky-700 hover:bg-sky-100" onClick={() => setEdicion({ usuario: u })}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4.5"><path d="m15 5 4 4M4 20l4.5-1 10.8-10.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z" /></svg>
        </Boton>
        {u.id !== yo.id && (
          <Boton aria-label={`${u.activo ? "Desactivar" : "Activar"} a ${u.nombre} ${u.apellido}`} title={u.activo ? "Desactivar usuario" : "Activar usuario"} variante="texto" className="grid size-9 place-items-center rounded-xl bg-amber-50 p-0 text-amber-700 hover:bg-amber-100" onClick={() => alternarEstado(u)}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4.5">{u.activo ? <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/><path d="m4 4 16 16"/></> : <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/></>}</svg>
          </Boton>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[88rem] space-y-5 sm:space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-hoja uppercase">Administración · Equipo</p>
            <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-pino sm:text-5xl">Usuarios</h1>
            <p className="mt-1.5 max-w-xl text-base text-tinta/65">
              Administra las cuentas y permisos del personal de NovaSalud.
            </p>
          </div>
          <Boton className="rounded-xl bg-gradient-to-r from-[#075344] to-[#11765d] px-5 py-3 text-white shadow-[0_9px_22px_rgba(7,83,68,0.2)] hover:-translate-y-0.5 hover:from-[#06493c] hover:to-[#0c684f] hover:shadow-[0_13px_28px_rgba(7,83,68,0.28)]" onClick={() => setEdicion({ usuario: null })}>
            <span className="mr-2 inline-grid size-6 place-items-center rounded-full border border-white/70"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="M12 5v14M5 12h14" /></svg></span>Nuevo usuario
          </Boton>
      </header>

      <section aria-label="Resumen de usuarios" className="grid gap-3 sm:grid-cols-3">
        <article className="relative isolate overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50 px-5 py-4 shadow-[0_5px_18px_rgba(18,55,42,0.06)] sm:px-5 sm:py-4">
          <div className="flex items-center gap-4"><span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-emerald-100/80 text-emerald-700"><Icono nombre="usuarios" className="size-7" /></span><div><p className="text-sm font-medium text-tinta/65">Registros encontrados</p><p className="mt-0.5 font-display text-3xl font-bold leading-none text-pino">{datos?.paginacion.total ?? "—"}</p><p className="mt-1 text-xs text-tinta/55">Con los filtros actuales</p></div></div>
        </article>
        <article className="relative isolate overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-white to-sky-50 px-5 py-4 shadow-[0_5px_18px_rgba(18,55,42,0.06)]">
          <div className="flex items-center gap-4"><span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-600"><Icono nombre="pacientes" className="size-7" /></span><div><p className="text-sm font-medium text-tinta/65">Activos en esta página</p><p className="mt-0.5 font-display text-3xl font-bold leading-none text-pino">{datos ? activosPagina : "—"}</p><p className="mt-1 text-xs text-tinta/55">Cuentas habilitadas</p></div></div>
        </article>
        <article className="relative isolate overflow-hidden rounded-2xl border border-fuchsia-100 bg-gradient-to-br from-white via-white to-rose-50 px-5 py-4 shadow-[0_5px_18px_rgba(18,55,42,0.06)]">
          <div className="flex items-center gap-4"><span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700"><Icono nombre="medicos" className="size-7" /></span><div><p className="text-sm font-medium text-tinta/65">Personal médico en esta página</p><p className="mt-0.5 font-display text-3xl font-bold leading-none text-pino">{datos ? medicosPagina : "—"}</p><p className="mt-1 text-xs text-tinta/55">Cuentas con rol médico</p></div></div>
        </article>
      </section>

      <section aria-label="Filtros de usuarios" className="grid gap-3 rounded-2xl border border-white/90 bg-white/85 p-3.5 shadow-[0_6px_20px_rgba(18,55,42,0.065)] ring-1 ring-pino/[0.035] backdrop-blur-sm sm:grid-cols-[1fr_14rem] sm:p-4">
        <div className="relative">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-hoja"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
          <label htmlFor="buscar-usuario" className="sr-only">
            Buscar por nombre o correo
          </label>
          <input
            id="buscar-usuario"
            type="search"
            placeholder="Buscar por nombre o correo"
            value={texto}
            onChange={(e) => filtrar(() => setTexto(e.target.value))}
            className={`${estiloControl} mt-0 rounded-xl border-[#d2e5dd] pl-11 focus:border-hoja`}
          />
        </div>
        <div>
          <label htmlFor="filtro-rol" className="sr-only">
            Filtrar por rol
          </label>
          <div className="relative"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-hoja"><path d="M4 5h16l-6.5 7.5v5L10 19v-6.5L4 5Z"/></svg><select
            id="filtro-rol"
            value={rol}
            onChange={(e) => filtrar(() => setRol(e.target.value))}
            className={`${estiloControl} mt-0 rounded-xl border-[#d2e5dd] pl-10`}
          >
            <option value="">Todos los roles</option>
            <option value="administrador">Administración</option>
            <option value="recepcionista">Recepción</option>
            <option value="medico">Médicos</option>
            <option value="paciente">Pacientes</option>
          </select>
          </div>
        </div>
      </section>

      <div className="mt-4 space-y-3">
        {mensaje && <Aviso tono="exito">{mensaje}</Aviso>}
        {(error || errorAccion) && <Aviso>{error || errorAccion}</Aviso>}
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/90 bg-white/85 p-2.5 shadow-[0_8px_26px_rgba(18,55,42,0.075)] ring-1 ring-pino/[0.035] backdrop-blur-sm sm:p-3.5" aria-label="Lista de usuarios" aria-busy={cargando}>
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-2.5 sm:px-3">
          <div className="flex items-center gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Icono nombre="usuarios" className="size-6" /></span><div>
            <h2 className="font-display text-xl font-bold text-pino">Personal de la clínica</h2>
            <p className="mt-0.5 text-sm text-tinta/55">Roles, estado de acceso y administración de cuentas</p>
          </div></div>
          {datos && <span className="rounded-full bg-emerald-100/70 px-3.5 py-1.5 text-xs font-bold text-emerald-800">{datos.paginacion.total} {datos.paginacion.total === 1 ? "cuenta" : "cuentas"}</span>}
        </div>
        <div className="overflow-x-auto rounded-xl">
        <table className="w-full min-w-[700px] text-left">
          <thead className="bg-[#f2f8f5] text-[0.68rem] tracking-[0.08em] text-tinta/60 uppercase">
            <tr>
              <th scope="col" className="px-5 py-3 font-bold sm:px-6">Nombre</th>
              <th scope="col" className="hidden px-4 py-3 font-bold md:table-cell">Rol</th>
              <th scope="col" className="hidden px-4 py-3 font-bold sm:table-cell">Estado</th>
              <th scope="col" className="hidden px-5 py-3 text-center font-bold sm:table-cell">Acciones</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-tinta/10 ${cargando ? "opacity-60" : ""}`}>
            {datos?.datos.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-[#f7fbf9]">
                <td className="px-5 py-2.5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <Iniciales usuario={u} />
                    <div className="min-w-0">
                      <p className="font-semibold text-pino">
                        {u.nombre} {u.apellido}
                        {u.id === yo.id && <span className="ml-1 font-normal text-tinta/50">(tú)</span>}
                      </p>
                      <p className="mt-0.5 break-all text-sm text-tinta/60">{u.correo}</p>
                      <p className="mt-1 md:hidden"><TonoRol rol={u.rol} /></p>
                      <p className="mt-1 sm:hidden"><Estado usuario={u} /></p>
                      <div className="mt-1 -ml-2 sm:hidden">{acciones(u)}</div>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-2.5 md:table-cell">
                  <TonoRol rol={u.rol} />
                </td>
                <td className="hidden px-4 py-2.5 sm:table-cell">
                  <Estado usuario={u} />
                </td>
                <td className="hidden px-5 py-2.5 sm:table-cell">
                  {acciones(u)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {datos && datos.datos.length === 0 && (
          <p className="px-4 py-8 text-center text-tinta/70">
            Ningún usuario coincide con la búsqueda.
          </p>
        )}
        {!datos && cargando && <p className="px-4 py-8 text-center text-tinta/70">Cargando usuarios…</p>}
      </div>
      </section>

      {datos && <Paginacion paginacion={datos.paginacion} alCambiar={setPagina} />}

      <dialog
        ref={dialogo}
        onClose={() => setEdicion(null)}
        aria-label={edicion?.usuario ? "Editar usuario" : "Nuevo usuario"}
        className="m-auto w-[min(100%-2rem,34rem)] rounded-lg bg-papel p-6 shadow-xl backdrop:bg-tinta/50"
      >
        {edicion && (
          <FormularioUsuario
            key={edicion.usuario?.id ?? "nuevo"}
            usuario={edicion.usuario}
            alCancelar={() => setEdicion(null)}
            alGuardar={(u) => {
              setMensaje(
                edicion.usuario ? `Se guardaron los cambios de ${u.nombre}.` : `Se creó la cuenta de ${u.nombre}.`
              );
              setEdicion(null);
              recargar();
            }}
          />
        )}
      </dialog>
    </div>
  );
}

export default function UsuariosPage() {
  return (
    <SoloRoles roles={["administrador"]}>
      <Usuarios />
    </SoloRoles>
  );
}
