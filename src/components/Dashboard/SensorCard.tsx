import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Droplets,
  Thermometer,
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import type { SensorStatus } from '@/types';

interface SensorCardProps {
  title: string;
  value: number;
  unit: string;
  icon: 'ph' | 'temperature' | 'turbidity' | 'conductivity';
  status: SensorStatus;
  min: number;
  max: number;
  history?: number[];
}

const iconMap = {
  ph: Droplets,
  temperature: Thermometer,
  turbidity: Activity,
  conductivity: Zap,
};

const statusColors = {
  safe: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-500 hover:bg-emerald-500',
    progress: 'bg-emerald-500',
    iconBg: 'bg-emerald-500/15',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
    text: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-500 hover:bg-amber-500',
    progress: 'bg-amber-500',
    iconBg: 'bg-amber-500/15',
  },
  danger: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/25',
    text: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-500 hover:bg-red-500',
    progress: 'bg-red-500',
    iconBg: 'bg-red-500/15',
  },
};

export function SensorCard({ title, value, unit, icon, status, min, max, history = [] }: SensorCardProps) {
  const Icon = iconMap[icon];
  const colors = statusColors[status.status];
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const trend = history.length >= 2
    ? history[history.length - 1] > history[history.length - 2]
      ? 'up'
      : history[history.length - 1] < history[history.length - 2]
      ? 'down'
      : 'stable'
    : 'stable';

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <Card className={`${colors.bg} ${colors.border} border`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={`rounded-lg p-2 ${colors.iconBg}`}>
            <Icon className={`h-5 w-5 ${colors.text}`} />
          </div>
          <Badge className={`${colors.badge} text-white text-xs`}>
            {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
          </Badge>
        </div>

        <div className="mt-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums tracking-tight">
              {value.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">{unit}</span>
            <TrendIcon className={`ml-auto h-4 w-4 ${colors.text}`} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colors.progress}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>

        <p className={`mt-2 text-xs ${colors.text}`}>{status.message}</p>

        {/* Mini sparkline */}
        {history.length > 2 && (
          <div className="mt-2 flex items-end gap-0.5 h-6">
            {history.slice(-12).map((v, i) => {
              const h = Math.max(4, ((v - min) / (max - min)) * 24);
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${colors.progress} opacity-60`}
                  style={{ height: `${h}px` }}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SensorCard;
