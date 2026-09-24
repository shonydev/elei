import { session } from './session';

const BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

/** Evento global que se dispara cuando el servidor rechaza el token (expiró, usuario borrado, etc.). */
export const UNAUTHORIZED_EVENT = 'elei-unauthorized';

export class ApiError extends Error {
  /** status 0 = no hubo respuesta (sin internet / servidor caído). */
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
}

export async function api<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
  const token = session.getToken();
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor.');
  }

  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => null)) as { message?: string | string[] } | null;

  if (!res.ok) {
    // 401 con token = sesión inválida. (Un 401 en el login no lleva token, así que no entra aquí.)
    if (res.status === 401 && token) {
      session.clear();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    // Nest devuelve `message` como array cuando falla la validación de varios campos.
    const message = Array.isArray(data?.message) ? data.message.join('. ') : data?.message;
    throw new ApiError(res.status, message ?? `Error del servidor (${res.status}).`);
  }
  return data as T;
}
