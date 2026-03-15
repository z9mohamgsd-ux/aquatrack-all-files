import { useEffect, useState, useCallback, useMemo } from 'react';
import { SensorCard } from '@/components/Dashboard/SensorCard';
import { Charts } from '@/components/Dashboard/Charts';
import { StatusBar } from '@/components/Dashboard/StatusBar';
import { AlertContainer } from '@/components/Alerts/AlertToast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Cpu, Wifi, RefreshCw, AlertTriangle, MonitorCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import type { DeviceWithLocation, SensorReading, Alert, SensorStatus } from '@/types';

const THRESHOLDS = {
  ph: { min: 6.0, max: 8.5, unit: '' },
  temperature: { min: 15.0, max: 35.0, unit: '°C' },
  turbidity: { min: 0, max: 5.0, unit: 'NTU' },
  conductivity: { min: 100.0, max: 300.0, unit: 'µS/cm' },
};

function getValueStatus(value: number, min: number, max: number): SensorStatus {
  const warningZone = (max - min) * 0.1;

  if (value < min || value > max) {
    return {
      status: 'danger',
      severity: 'critical',
      message: value < min ? 'Below safe minimum' : 'Above safe maximum',
    };
  }

  if (value < min + warningZone || value > max - warningZone) {
    return {
      status: 'warning',
      severity: 'medium',
      message: 'Approaching unsafe levels',
    };
  }

  return { status: 'safe', severity: 'none', message: 'Within safe range' };
}

export function Dashboard() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<DeviceWithLocation[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const response = await apiService.getLatestData();
      if (response.success) {
        setDevices(response.data);
        const allReadings = response.data
          .filter((d) => d.readings)
          .map((d) => d.readings!);
        setReadings((prev) => [...prev, ...allReadings].slice(-1000));
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await apiService.getActiveAlerts();
      if (response.success) {
        setAlerts(response.data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchAlerts();
  }, [fetchData, fetchAlerts]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
      fetchAlerts();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData, fetchAlerts]);

  const handleDismissAlert = useCallback((alertId: string) => {
    setDismissedAlerts((prev) => new Set(prev).add(alertId));
  }, []);

  const handleResolveAlert = useCallback(async (alertId: string) => {
    try {
      await apiService.clearAlert(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  }, []);

  const latestReadings = useMemo(() => {
    const latest: Record<string, SensorReading> = {};
    readings.forEach((r) => {
      if (
        !latest[r.deviceId] ||
        new Date(r.timestamp) > new Date(latest[r.deviceId].timestamp)
      ) {
        latest[r.deviceId] = r;
      }
    });
    return latest;
  }, [readings]);

  const averageValues = useMemo(() => {
    const values = Object.values(latestReadings);
    if (values.length === 0) return null;

    return {
      ph: values.reduce((sum, r) => sum + r.ph, 0) / values.length,
      temperature: values.reduce((sum, r) => sum + r.temperature, 0) / values.length,
      turbidity: values.reduce((sum, r) => sum + r.turbidity, 0) / values.length,
      conductivity: values.reduce((sum, r) => sum + r.conductivity, 0) / values.length,
    };
  }, [latestReadings]);

  const getHistory = (parameter: 'ph' | 'temperature' | 'turbidity' | 'conductivity') => {
    return readings.slice(-20).map((r) => r[parameter]);
  };

  const visibleAlerts = alerts.filter((a) => !dismissedAlerts.has(a.id));
  const connectedDevices = devices.filter((d) => d.status === 'connected').length;

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StatusBar
        connectionStatus={{ type: 'polling' }}
        lastUpdated={lastUpdated}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
        deviceCount={devices.length}
        connectedDevices={connectedDevices}
      />

      {/* Alerts */}
      {visibleAlerts.length > 0 && (
        <AlertContainer
          alerts={visibleAlerts}
          onDismiss={handleDismissAlert}
          onResolve={handleResolveAlert}
        />
      )}

      {/* Device Status */}
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className={`rounded-lg p-3 ${connectedDevices > 0 ? 'bg-emerald-500/10' : 'bg-muted'}`}>
            <MonitorCheck className={`h-6 w-6 ${connectedDevices > 0 ? 'text-emerald-500' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <h3 className="font-semibold">Device Status</h3>
            {connectedDevices > 0 ? (
              <p className="text-sm text-muted-foreground">
                {connectedDevices} device{connectedDevices !== 1 ? 's' : ''} online
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Waiting for devices... Send data to start monitoring.
              </p>
            )}
          </div>
          <Badge variant="outline" className="ml-auto font-mono text-xs">
            POST /api/sensor-data
          </Badge>
        </CardContent>
      </Card>

      {/* Sensor Cards */}
      {averageValues ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SensorCard
            title="pH Level"
            value={averageValues.ph}
            unit={THRESHOLDS.ph.unit}
            icon="ph"
            status={getValueStatus(averageValues.ph, THRESHOLDS.ph.min, THRESHOLDS.ph.max)}
            min={THRESHOLDS.ph.min}
            max={THRESHOLDS.ph.max}
            history={getHistory('ph')}
          />
          <SensorCard
            title="Temperature"
            value={averageValues.temperature}
            unit={THRESHOLDS.temperature.unit}
            icon="temperature"
            status={getValueStatus(averageValues.temperature, THRESHOLDS.temperature.min, THRESHOLDS.temperature.max)}
            min={THRESHOLDS.temperature.min}
            max={THRESHOLDS.temperature.max}
            history={getHistory('temperature')}
          />
          <SensorCard
            title="Turbidity"
            value={averageValues.turbidity}
            unit={THRESHOLDS.turbidity.unit}
            icon="turbidity"
            status={getValueStatus(averageValues.turbidity, THRESHOLDS.turbidity.min, THRESHOLDS.turbidity.max)}
            min={THRESHOLDS.turbidity.min}
            max={THRESHOLDS.turbidity.max}
            history={getHistory('turbidity')}
          />
          <SensorCard
            title="Conductivity"
            value={averageValues.conductivity}
            unit={THRESHOLDS.conductivity.unit}
            icon="conductivity"
            status={getValueStatus(averageValues.conductivity, THRESHOLDS.conductivity.min, THRESHOLDS.conductivity.max)}
            min={THRESHOLDS.conductivity.min}
            max={THRESHOLDS.conductivity.max}
            history={getHistory('conductivity')}
          />
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Cpu className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No sensor data available</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Register a device and send data to start monitoring
            </p>
            <pre className="mt-4 rounded-lg bg-muted p-4 text-xs">
{`{
  "deviceId": "station-001",
  "ph": 7.2,
  "temperature": 25.1,
  "turbidity": 2.4,
  "conductivity": 210,
  "latitude": 30.0444,
  "longitude": 31.2357
}`}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <Charts data={readings} />
    </div>
  );
}

export default Dashboard;
