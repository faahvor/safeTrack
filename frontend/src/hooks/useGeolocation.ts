'use client';

import { useState, useEffect, useCallback } from 'react';

interface GeoState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  error: string | null;
  loading: boolean;
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    // Prefer a short display: road + suburb/city
    const { road, suburb, city, town, village, country } = data.address ?? {};
    const parts = [road, suburb || city || town || village, country].filter(Boolean);
    return parts.length ? parts.join(', ') : (data.display_name ?? null);
  } catch {
    return null;
  }
}

export function useGeolocation(watch = false) {
  const [state, setState] = useState<GeoState>({
    latitude: null,
    longitude: null,
    address: null,
    error: null,
    loading: false,
  });

  const updatePosition = useCallback(async (position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    const address = await reverseGeocode(latitude, longitude);
    setState({ latitude, longitude, address, error: null, loading: false });
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    setState((s) => ({ ...s, error: err.message, loading: false }));
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation not supported', loading: false }));
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    navigator.geolocation.getCurrentPosition(updatePosition, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  }, [updatePosition, handleError]);

  useEffect(() => {
    if (!watch) return;
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation not supported' }));
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    const watchId = navigator.geolocation.watchPosition(updatePosition, handleError, {
      enableHighAccuracy: true,
    });
    return () => navigator.geolocation.clearWatch(watchId);
  }, [watch, updatePosition, handleError]);

  return { ...state, getCurrentPosition };
}
