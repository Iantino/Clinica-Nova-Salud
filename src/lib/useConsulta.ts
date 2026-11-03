import { useEffect, useState } from "react";

type Estado<T> = { clave: string; datos?: T; error?: string };

// Ejecuta una consulta cada vez que cambia la clave y descarta respuestas viejas.
// "recargar" vuelve a pedir los datos con la misma clave (después de guardar).
export function useConsulta<T>(clave: string, consultar: () => Promise<T>) {
  const [estado, setEstado] = useState<Estado<T>>({ clave: "" });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    consultar()
      .then((datos) => vigente && setEstado({ clave, datos }))
      .catch((e: Error) => vigente && setEstado({ clave, error: e.message }));
    return () => {
      vigente = false;
    };
    // La consulta depende solo de la clave y de la versión
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, version]);

  return {
    datos: estado.datos,
    error: estado.clave === clave ? estado.error : undefined,
    cargando: estado.clave !== clave,
    recargar: () => setVersion((v) => v + 1),
  };
}
