import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles/global.css';

import './components/search-panel';
import './components/fab';
import './components/place-bar';
import './components/cafe-modal';
import { EleiCafeMarker } from './components/cafe-marker';

import type { EleiSearchPanel } from './components/search-panel';
import type { EleiCafeModal, CafeSubmitDetail } from './components/cafe-modal';

import { mapStyle } from './map/style';
import { geocode } from './map/geocode';
import { cafeStore } from './store/cafeStore';
import type { Cafe, LatLng } from './types';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const map = new maplibregl.Map({
  container: 'map',
  style: mapStyle,
  center: [-72.35015418744898, -37.47468250737804],
  zoom: 15,
  attributionControl: false
});

const searchPanel = $<EleiSearchPanel>('searchPanel');
const addCafeBtn = $<HTMLElement>('addCafeBtn');
const pin = $<HTMLElement>('centerPin');
const placeBar = $<HTMLElement>('placeBar');
const cafeModal = $<EleiCafeModal>('cafeModal');

// ---------- Búsqueda de ciudad ----------
async function loadCity(query: string) {
  searchPanel.setStatus(`Buscando ${query}…`);
  try {
    const place = await geocode(query);
    const [south, north, west, east] = place.boundingbox.map(Number);
    map.fitBounds(
      [
        [west, south],
        [east, north]
      ],
      { padding: 20, duration: 600 }
    );
    searchPanel.setStatus(`Listo — ${query}`);
  } catch {
    searchPanel.setStatus('No pude encontrar ese lugar.');
  }
}

searchPanel.addEventListener('elei-search', (e) => {
  loadCity((e as CustomEvent<{ query: string }>).detail.query);
});

map.on('load', () => searchPanel.setStatus('Listo'));

// ---------- Modo "ubicar" (pin fijo al centro, estilo Uber) ----------
let placing = false;
let pending: LatLng | null = null;

function startPlacing() {
  placing = true;
  pin.hidden = false;
  placeBar.hidden = false;
  addCafeBtn.hidden = true;
}
function stopPlacing() {
  placing = false;
  pin.hidden = true;
  placeBar.hidden = true;
  addCafeBtn.hidden = false;
}

map.on('movestart', () => placing && pin.classList.add('lifted'));
map.on('moveend', () => pin.classList.remove('lifted'));

addCafeBtn.addEventListener('elei-fab-click', startPlacing);
placeBar.addEventListener('elei-place-cancel', stopPlacing);
placeBar.addEventListener('elei-place-confirm', () => {
  const c = map.getCenter(); // el pin apunta exactamente al centro del mapa
  pending = { lng: c.lng, lat: c.lat };
  stopPlacing();
  cafeModal.open();
  cafeModal.hidden = false;
});

// ---------- Formulario / alta de cafetería ----------
cafeModal.addEventListener('elei-cafe-cancel', () => {
  cafeModal.hidden = true;
  pending = null;
});

cafeModal.addEventListener('elei-cafe-submit', (e) => {
  const { name, photo } = (e as CustomEvent<CafeSubmitDetail>).detail;
  if (!pending) return;
  const cafe: Cafe = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name,
    lng: pending.lng,
    lat: pending.lat,
    photo
  };
  try {
    cafeStore.add(cafe);
  } catch {
    alert('No se pudo guardar (almacenamiento lleno).');
    return;
  }
  renderCafe(cafe);
  cafeModal.hidden = true;
  pending = null;
});

// ---------- Marcadores ----------
const markers = new Map<string, maplibregl.Marker>();

function renderCafe(cafe: Cafe) {
  const el = document.createElement('elei-cafe-marker') as EleiCafeMarker;
  el.cafe = cafe;

  const popup = new maplibregl.Popup({ offset: [0, -60], closeButton: false }).setDOMContent(
    el.createPopupContent()
  );
  const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
    .setLngLat([cafe.lng, cafe.lat])
    .setPopup(popup)
    .addTo(map);

  el.addEventListener('elei-cafe-delete', (e) => {
    const { id } = (e as CustomEvent<{ id: string }>).detail;
    cafeStore.remove(id);
    marker.remove();
    markers.delete(id);
  });

  markers.set(cafe.id, marker);
}

// ---------- Carga inicial ----------
cafeStore.list().forEach(renderCafe);
