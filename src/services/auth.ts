import type { User } from '../types';
import { api } from './api';
import { session } from './session';

interface AuthResponse {
  accessToken: string;
  user: User;
}

async function authenticate(path: '/auth/login' | '/auth/register', email: string, password: string): Promise<User> {
  const { accessToken, user } = await api<AuthResponse>(path, { method: 'POST', body: { email, password } });
  session.save(accessToken, user);
  return user;
}

export const auth = {
  login: (email: string, password: string) => authenticate('/auth/login', email, password),
  register: (email: string, password: string) => authenticate('/auth/register', email, password),

  /** Pide al servidor el usuario actual (por si su rol cambió desde el último login). */
  async me(): Promise<User> {
    const user = await api<User>('/auth/me');
    session.saveUser(user);
    return user;
  },

  logout(): void {
    session.clear();
  }
};
