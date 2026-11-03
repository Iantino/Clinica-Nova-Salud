import type { ReactNode } from "react";

const tonos = {
  error: "border-error/30 bg-error/5 text-error",
  exito: "border-hoja/30 bg-menta/50 text-pino",
};

export default function Aviso({ tono = "error", children }: { tono?: keyof typeof tonos; children: ReactNode }) {
  return (
    <p role={tono === "error" ? "alert" : "status"} className={`rounded-md border px-4 py-3 text-sm ${tonos[tono]}`}>
      {children}
    </p>
  );
}
