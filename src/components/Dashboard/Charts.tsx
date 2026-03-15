import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Droplets, Thermometer, Activity } from 'lucide-react';
import type { SensorReading, TimeRange } from '@/types';
import { format, subHours, subDays, isAfter } from 'date-fns';

interface ChartsProps {
  data: SensorReading[];
  deviceId?: string;
}

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '1H', label: 'Last Hour' },
  { value: '24H', label: 'Last 24 Hours' },
  { value: '7D', label: 'Last 7 Days' },
  { value: '30D', label: 'Last 30 Days' },
];

export function Charts({ data }: ChartsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');
  const [activeCharts, setActiveCharts] = useState({
    ph: true,
    temperature: true,
    turbidity: false,
  });

  const filteredData = useMemo(() => {
    const now = new Date();
    let cutoff: Date;

    switch (timeRange) {
      case '1H':
        cutoff = subHours(now, 1);
        break;
      case '24H':
        cutoff = subHours(now, 24);
        break;
      case '7D':
        cutoff = subDays(now, 7);
        break;
      case '30D':
        cutoff = subDays(now, 30);
        break;
      default:
        cutoff = subHours(now, 24);
    }

    return data
      .filter((reading) => {
        const readingDate = new Date(reading.recorded_at || reading.timestamp);
        return isAfter(readingDate, cutoff);
      })
      .map((reading) => ({
        ...reading,
        time: format(
          new Date(reading.recorded_at || reading.timestamp),
          timeRange === '1H' ? 'HH:mm' : timeRange === '24H' ? 'HH:mm' : 'MMM dd'
        ),
      }));
  }, [data, timeRange]);

  const toggleChart = (key: keyof typeof activeCharts) => {
    setActiveCharts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sensor Trends
          </CardTitle>
          <div className="flex gap-1">
            {timeRangeOptions.map((option) => (
              <Button
                key={option.value}
                variant={timeRange === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Badge
            variant={activeCharts.ph ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleChart('ph')}
          >
            <Droplets className="mr-1 h-3 w-3" />
            pH
          </Badge>
          <Badge
            variant={activeCharts.temperature ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleChart('temperature')}
          >
            <Thermometer className="mr-1 h-3 w-3" />
            Temperature
          </Badge>
          <Badge
            variant={activeCharts.turbidity ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleChart('turbidity')}
          >
            <Activity className="mr-1 h-3 w-3" />
            Turbidity
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {filteredData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            No data available for the selected time range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {activeCharts.ph && (
                <Line
                  type="monotone"
                  dataKey="ph"
                  stroke="hsl(201, 89%, 48%)"
                  strokeWidth={2}
                  dot={false}
                  name="pH"
                />
              )}
              {activeCharts.temperature && (
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="hsl(30, 80%, 55%)"
                  strokeWidth={2}
                  dot={false}
                  name="Temperature"
                />
              )}
              {activeCharts.turbidity && (
                <Line
                  type="monotone"
                  dataKey="turbidity"
                  stroke="hsl(160, 60%, 45%)"
                  strokeWidth={2}
                  dot={false}
                  name="Turbidity"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default Charts;
