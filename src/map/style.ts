import type { StyleSpecification } from 'maplibre-gl';

// Estilo propio: solo 3 colores, sin edificios, sin agua, sin POIs, sin etiquetas.
export const mapStyle: StyleSpecification = {
  version: 8,
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {
    ofm: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' }
  },
  layers: [
    {
      id: 'bg',
      type: 'background',
      paint: { 'background-color': '#e3e7ea' }
    },
    {
      // Plazas y parques urbanos (OpenMapTiles: landuse / class park, garden, recreation_ground)
      id: 'plazas-landuse',
      type: 'fill',
      source: 'ofm',
      'source-layer': 'landuse',
      filter: ['in', ['get', 'class'], ['literal', ['park', 'garden', 'recreation_ground', 'playground']]],
      paint: { 'fill-color': '#a7e0b7' }
    },
    {
      // Áreas verdes naturales, pasto (OpenMapTiles: landcover / class grass)
      id: 'plazas-landcover',
      type: 'fill',
      source: 'ofm',
      'source-layer': 'landcover',
      filter: ['==', ['get', 'class'], 'grass'],
      paint: { 'fill-color': '#a7e0b7' }
    },
    {
      // Todas las calles y avenidas (se excluyen rieles, ferry y teleféricos)
      id: 'calles',
      type: 'line',
      source: 'ofm',
      'source-layer': 'transportation',
      filter: ['!', ['in', ['get', 'class'], ['literal', ['rail', 'transit', 'ferry', 'aerialway']]]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#ffffff',
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 1.4, ['secondary', 'tertiary'], 1, 0.5],
          14, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 4, ['secondary', 'tertiary'], 3, 1.5],
          18, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 14, ['secondary', 'tertiary'], 10, 6]
        ]
      }
    },
    {
      // Nombres de calles y avenidas (OpenMapTiles: transportation_name)
      id: 'calles-nombres',
      type: 'symbol',
      source: 'ofm',
      'source-layer': 'transportation_name',
      filter: ['!', ['in', ['get', 'class'], ['literal', ['rail', 'transit', 'ferry', 'aerialway']]]],
      layout: {
        'symbol-placement': 'line',
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Regular'],
        'text-size': [
          'interpolate', ['linear'], ['zoom'],
          12, 10,
          16, 13,
          18, 15
        ],
        'text-letter-spacing': 0.02,
        'symbol-spacing': 250
      },
      paint: {
        'text-color': '#000000',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.4
      }
    }
  ]
};
