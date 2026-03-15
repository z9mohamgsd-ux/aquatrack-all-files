import { useEffect, useRef } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  Droplets,
  Thermometer,
  Activity,
  Zap,
  CheckCircle,
} from 'lucide-react';
import type { Alert as AlertType } from '@/types';
import { cn } from '@/lib/utils';

interface AlertToastProps {
  alert: AlertType;
  onDismiss: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
}

const parameterIcons = {
  ph: Droplets,
  temperature: Thermometer,
  turbidity: Activity,
  conductivity: Zap,
};

const severityConfig = {
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

function AlertToast({ alert, onDismiss, onResolve }: AlertToastProps) {
  const severity = alert.severity || (alert.type === 'high' ? 'critical' : 'warning');
  const config = severityConfig[severity] || severityConfig.warning;
  const ParamIcon = parameterIcons[alert.parameter] || Activity;
  const SeverityIcon = config.icon;

  return (
    <Alert className={cn('relative', config.className)}>
      <div className="flex items-start gap-3">
        <SeverityIcon className={cn('h-5 w-5 mt-0.5', config.titleColor)} />
        <div className="flex-1">
          <AlertTitle className={cn('text-sm font-semibold', config.titleColor)}>
            <ParamIcon className="mr-1 inline h-4 w-4" />
            {alert.parameter.charAt(0).toUpperCase() + alert.parameter.slice(1)} Alert
          </AlertTitle>
          <AlertDescription className="mt-1 text-sm">
            {alert.message}
          </AlertDescription>
          {alert.deviceName && (
            <p className="mt-1 text-xs text-muted-foreground">
              Device: {alert.deviceName}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          {onResolve && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onResolve(alert.id)}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onDismiss(alert.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );
}

interface AlertContainerProps {
  alerts: AlertType[];
  onDismiss: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
}

export function AlertContainer({ alerts, onDismiss, onResolve }: AlertContainerProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <AlertToast
          key={alert.id}
          alert={alert}
          onDismiss={onDismiss}
          onResolve={onResolve}
        />
      ))}
    </div>
  );
}

export default AlertToast;
