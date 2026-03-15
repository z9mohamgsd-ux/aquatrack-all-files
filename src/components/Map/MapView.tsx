import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Droplets, Thermometer, Activity, Zap } from 'lucide-react';
import type { DeviceWithLocation } from '@/types';

interface MapViewProps {
  devices: DeviceWithLocation[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function MapView({ devices }: MapViewProps) {
  const devicesWithLocation = devices.filter(
    (d) => d.latest_reading?.latitude && d.latest_reading?.longitude
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Device Map</h2>
        <p className="text-sm text-muted-foreground">
          Geographic overview of monitoring stations
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex h-[500px] items-center justify-center bg-muted/50">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Map View</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                {devicesWithLocation.length > 0
                  ? `${devicesWithLocation.length} device${devicesWithLocation.length !== 1 ? 's' : ''} with location data`
                  : 'No devices with GPS data available'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Interactive map requires Leaflet integration
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device location cards */}
      {devicesWithLocation.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devicesWithLocation.map((device) => (
            <Card key={device.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{device.name || device.deviceId}</CardTitle>
                  <Badge variant={device.status === 'connected' ? 'default' : 'secondary'}>
                    {device.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {device.latest_reading?.latitude?.toFixed(4)},{' '}
                    {device.latest_reading?.longitude?.toFixed(4)}
                  </span>
                </div>
                {device.readings && (
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className="flex items-center gap-1">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      pH: {device.readings.ph?.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Thermometer className="h-3 w-3 text-orange-500" />
                      {device.readings.temperature?.toFixed(1)}°C
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-green-500" />
                      {device.readings.turbidity?.toFixed(1)} NTU
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-purple-500" />
                      {device.readings.conductivity?.toFixed(0)} µS
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default MapView;
