import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import './styles/global.css';

import './components/search-panel';
import './components/fab';
import './components/place-bar';
import './components/cafe-modal';
import { EleiCafeMarker } from './components/cafe-marker';

import type { EleiSearchPanel } from './components/search-panel';
import type { EleiCafeModal, CafeSubmitDetail } from './components/cafe-modal';

import { map, flyToPlace } from './map/map';
import { geocode } from './services/geocoding';
import { cafeStore } from './store/cafeStore';
import type { Cafe, LatLng } from './types';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

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
    flyToPlace(place);
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
// Es un flujo de UI (botón → pin → confirmar → modal), no lógica del mapa en sí,
// por eso queda acá y no en map/map.ts.
let placing = false;
let pendingLocation: LatLng | null = null;

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
  map.stop();
  const c = map.getCenter(); // el pin apunta exactamente al centro del mapa
  pendingLocation = { lng: c.lng, lat: c.lat };
  stopPlacing();
  cafeModal.open();
  cafeModal.hidden = false;
});

// ---------- Formulario / alta de cafetería ----------
cafeModal.addEventListener('elei-cafe-cancel', () => {
  cafeModal.hidden = true;
  pendingLocation = null;
});

cafeModal.addEventListener('elei-cafe-submit', (e) => {
  const { name, photo } = (e as CustomEvent<CafeSubmitDetail>).detail;
  if (!pendingLocation) return;

  let cafe: Cafe;
  try {
    cafe = cafeStore.add({ name, photo, ...pendingLocation });
  } catch {
    alert('No se pudo guardar (almacenamiento lleno).');
    return;
  }
  renderCafe(cafe);
  cafeModal.hidden = true;
  pendingLocation = null;
});

// ---------- Marcadores ----------
const markers = new Map<string, maplibregl.Marker>();

function renderCafe(cafe: Cafe) {
  const el = new EleiCafeMarker();
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
