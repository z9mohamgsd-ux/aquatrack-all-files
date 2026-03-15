import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Cpu,
  Wifi,
  WifiOff,
  MapPin,
  Clock,
  Droplets,
  Thermometer,
  Activity,
  Zap,
  RefreshCw,
  Plus,
  Trash2,
} from 'lucide-react';
import type { DeviceWithLocation } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface DeviceListProps {
  devices: DeviceWithLocation[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onRegister?: (name: string, deviceId: string) => Promise<void>;
  onDelete?: (deviceId: string) => Promise<void>;
}

export function DeviceList({
  devices,
  onRefresh,
  isRefreshing = false,
  onRegister,
  onDelete,
}: DeviceListProps) {
  const [showRegister, setShowRegister] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDeviceId, setNewDeviceId] = useState('');
  const [registering, setRegistering] = useState(false);

  const handleRegister = async () => {
    if (!onRegister || !newName || !newDeviceId) return;
    setRegistering(true);
    try {
      await onRegister(newName, newDeviceId);
      setNewName('');
      setNewDeviceId('');
      setShowRegister(false);
    } catch (error) {
      console.error('Error registering device:', error);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold">Devices</h2>
          <p className="text-sm text-muted-foreground">
            {devices.length} device{devices.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-1 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowRegister(!showRegister)}>
            <Plus className="mr-1 h-4 w-4" />
            Register Device
          </Button>
        </div>
      </div>

      {/* Register Form */}
      {showRegister && (
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="device-name">Device Name</Label>
                <Input
                  id="device-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Station Alpha"
                />
              </div>
              <div>
                <Label htmlFor="device-id">Device ID</Label>
                <Input
                  id="device-id"
                  value={newDeviceId}
                  onChange={(e) => setNewDeviceId(e.target.value)}
                  placeholder="e.g. station-001"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleRegister} disabled={registering || !newName || !newDeviceId}>
                  {registering ? 'Registering...' : 'Register'}
                </Button>
                <Button variant="ghost" onClick={() => setShowRegister(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Device Cards */}
      {devices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Cpu className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No devices registered</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Register a device to start monitoring water quality
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <Card key={device.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{device.name || device.deviceId}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">{device.deviceId}</p>
                  </div>
                  <Badge variant={device.status === 'connected' ? 'default' : 'secondary'}>
                    {device.status === 'connected' ? (
                      <><Wifi className="mr-1 h-3 w-3" /> Online</>
                    ) : (
                      <><WifiOff className="mr-1 h-3 w-3" /> Offline</>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {device.readings && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1 text-sm">
                      <Droplets className="h-3.5 w-3.5 text-blue-500" />
                      <span>pH: {device.readings.ph?.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Thermometer className="h-3.5 w-3.5 text-orange-500" />
                      <span>{device.readings.temperature?.toFixed(1)}°C</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Activity className="h-3.5 w-3.5 text-green-500" />
                      <span>{device.readings.turbidity?.toFixed(1)} NTU</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Zap className="h-3.5 w-3.5 text-purple-500" />
                      <span>{device.readings.conductivity?.toFixed(0)} µS</span>
                    </div>
                  </div>
                )}

                {device.latest_reading?.latitude && device.latest_reading?.longitude && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {device.latest_reading.latitude.toFixed(4)}, {device.latest_reading.longitude.toFixed(4)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  {device.last_seen && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(new Date(device.last_seen), { addSuffix: true })}</span>
                    </div>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(device.deviceId)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default DeviceList;
