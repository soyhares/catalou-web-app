import { emitErrorReportEvent } from './error-report-store';

const API_URL = import.meta.env.VITE_API_URL as string;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function publicFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    // Leer el cuerpo es lo que separa "hubo un error" de un mensaje que la persona puede
    // entender y nosotros podemos depurar. La API redacta sus mensajes en español.
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const message = (body['error'] as string | undefined) ?? `Request failed: ${res.status}`;
    // Un 4xx es una respuesta esperada del sistema y la resuelve quien llama. Un 5xx no
    // debería existir: ese sí abre el modal de reporte.
    if (res.status >= 500) {
      emitErrorReportEvent({ message, context: `${options.method ?? 'GET'} ${path}` });
    }
    throw new ApiError(res.status, message, body['code'] as string | undefined);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
