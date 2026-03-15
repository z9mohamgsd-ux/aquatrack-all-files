import { useEffect, useState, useCallback } from 'react';
import { MapView } from '@/components/Map/MapView';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { DeviceWithLocation } from '@/types';

export function MapPage() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<DeviceWithLocation[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const response = await apiService.getLatestData();
      if (response.success) {
        setDevices(response.data);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <MapView devices={devices} onRefresh={fetchData} isRefreshing={isRefreshing} />
  );
}

export default MapPage;
