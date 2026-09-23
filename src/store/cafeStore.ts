import type { Cafe } from '../types';

const STORAGE_KEY = 'elei.cafes';

// Todo el acceso a datos vive acá; para cambiarlo luego por un backend
// solo hay que reescribir estas tres funciones.
export const cafeStore = {
  list(): Cafe[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Cafe[];
    } catch {
      return [];
    }
  },
  add(cafe: Cafe): void {
    const all = cafeStore.list();
    all.push(cafe);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },
  remove(id: string): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cafeStore.list().filter((c) => c.id !== id)));
  }
};
