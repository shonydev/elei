import type { Cafe } from '../types';

const STORAGE_KEY = 'elei.cafes';

/** Id corto y suficientemente único para una lista local de cafeterías. */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function readAll(): Cafe[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Cafe[];
  } catch (error) {
    console.warn('elei: storage de cafeterías corrupto, se ignora', error);
    return [];
  }
}

function writeAll(cafes: Cafe[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cafes));
}

// Todo el acceso a datos vive acá; para cambiarlo luego por un backend
// solo hay que reescribir estas funciones.
export const cafeStore = {
  list(): Cafe[] {
    return readAll();
  },
  /** Genera el id, persiste la cafetería y devuelve el registro ya completo. */
  add(data: Omit<Cafe, 'id'>): Cafe {
    const cafe: Cafe = { ...data, id: generateId() };
    writeAll([...readAll(), cafe]);
    return cafe;
  },
  remove(id: string): void {
    writeAll(readAll().filter((cafe) => cafe.id !== id));
  }
};
