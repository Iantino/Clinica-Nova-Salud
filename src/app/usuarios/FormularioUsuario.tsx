"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import {
  actualizarUsuario,
  crearUsuario,
  type DatosUsuario,
  type UsuarioGestion,
} from "@/lib/usuarios";
import Campo, { estiloControl } from "@/components/ui/Campo";
import Boton from "@/components/ui/Boton";
import Aviso from "@/components/ui/Aviso";

type Errores = Partial<Record<keyof DatosUsuario, string>>;

const ROLES_EDITABLES = ["administrador", "recepcionista"];

export default function FormularioUsuario({
  usuario,
  alGuardar,
  alCancelar,
}: {
  usuario: UsuarioGestion | null;
  alGuardar: (usuario: UsuarioGestion) => void;
  alCancelar: () => void;
}) {
  const nuevo = usuario === null;
  const rolEditable = nuevo || ROLES_EDITABLES.includes(usuario.rol);

  const [datos, setDatos] = useState<DatosUsuario>({
    nombre: usuario?.nombre ?? "",
    apellido: usuario?.apellido ?? "",
    correo: usuario?.correo ?? "",
    rol: rolEditable ? ((usuario?.rol as DatosUsuario["rol"]) ?? "recepcionista") : undefined,
    password: "",
  });
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cambiar = (campo: keyof DatosUsuario) => (valor: string) =>
    setDatos((d) => ({ ...d, [campo]: valor }));

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrores({});
    setErrorGeneral("");
    setGuardando(true);

    const cuerpo: DatosUsuario = { ...datos };
    if (!cuerpo.password) delete cuerpo.password;
    if (!rolEditable) delete cuerpo.rol;

    try {
      const { usuario: guardado } = nuevo
        ? await crearUsuario(cuerpo)
        : await actualizarUsuario(usuario.id, cuerpo);
      alGuardar(guardado);
    } catch (error) {
      if (error instanceof ApiError && error.errores) {
        setErrores(Object.fromEntries(error.errores.map((e) => [e.campo, e.mensaje])));
      } else if (error instanceof ApiError && error.status === 409) {
        setErrores({ correo: error.message });
      } else {
        setErrorGeneral(error instanceof Error ? error.message : "No se pudo guardar.");
      }
      setGuardando(false);
    }
  }

  return (
    <form noValidate onSubmit={guardar} className="space-y-4">
      <h2 className="font-display text-2xl font-bold text-pino">
        {nuevo ? "Nuevo usuario" : `Editar a ${usuario.nombre}`}
      </h2>

      {errorGeneral && <Aviso>{errorGeneral}</Aviso>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          id="u-nombre"
          etiqueta="Nombre"
          value={datos.nombre}
          onChange={(e) => cambiar("nombre")(e.target.value)}
          error={errores.nombre}
          autoComplete="off"
        />
        <Campo
          id="u-apellido"
          etiqueta="Apellido"
          value={datos.apellido}
          onChange={(e) => cambiar("apellido")(e.target.value)}
          error={errores.apellido}
          autoComplete="off"
        />
      </div>

      <Campo
        id="u-correo"
        etiqueta="Correo"
        type="email"
        value={datos.correo}
        onChange={(e) => cambiar("correo")(e.target.value)}
        error={errores.correo}
        autoComplete="off"
      />

      {rolEditable ? (
        <Campo id="u-rol" etiqueta="Rol" error={errores.rol}>
          <select
            id="u-rol"
            value={datos.rol}
            onChange={(e) => cambiar("rol")(e.target.value)}
            className={estiloControl}
          >
            <option value="recepcionista">Recepción</option>
            <option value="administrador">Administración</option>
          </select>
        </Campo>
      ) : (
        <p className="text-sm text-tinta/70">
          El rol de los médicos se administra en el módulo de médicos.
        </p>
      )}

      <Campo
        id="u-password"
        etiqueta={nuevo ? "Contraseña" : "Nueva contraseña"}
        type="password"
        value={datos.password}
        onChange={(e) => cambiar("password")(e.target.value)}
        error={errores.password}
        autoComplete="new-password"
        ayuda={
          nuevo
            ? "Mínimo 8 caracteres, con al menos una letra y un número."
            : "Déjala vacía para no cambiarla. Cambiarla también desbloquea la cuenta."
        }
      />

      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <Boton variante="secundario" onClick={alCancelar}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : nuevo ? "Crear usuario" : "Guardar cambios"}
        </Boton>
      </div>
    </form>
  );
}
