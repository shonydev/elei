import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Business } from '../types';
import { mapStyle } from '../map/style';
import { GeolocationError, useGeolocation } from '../hooks/useGeolocation';
import { Crosshair, MapPin, ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface MapContainerProps {
  businesses: Business[];
  selectedBusiness: Business | null;
  onSelectBusiness: (business: Business) => void;
  isPickingLocation: boolean;
  draftCoordinates: { lat: number; lng: number } | null;
  onLocationPicked: (coords: { lat: number; lng: number }) => void;
  searchFilter: string;
  onShowToast?: (msg: string) => void;
  relocatingBusiness?: Business | null;
  relocationCoordinates?: { lat: number; lng: number } | null;
  onRelocationCoordinatesChange?: (coords: { lat: number; lng: number }) => void;
}

// Center directly on Calle Bulnes where both cafes are located
const LOS_ANGELES_CENTER: [number, number] = [-72.350113, -37.474403];

export const MapContainer: React.FC<MapContainerProps> = ({
  businesses,
  selectedBusiness,
  onSelectBusiness,
  isPickingLocation,
  draftCoordinates,
  onLocationPicked,
  onShowToast,
  relocatingBusiness,
  relocationCoordinates,
  onRelocationCoordinatesChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const draftMarkerRef = useRef<maplibregl.Marker | null>(null);
  const relocationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const userLocationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const isDraggingMarkerRef = useRef<boolean>(false);
  const lastDragEndRef = useRef<number>(0);

  const { isLocating, locate } = useGeolocation();
  const [isMapMoving, setIsMapMoving] = useState(false);

  const getMarkerOffset = (occurrence: number): [number, number] => {
    const directions: [number, number][] = [
      [0, 0],
      [-18, -8],
      [18, -8],
      [-30, 8],
      [30, 8],
      [-12, -22],
      [12, -22],
    ];

    return directions[Math.min(occurrence, directions.length - 1)] ?? [0, 0];
  };

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: LOS_ANGELES_CENTER,
      zoom: 17,
      minZoom: 9,
      maxZoom: 21,
      attributionControl: false,
    });

    map.on('movestart', () => setIsMapMoving(true));
    map.on('moveend', () => setIsMapMoving(false));

    const t1 = setTimeout(() => map.resize(), 100);
    const t2 = setTimeout(() => map.resize(), 400);

    const handleResize = () => map.resize();
    window.addEventListener('resize', handleResize);

    mapRef.current = map;

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // MapLibre emits click events for both mouse clicks and mobile taps.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handlePointPicked = (lng: number, lat: number) => {
      if (relocatingBusiness) {
        if (relocationMarkerRef.current) {
          relocationMarkerRef.current.setLngLat([lng, lat]);
        }
        if (onRelocationCoordinatesChange) {
          onRelocationCoordinatesChange({ lat, lng });
        }
      } else if (isPickingLocation) {
        if (draftMarkerRef.current) {
          draftMarkerRef.current.setLngLat([lng, lat]);
        }
        onLocationPicked({ lat, lng });
      }
    };

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      if (relocatingBusiness) {
        // Ignorar el click que el navegador dispara al soltar el pin tras arrastrarlo
        // y los toques sobre el propio pin: reposicionarían el pin en el cursor
        // (que no coincide con la punta del pin) y pisarían la ubicación arrastrada.
        if (isDraggingMarkerRef.current) return;
        if (performance.now() - lastDragEndRef.current < 300) return;
        const pinEl = relocationMarkerRef.current?.getElement();
        const target = e.originalEvent?.target as Node | null;
        if (pinEl && target && pinEl.contains(target)) return;
      }
      handlePointPicked(e.lngLat.lng, e.lngLat.lat);
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [relocatingBusiness, isPickingLocation, onRelocationCoordinatesChange, onLocationPicked]);

  // Render Business Markers - Exact 1:1 positions, collisions 100% permitted
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const isRelocatingOrPicking = isPickingLocation || Boolean(relocatingBusiness);
    const coordinateCounts = new Map<string, number>();

    businesses.forEach((b) => {
      if (relocatingBusiness?.id === b.id) return;

      const coordinateKey = `${b.lat.toFixed(6)}:${b.lng.toFixed(6)}`;
      const occurrence = coordinateCounts.get(coordinateKey) ?? 0;
      coordinateCounts.set(coordinateKey, occurrence + 1);
      const markerOffset = getMarkerOffset(occurrence);

      const isSelected = selectedBusiness?.id === b.id;

      const el = document.createElement('div');
      el.className = `cafeMarker ${isSelected ? 'is-active' : ''} ${
        isRelocatingOrPicking ? 'pointer-events-none opacity-50' : ''
      }`;
      el.style.zIndex = isSelected ? '1000' : '10';

      const displayName = b.name.length > 20 ? b.name.substring(0, 18) + '...' : b.name;

      el.innerHTML = `
        <div class="cafeMarkerLabel">${displayName}</div>
        <div class="cafeMarkerImg" style="background-image: url('${b.imageUrl}')"></div>
      `;

      if (!isRelocatingOrPicking) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectBusiness(b);
        });
      }

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'bottom',
        offset: markerOffset,
      })
        .setLngLat([b.lng, b.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [businesses, selectedBusiness, relocatingBusiness, isPickingLocation, onSelectBusiness]);

  // Handle Relocation Marker (Stable drag & tap without fighting React re-renders)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (relocatingBusiness && relocationCoordinates) {
      if (!relocationMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'cafeMarker is-active cursor-grab active:cursor-grabbing z-[9999]';
        el.innerHTML = `
          <div class="cafeMarkerLabel" style="opacity: 1; transform: translateX(-50%) translateY(0); background: #000; color: #fff; border: 1.5px solid #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.4); white-space: nowrap;">
            📍 Toca en Bulnes o arrastra aquí
          </div>
          <div class="cafeMarkerImg draft-pin-pulse" style="border-color: #000000; background-image: url('${relocatingBusiness.imageUrl}')"></div>
        `;

        const marker = new maplibregl.Marker({
          element: el,
          anchor: 'bottom',
          draggable: true,
        })
          .setLngLat([relocationCoordinates.lng, relocationCoordinates.lat])
          .addTo(map);

        marker.on('dragstart', () => {
          isDraggingMarkerRef.current = true;
        });

        marker.on('dragend', () => {
          isDraggingMarkerRef.current = false;
          lastDragEndRef.current = performance.now();
          const { lng, lat } = marker.getLngLat();
          if (onRelocationCoordinatesChange) {
            onRelocationCoordinatesChange({ lat, lng });
          }
        });

        relocationMarkerRef.current = marker;
      } else {
        // Only update coordinate if the user is NOT actively dragging it right now
        if (!isDraggingMarkerRef.current) {
          relocationMarkerRef.current.setLngLat([relocationCoordinates.lng, relocationCoordinates.lat]);
        }
      }
    } else {
      if (relocationMarkerRef.current) {
        relocationMarkerRef.current.remove();
        relocationMarkerRef.current = null;
      }
    }
  }, [relocatingBusiness, relocationCoordinates, onRelocationCoordinatesChange]);

  // Handle Draft Marker for Location Picking
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (draftCoordinates && isPickingLocation) {
      if (!draftMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'cafeMarker is-active cursor-grab active:cursor-grabbing z-[9999]';
        el.innerHTML = `
          <div class="cafeMarkerLabel" style="opacity: 1; transform: translateX(-50%) translateY(0);">Fijar cafetería</div>
          <div class="cafeMarkerImg draft-pin-pulse" style="border-color: #000000; background: #000000; color: #ffffff;">
            ☕
          </div>
        `;

        const marker = new maplibregl.Marker({
          element: el,
          anchor: 'bottom',
          draggable: true,
        })
          .setLngLat([draftCoordinates.lng, draftCoordinates.lat])
          .addTo(map);

        marker.on('dragend', () => {
          const { lng, lat } = marker.getLngLat();
          onLocationPicked({ lat, lng });
        });

        draftMarkerRef.current = marker;
      } else {
        draftMarkerRef.current.setLngLat([draftCoordinates.lng, draftCoordinates.lat]);
      }
    } else {
      if (draftMarkerRef.current) {
        draftMarkerRef.current.remove();
        draftMarkerRef.current = null;
      }
    }
  }, [draftCoordinates, isPickingLocation, onLocationPicked]);

  // Center Calle Bulnes / Downtown Los Ángeles
  const handleCenterCity = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: LOS_ANGELES_CENTER,
      zoom: 17,
      duration: 600,
    });
  };

  const getLocationErrorMessage = (error: GeolocationError) => {
    switch (error) {
      case 'unsupported':
        return 'La geolocalización no está soportada en tu navegador.';
      case 'permission-denied':
        return 'Permite el acceso a la ubicación en tu navegador y vuelve a intentarlo.';
      case 'timeout':
        return 'La ubicación tardó demasiado. Comprueba la señal e inténtalo de nuevo.';
      case 'invalid-position':
        return 'El dispositivo devolvió coordenadas no válidas. Vuelve a intentarlo.';
      case 'position-unavailable':
        return 'No se pudo determinar tu ubicación. Comprueba la señal e inténtalo de nuevo.';
    }
  };

  const handleLocateMe = async () => {
    const result = await locate();
    if (!result.success) {
      if ('cancelled' in result) return;
      onShowToast?.(getLocationErrorMessage(result.error));
      return;
    }

    const { lat, lng } = result.coordinates;
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({ center: [lng, lat], zoom: 17, duration: 800 });

    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.setLngLat([lng, lat]);
    } else {
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; inset: -8px; border-radius: 9999px; background: rgba(59, 130, 246, 0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 24px; height: 24px; border-radius: 9999px; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>
        </div>
      `;
      userLocationMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#e3e7ea]">
      {/* MapLibre GL Map Root */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
      />

      {/* elei-frontend Center Pin for location picking */}
      {isPickingLocation && !draftCoordinates && (
        <div id="centerPin" className={isMapMoving ? 'lifted' : ''}>
          <div className="pinHead"></div>
          <div className="pinStick"></div>
          <div className="pinShadow"></div>
        </div>
      )}

      {/* Floating Instructions when in Location Pick Mode */}
      {isPickingLocation && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-[1000] bg-[#2b2b28] text-white px-5 py-3 rounded-full shadow-2xl border border-white/20 flex items-center gap-2.5 text-xs sm:text-sm animate-bounce pointer-events-none">
          <MapPin className="w-4 h-4 text-[#a7e0b7] shrink-0" />
          <span>Toca cualquier calle de <strong>Los Ángeles</strong> para fijar la cafetería</span>
        </div>
      )}

      {/* Floating Map Controls */}
      <div className="absolute top-24 right-4 z-[1000] flex flex-col gap-2.5">
        {/* Center Bulnes / Los Ángeles */}
        <button
          onClick={handleCenterCity}
          className="w-11 h-11 rounded-full bg-white shadow-xl border border-black/5 flex items-center justify-center text-[#2b2b28] hover:bg-stone-50 transition active:scale-95"
          title="Centrar en Calle Bulnes / Los Ángeles"
        >
          <Compass className="w-5 h-5 stroke-[2]" />
        </button>

        {/* GPS Geolocation */}
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className={`w-11 h-11 rounded-full bg-white shadow-xl border border-black/5 flex items-center justify-center transition active:scale-95 ${
            isLocating ? 'text-[#2b2b28] animate-spin' : 'text-[#2b2b28] hover:bg-stone-50'
          }`}
          title="Mi ubicación actual"
        >
          <Crosshair className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Zoom In/Out */}
        <div className="flex flex-col bg-white rounded-full shadow-xl border border-black/5 overflow-hidden">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="w-11 h-10 flex items-center justify-center text-[#2b2b28] hover:bg-stone-100 border-b border-stone-100 transition active:scale-90"
            title="Acercar mapa"
          >
            <ZoomIn className="w-4 h-4 stroke-[2.2]" />
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="w-11 h-10 flex items-center justify-center text-[#2b2b28] hover:bg-stone-100 transition active:scale-90"
            title="Alejar mapa"
          >
            <ZoomOut className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </div>
  );
};
