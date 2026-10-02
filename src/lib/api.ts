const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ErrorCampo = { campo: string; mensaje: string };

export class ApiError extends Error {
  status: number;
  errores?: ErrorCampo[];

  constructor(message: string, status: number, errores?: ErrorCampo[]) {
    super(message);
    this.status = status;
    this.errores = errores;
  }
}

// Llama a la API enviando siempre la cookie de sesión
export async function api<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  let respuesta: Response;

  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...opciones.headers },
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Intenta de nuevo en unos minutos.",
      0
    );
  }

  if (respuesta.status === 204) return undefined as T;

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new ApiError(
      datos.message ?? "Ocurrió un error inesperado.",
      respuesta.status,
      datos.errores
    );
  }

  return datos as T;
}
