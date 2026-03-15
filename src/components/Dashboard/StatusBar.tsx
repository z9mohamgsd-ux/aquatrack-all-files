import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Sun,
  Moon,
  Cloud,
  Clock,
} from 'lucide-react';
import type { ConnectionStatus } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface StatusBarProps {
  connectionStatus: ConnectionStatus;
  lastUpdated?: Date;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  deviceCount?: number;
  connectedDevices?: number;
}

const connectionStatusColors = {
  websocket: 'bg-emerald-500',
  polling: 'bg-amber-500',
  disconnected: 'bg-red-500',
};

export function StatusBar({
  connectionStatus,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
  deviceCount = 0,
  connectedDevices = 0,
}: StatusBarProps) {
  const { theme, toggleTheme } = useTheme();
  const statusColor = connectionStatusColors[connectionStatus.type];

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${statusColor}`} />
        <Badge variant="secondary" className="text-xs">
          {connectionStatus.type === 'websocket'
            ? 'Live'
            : connectionStatus.type === 'polling'
            ? 'Polling'
            : 'Offline'}
        </Badge>
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {connectionStatus.type !== 'disconnected' ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        <span>
          Devices: {connectedDevices}/{deviceCount} online
        </span>
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Cloud className="h-3 w-3" />
        <span>24°C (65% RH)</span>
      </div>

      {lastUpdated && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-1 h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

export default StatusBar;
