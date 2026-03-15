import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { History, Download, RefreshCw, Search, Droplets, Thermometer, Activity, Zap } from 'lucide-react';
import { apiService } from '@/services/api';
import type { SensorReading, DeviceWithLocation } from '@/types';
import { format } from 'date-fns';

export function HistoryPage() {
  const [devices, setDevices] = useState<DeviceWithLocation[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [hours, setHours] = useState('24');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDevices = useCallback(async () => {
    try {
      const response = await apiService.getAllDevices();
      if (response.success) {
        setDevices(response.data);
        if (response.data.length > 0 && !selectedDevice) {
          setSelectedDevice(response.data[0].deviceId);
        }
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  }, [selectedDevice]);

  const fetchHistory = useCallback(async () => {
    if (!selectedDevice) return;

    try {
      setIsLoading(true);
      const response = await apiService.getDeviceHistory(selectedDevice, parseInt(hours));
      if (response.success) {
        setReadings(response.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDevice, hours]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const exportCSV = () => {
    if (readings.length === 0) return;

    const headers = ['Time', 'pH', 'Temperature', 'Turbidity', 'Conductivity'];
    const rows = readings.map((r) => [
      r.recorded_at || r.timestamp,
      r.ph,
      r.temperature,
      r.turbidity,
      r.conductivity,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aquatrack-${selectedDevice}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            History
          </h2>
          <p className="text-sm text-muted-foreground">
            View historical sensor data
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={readings.length === 0}>
            <Download className="mr-1 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={fetchHistory} disabled={isLoading}>
            <RefreshCw className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Device</Label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((d) => (
                    <SelectItem key={d.deviceId} value={d.deviceId}>
                      {d.name || d.deviceId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Time Range</Label>
              <Select value={hours} onValueChange={setHours}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last Hour</SelectItem>
                  <SelectItem value="24">Last 24 Hours</SelectItem>
                  <SelectItem value="168">Last 7 Days</SelectItem>
                  <SelectItem value="720">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search readings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {readings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No history data</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedDevice
                  ? 'No readings found for the selected device and time range'
                  : 'Select a device to view history'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>
                    <span className="flex items-center gap-1">
                      <Droplets className="h-3.5 w-3.5" /> pH
                    </span>
                  </TableHead>
                  <TableHead>
                    <span className="flex items-center gap-1">
                      <Thermometer className="h-3.5 w-3.5" /> Temp
                    </span>
                  </TableHead>
                  <TableHead>
                    <span className="flex items-center gap-1">
                      <Activity className="h-3.5 w-3.5" /> Turbidity
                    </span>
                  </TableHead>
                  <TableHead>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5" /> Conductivity
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {readings.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell className="text-xs">
                      {format(new Date(reading.recorded_at || reading.timestamp), 'MMM dd HH:mm:ss')}
                    </TableCell>
                    <TableCell>{reading.ph.toFixed(2)}</TableCell>
                    <TableCell>{reading.temperature.toFixed(1)}°C</TableCell>
                    <TableCell>{reading.turbidity.toFixed(2)} NTU</TableCell>
                    <TableCell>{reading.conductivity.toFixed(0)} µS/cm</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default HistoryPage;
