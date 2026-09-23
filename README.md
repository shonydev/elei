# elei

Mapa de cafeterías con MapLibre. Buscas una ciudad y agregas cafeterías con foto;
se guardan en `localStorage` (toda la persistencia pasa por `src/store/cafeStore.ts`,
listo para cambiarlo por un backend sin tocar el resto).

## Stack

```
Vite
  ├── TypeScript
  ├── Web Components nativos (sin framework)
  ├── CSS (variables + Shadow DOM por componente)
  └── PWA (vite-plugin-pwa)
```

## Estructura

```
src/
  main.ts              orquesta el mapa y conecta los componentes entre sí
  types.ts             Cafe, LatLng
  map/
    style.ts           estilo de MapLibre (solo calles, plazas, sin POIs)
    geocode.ts          búsqueda de lugares (Nominatim)
  store/
    cafeStore.ts        localStorage, aislado para reemplazar por API luego
  components/
    search-panel.ts     <elei-search-panel>  — input + botón "Ir"
    fab.ts               <elei-fab>           — botón flotante "+ Agregar cafetería"
    place-bar.ts         <elei-place-bar>     — confirmar/cancelar ubicación
    cafe-modal.ts        <elei-cafe-modal>    — formulario (nombre + foto)
    cafe-marker.ts        <elei-cafe-marker>   — marcador + contenido del popup
  styles/
    global.css           variables CSS, layout del mapa, estilos del marcador
```

Cada componente usa **Shadow DOM** (excepto `elei-cafe-marker`, que necesita quedar
en el DOM "plano" para que MapLibre lo posicione y le aplique sus propias clases).
Las variables CSS (`--accent`, `--panel`, etc.) definidas en `global.css` atraviesan
el Shadow DOM sin problema, así que los componentes se ven consistentes sin
duplicar estilos.

La comunicación es con `CustomEvent` (`elei-search`, `elei-fab-click`,
`elei-place-confirm`, `elei-cafe-submit`, `elei-cafe-delete`, …), que `main.ts`
escucha y traduce en llamadas al mapa y al store. Ningún componente conoce a
otro directamente.

## Desarrollo

```bash
npm install
npm run dev       # servidor local con recarga en caliente
npm run build     # build de producción a dist/ (incluye service worker)
npm run preview   # sirve el build de producción
```

## Pendientes / decisiones abiertas

- Los íconos en `public/icons/` son placeholders generados automáticamente;
  conviene reemplazarlos por un ícono real antes de publicar.
- El manifest y el `registerType: 'autoUpdate'` están en `vite.config.ts`;
  ajusta nombre, colores y `start_url` si cambia el dominio de despliegue.
- `maplibre-gl` ahora es una dependencia de npm (antes vivía copiada en `lib/`).
