import type { InputHTMLAttributes, ReactNode } from "react";

export const estiloControl =
  "mt-1.5 w-full rounded-md border border-tinta/20 bg-white px-3.5 py-2.5 outline-none focus-visible:border-hoja focus-visible:ring-2 focus-visible:ring-hoja/30 aria-invalid:border-error disabled:bg-papel disabled:text-tinta/70";

type Props = {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: ReactNode;
  children?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

// Etiqueta, control y mensaje de error enlazados para lectores de pantalla.
// Si se pasa children (un select o textarea), se usa en lugar del input.
export default function Campo({ id, etiqueta, error, ayuda, children, className, ...input }: Props) {
  const descripcion = [error && `${id}-error`, ayuda && `${id}-ayuda`].filter(Boolean).join(" ");

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold">
        {etiqueta}
      </label>
      {children ?? (
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={descripcion || undefined}
          className={estiloControl}
          {...input}
        />
      )}
      {ayuda && !error && (
        <p id={`${id}-ayuda`} className="mt-1.5 text-sm text-tinta/60">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
