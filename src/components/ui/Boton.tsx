import type { ButtonHTMLAttributes } from "react";

const estilos = {
  principal:
    "bg-pino text-white hover:bg-hoja disabled:opacity-70",
  secundario:
    "border border-pino text-pino hover:bg-menta/60 disabled:opacity-60",
  claro:
    "bg-white text-pino shadow-sm hover:bg-menta hover:text-pino disabled:opacity-70",
  texto:
    "px-2 text-hoja underline-offset-4 hover:underline disabled:opacity-60",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variante?: keyof typeof estilos };

export default function Boton({ variante = "principal", className = "", ...props }: Props) {
  const relleno = variante === "texto" ? "py-1.5" : "px-4 py-2.5";
  return (
    <button
      type="button"
      className={`rounded-md font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-hoja/50 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed ${relleno} ${estilos[variante]} ${className}`}
      {...props}
    />
  );
}
