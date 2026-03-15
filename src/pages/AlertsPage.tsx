import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Droplets,
  Thermometer,
  Activity,
  Zap,
  RefreshCw,
  CheckCheck,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Alert as AlertType } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const parameterIcons: Record<string, any> = {
  ph: Droplets,
  temperature: Thermometer,
  turbidity: Activity,
  conductivity: Zap,
};

const severityConfig: Record<string, any> = {
  info: {
    icon: Info,
    className: 'border-blue-500/50 bg-blue-500/10',
    titleColor: 'text-blue-700 dark:text-blue-300',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-amber-500/50 bg-amber-500/10',
    titleColor: 'text-amber-700 dark:text-amber-300',
  },
  critical: {
    icon: AlertCircle,
    className: 'border-red-500/50 bg-red-500/10',
    titleColor: 'text-red-700 dark:text-red-300',
  },
};

export function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getActiveAlerts();
      if (response.success) {
        setAlerts(response.data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleClear = async (alertId: string) => {
    try {
      await apiService.clearAlert(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (error) {
      console.error('Error clearing alert:', error);
    }
  };

  const filteredAlerts = filter === 'all'
    ? alerts
    : alerts.filter((a) => (a.severity || 'warning') === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Alerts
          </h2>
          <p className="text-sm text-muted-foreground">
            {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {(['all', 'critical', 'warning', 'info'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={fetchAlerts} disabled={isLoading}>
            <RefreshCw className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCheck className="h-12 w-12 text-emerald-500 mb-4" />
            <h3 className="text-lg font-semibold">All Clear</h3>
            <p className="text-sm text-muted-foreground mt-1">
              No active alerts at this time
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const severity = alert.severity || 'warning';
            const config = severityConfig[severity] || severityConfig.warning;
            const ParamIcon = parameterIcons[alert.parameter] || Activity;

            return (
              <Alert key={alert.id} className={config.className}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <config.icon className={`h-5 w-5 mt-0.5 ${config.titleColor}`} />
                    <div>
                      <AlertTitle className={config.titleColor}>
                        <ParamIcon className="mr-1 inline h-4 w-4" />
                        {alert.parameter.charAt(0).toUpperCase() + alert.parameter.slice(1)} -{' '}
                        {severity.charAt(0).toUpperCase() + severity.slice(1)}
                      </AlertTitle>
                      <AlertDescription className="mt-1">
                        {alert.message}
                      </AlertDescription>
                      <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                        {alert.deviceName && <span>Device: {alert.deviceName}</span>}
                        <span>Value: {alert.value}</span>
                        <span>{formatDistanceToNow(new Date(alert.triggered_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleClear(alert.id)}
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </Alert>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AlertsPage;
