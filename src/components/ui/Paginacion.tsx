import type { Paginacion as Datos } from "@/lib/tipos";
import Boton from "./Boton";

export default function Paginacion({
  paginacion,
  alCambiar,
}: {
  paginacion: Datos;
  alCambiar: (pagina: number) => void;
}) {
  const { pagina, totalPaginas, total, porPagina } = paginacion;
  if (total === 0) return null;

  const desde = (pagina - 1) * porPagina + 1;
  const hasta = Math.min(pagina * porPagina, total);

  return (
    <nav aria-label="Paginación" className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-tinta/70">
        {desde}–{hasta} de {total}
      </p>
      <div className="flex items-center gap-2">
        <Boton variante="secundario" disabled={pagina <= 1} onClick={() => alCambiar(pagina - 1)}>
          Anterior
        </Boton>
        <span className="px-2 text-sm text-tinta/70">
          Página {pagina} de {totalPaginas}
        </span>
        <Boton
          variante="secundario"
          disabled={pagina >= totalPaginas}
          onClick={() => alCambiar(pagina + 1)}
        >
          Siguiente
        </Boton>
      </div>
    </nav>
  );
}
