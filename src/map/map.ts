import maplibregl from 'maplibre-gl';
import { mapStyle } from './style';
import type { GeocodeResult } from '../services/geocoding';

/**
 * Instancia única del mapa. Vive acá (y no en main.ts) para que cualquier
 * módulo que necesite el mapa (búsqueda, marcadores, modo "ubicar") lo importe
 * sin pasarlo como parámetro por todos lados.
 */
export const map = new maplibregl.Map({
  container: 'map',
  style: mapStyle,
  center: [-72.35015418744898, -37.47468250737804],
  zoom: 15,
  attributionControl: false
});

/** Encuadra el mapa sobre el bounding box devuelto por el geocoder. */
export function flyToPlace(place: GeocodeResult) {
  const [south, north, west, east] = place.boundingbox.map(Number);
  map.fitBounds(
    [
      [west, south],
      [east, north]
    ],
    { padding: 20, duration: 600 }
  );
}
