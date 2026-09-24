export interface Cafe {
  id: string;
  name: string;
  lng: number;
  lat: number;
  photo: string | null; // dataURL en miniatura
}

export interface LatLng {
  lng: number;
  lat: number;
}

export type Role = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  role: Role;
}
