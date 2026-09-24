# elei

Frontend de elei: mapa de cafeterías con MapLibre. Inicias sesión contra el backend (`../backend`):
el **admin** agrega y elimina cafeterías con foto; un **usuario común** solo las ve. Toda la comunicación con el
servidor pasa por `src/services/api.ts` y `src/store/cafeStore.ts`. Guía completa en el README de la raíz.

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
  main.ts               orquesta la UI: eventos de los componentes ↔ mapa ↔ store
  types.ts              Cafe, LatLng
  map/
    map.ts               instancia única de maplibregl.Map + flyToPlace()
    style.ts             estilo de MapLibre (solo calles, plazas, sin POIs)
  services/
    geocoding.ts         búsqueda de lugares (Nominatim)
    api.ts               fetch al backend: agrega el token, normaliza errores, avisa si la sesión expiró
    session.ts           token + usuario en localStorage
    auth.ts              login / registro / me / logout
  store/
    cafeStore.ts         listar / agregar / eliminar cafeterías vía API (async)
  utils/
    image.ts              miniatura cuadrada a partir de un File (usado por cafe-modal.ts)
  components/
    login-screen.ts      <elei-login-screen>  — iniciar sesión / crear cuenta
    user-badge.ts        <elei-user-badge>    — menú de cuenta (email, rol, cerrar sesión)
    search-panel.ts      <elei-search-panel>  — input + botón "Ir"
    fab.ts                <elei-fab>           — botón flotante "+ Agregar cafetería"
    place-bar.ts          <elei-place-bar>     — confirmar/cancelar ubicación
    cafe-modal.ts         <elei-cafe-modal>    — formulario (nombre + foto)
    cafe-marker.ts         <elei-cafe-marker>   — marcador + contenido del popup
  styles/
    global.css            variables CSS, layout del mapa, estilos del marcador
```

`map/` contiene solo lo que es del mapa en sí (instancia, estilo, encuadre).
El flujo de "ubicar cafetería" (pin central, `placing`/`pending`) es un flujo de
UI que toca varios componentes a la vez, así que vive en `main.ts` — no se movió
a `map/` para no mezclar "cómo se ve/comporta el mapa" con "qué hace la app con
el mapa". Si ese flujo crece mucho, el próximo paso natural es un
`state/app-state.ts` chico (un `EventTarget`), pero no se justifica todavía con
dos variables locales.

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
npm run dev       # servidor local con recarga en caliente (reenvía /api a http://localhost:3000)
npm run build     # build de producción a dist/ (incluye service worker); usa VITE_API_URL para apuntar al backend
npm run preview   # sirve el build de producción
```

## Pendientes / decisiones abiertas

- Los íconos en `public/icons/` son placeholders generados automáticamente;
  conviene reemplazarlos por un ícono real antes de publicar.
- El manifest y el `registerType: 'autoUpdate'` están en `vite.config.ts`;
  ajusta nombre, colores y `start_url` si cambia el dominio de despliegue.
- `npm audit` reporta una vulnerabilidad en `maplibre-gl` 4.x (sanitizador de HTML). El arreglo es un salto de versión
  mayor (`npm audit fix --force`) que puede cambiar la API: pruébalo aparte antes de actualizar.
- Sin conexión la app abre (service worker) pero no carga las cafeterías: la API no se cachea a propósito.
- `maplibre-gl` es una dependencia de npm. Se eliminaron del repo `cafes.js`,
  `index.js`, `styles.css` y `lib/` (versión previa a la migración a Vite,
  ya sin referencias desde `index.html`) y el duplicado `map/geocode.ts`
  (`services/geocoding.ts` es la única implementación).
