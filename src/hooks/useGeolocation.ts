import { useEffect, useRef, useState } from 'react';

export type GeolocationError =
  | 'unsupported'
  | 'permission-denied'
  | 'position-unavailable'
  | 'timeout'
  | 'invalid-position';

type GeolocationResult =
  | { success: true; coordinates: { lat: number; lng: number } }
  | { success: false; error: GeolocationError }
  | { success: false; cancelled: true };

type GeolocationStatus = 'idle' | 'locating' | 'located' | 'error';

export const useGeolocation = () => {
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, []);

  const locate = (): Promise<GeolocationResult> => {
    const requestId = ++requestIdRef.current;

    if (!navigator.geolocation) {
      setStatus('error');
      return Promise.resolve({ success: false, error: 'unsupported' });
    }

    setStatus('locating');

    return new Promise((resolve) => {
      const finish = (result: GeolocationResult, nextStatus: GeolocationStatus) => {
        if (!isMountedRef.current || requestId !== requestIdRef.current) {
          resolve({ success: false, cancelled: true });
          return;
        }

        setStatus(nextStatus);
        resolve(result);
      };

      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const isValid =
              Number.isFinite(latitude) &&
              Number.isFinite(longitude) &&
              latitude >= -90 &&
              latitude <= 90 &&
              longitude >= -180 &&
              longitude <= 180;

            if (!isValid) {
              finish({ success: false, error: 'invalid-position' }, 'error');
              return;
            }

            finish({ success: true, coordinates: { lat: latitude, lng: longitude } }, 'located');
          },
          (error) => {
            const locationError: GeolocationError =
              error.code === error.PERMISSION_DENIED
                ? 'permission-denied'
                : error.code === error.POSITION_UNAVAILABLE
                  ? 'position-unavailable'
                  : 'timeout';

            finish({ success: false, error: locationError }, 'error');
          },
          {
            enableHighAccuracy: false,
            maximumAge: 15_000,
            timeout: 25_000,
          }
        );
      } catch {
        finish({ success: false, error: 'position-unavailable' }, 'error');
      }
    });
  };

  return { isLocating: status === 'locating', locate };
};