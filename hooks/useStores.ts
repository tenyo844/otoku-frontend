import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Store, Coordinates } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export function useStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = useCallback(async (coords: Coordinates) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/stores?lat=${coords.latitude}&lng=${coords.longitude}&radius=2000`
      );
      if (!res.ok) throw new Error('店舗情報の取得に失敗しました');
      const data = await res.json();
      setStores(data.stores);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    }
  }, []);

  const requestLocationAndFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('位置情報の許可が必要です。設定から許可してください。');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const coords: Coordinates = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setLocation(coords);
      await fetchStores(coords);
    } catch (err) {
      setError('位置情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [fetchStores]);

  useEffect(() => {
    requestLocationAndFetch();
  }, []);

  return {
    stores,
    location,
    loading,
    error,
    refresh: requestLocationAndFetch,
  };
}
