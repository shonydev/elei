import type { User } from '../types';

const TOKEN_KEY = 'elei.token';
const USER_KEY = 'elei.user';

/**
 * Guarda el JWT y el usuario en localStorage.
 * Ojo: el rol guardado aquí solo sirve para decidir qué mostrar en la UI;
 * la autorización real la hace siempre el backend.
 */
export const session = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  getUser(): User | null {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') as User | null;
    } catch {
      return null;
    }
  },
  save(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  saveUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};
