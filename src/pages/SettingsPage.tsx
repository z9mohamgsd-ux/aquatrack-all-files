import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Bell, Moon, Database, Shield, Save, RotateCcw, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: true,
    soundAlerts: true,
    autoRefresh: true,
    refreshInterval: 5,
    dataRetention: 30,
    emailAlerts: false,
    emailAddress: '',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('aquatrack-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSettings({
      notifications: true,
      soundAlerts: true,
      autoRefresh: true,
      refreshInterval: 5,
      dataRetention: 30,
      emailAlerts: false,
      emailAddress: '',
    });
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Settings
          </h2>
          <p className="text-sm text-muted-foreground">Configure your monitoring preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-1 h-4 w-4" /> Reset
          </Button>
          <Button size="sm" onClick={handleSave}>
            {saved ? <Check className="mr-1 h-4 w-4" /> : <Save className="mr-1 h-4 w-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" /> Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel of the dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">Choose between light and dark mode</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                Dark
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notifications
          </CardTitle>
          <CardDescription>Configure alert notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive browser notifications for alerts</p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(v) => updateSetting('notifications', v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Sound Alerts</Label>
              <p className="text-sm text-muted-foreground">Play sound when critical alerts trigger</p>
            </div>
            <Switch
              checked={settings.soundAlerts}
              onCheckedChange={(v) => updateSetting('soundAlerts', v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Alerts</Label>
              <p className="text-sm text-muted-foreground">Send critical alerts to email</p>
            </div>
            <Switch
              checked={settings.emailAlerts}
              onCheckedChange={(v) => updateSetting('emailAlerts', v)}
            />
          </div>
          {settings.emailAlerts && (
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={settings.emailAddress}
                onChange={(e) => updateSetting('emailAddress', e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" /> Data & Refresh
          </CardTitle>
          <CardDescription>Configure data refresh and retention</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Refresh</Label>
              <p className="text-sm text-muted-foreground">Automatically refresh data</p>
            </div>
            <Switch
              checked={settings.autoRefresh}
              onCheckedChange={(v) => updateSetting('autoRefresh', v)}
            />
          </div>
          {settings.autoRefresh && (
            <div>
              <Label htmlFor="interval">Refresh Interval (seconds)</Label>
              <Input
                id="interval"
                type="number"
                min={1}
                max={60}
                value={settings.refreshInterval}
                onChange={(e) => updateSetting('refreshInterval', parseInt(e.target.value))}
              />
            </div>
          )}
          <Separator />
          <div>
            <Label htmlFor="retention">Data Retention (days)</Label>
            <Input
              id="retention"
              type="number"
              min={1}
              max={365}
              value={settings.dataRetention}
              onChange={(e) => updateSetting('dataRetention', parseInt(e.target.value))}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Historical data older than this will be archived
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsPage;
