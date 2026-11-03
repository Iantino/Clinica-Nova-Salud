import { useEffect, useState } from "react";

// Devuelve el valor solo cuando deja de cambiar durante "espera" milisegundos.
// Evita consultar la API con cada tecla.
export function useDebounce<T>(valor: T, espera = 300) {
  const [demorado, setDemorado] = useState(valor);

  useEffect(() => {
    const id = setTimeout(() => setDemorado(valor), espera);
    return () => clearTimeout(id);
  }, [valor, espera]);

  return demorado;
}
