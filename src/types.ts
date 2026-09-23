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
