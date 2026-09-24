import type { Cafe } from '../types';
import { api } from '../services/api';

// Todo el acceso a datos sigue viviendo acá (igual que con localStorage),
// pero ahora habla con el backend. Ojo: todas las operaciones son async.
export const cafeStore = {
  /** Cualquier usuario logueado puede listar. */
  list(): Promise<Cafe[]> {
    return api<Cafe[]>('/cafes');
  },
  /** Solo admin: el servidor responde 403 a cualquier otro rol. */
  add(data: Omit<Cafe, 'id'>): Promise<Cafe> {
    return api<Cafe>('/cafes', { method: 'POST', body: data });
  },
  /** Solo admin. */
  remove(id: string): Promise<void> {
    return api<void>(`/cafes/${id}`, { method: 'DELETE' });
  }
};
