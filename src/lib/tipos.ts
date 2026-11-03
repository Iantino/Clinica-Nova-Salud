export type Paginacion = {
  pagina: number;
  porPagina: number;
  total: number;
  totalPaginas: number;
};

export type Paginado<T> = { datos: T[]; paginacion: Paginacion };

// Convierte un objeto en parámetros de URL, omitiendo los vacíos
export function query(parametros: Record<string, string | number | undefined>) {
  const p = new URLSearchParams();
  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor !== undefined && valor !== "") p.set(clave, String(valor));
  }
  const texto = p.toString();
  return texto ? `?${texto}` : "";
}
