// Estilo propio: solo 3 colores, sin edificios, sin agua, sin POIs, sin etiquetas.
const style = {
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
            // Este es el layer que realmente contiene la mayoría de las plazas y parques.
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

const map = new maplibregl.Map({
    container: 'map',
    style,
    center: [-72.35015418744898, -37.47468250737804],
    zoom: 15,
    attributionControl: false
});

const statusEl = document.getElementById('status');

async function geocode(query) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await res.json();
    if (!data.length) throw new Error('No se encontró el lugar');
    return data[0];
}

async function loadCity(query) {
    statusEl.textContent = 'Buscando ' + query + '…';

    let place;
    try {
        place = await geocode(query);
    } catch (e) {
        statusEl.textContent = 'No pude encontrar ese lugar.';
        return;
    }

    const bb = place.boundingbox.map(Number); // [south, north, west, east]
    const [south, north, west, east] = bb;
    map.fitBounds([[west, south], [east, north]], { padding: 20, duration: 600 });
    statusEl.textContent = `Listo — ${query}`;
}

document.getElementById('searchBtn').addEventListener('click', () => {
    const q = document.getElementById('searchInput').value.trim();
    if (q) loadCity(q);
});
document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('searchBtn').click();
});

map.on('load', () => {
    statusEl.textContent = 'Listo';
});