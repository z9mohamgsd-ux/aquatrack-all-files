import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Map,
  Cpu,
  History,
  Bell,
  Settings,
  Droplets,
  Menu,
  X,
  Ticket,
  ShieldCheck,
  Power,
} from 'lucide-react';

interface SidebarProps {
  alertCount?: number;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ alertCount = 0, isOpen, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();

  const mainNavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/map', icon: Map, label: 'Map' },
    { to: '/devices', icon: Cpu, label: 'Devices' },
    { to: '/history', icon: History, label: 'History' },
  ];

  const systemNavItems = [
    { to: '/alerts', icon: Bell, label: 'Alerts' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const roleNavItems = [
    { to: '/tickets', icon: Ticket, label: 'Tickets', roles: ['owner', 'admin', 'user'] },
    { to: '/control-panel', icon: ShieldCheck, label: 'Control Panel', roles: ['owner'] },
  ].filter((item) => user && item.roles.includes(user.role));

  const ROLE_LABEL: Record<string, string> = {
    owner: 'Owner',
    admin: 'Admin',
    user: 'User',
  };

  const ROLE_COLOR: Record<string, string> = {
    owner: 'text-purple-400',
    admin: 'text-orange-400',
    user: 'text-muted-foreground',
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
    );

  const handleNavClick = () => {
    if (window.innerWidth < 1024) onToggle();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Droplets className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">AquaTrack</h1>
            <p className="text-xs text-muted-foreground">Water Monitoring</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-scroll flex-1 space-y-1 overflow-y-auto p-3">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Main
          </p>
          {mainNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navLinkClass} onClick={handleNavClick}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}

          <Separator className="my-3" />

          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            System
          </p>
          {systemNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass} onClick={handleNavClick}>
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.label === 'Alerts' && alertCount > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {alertCount}
                </Badge>
              )}
            </NavLink>
          ))}

          {roleNavItems.length > 0 && (
            <>
              <Separator className="my-3" />
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Management
              </p>
              {roleNavItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClass} onClick={handleNavClick}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
              {user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user?.email || 'Unknown'}
              </p>
              <p className={cn('text-xs', ROLE_COLOR[user?.role || 'user'])}>
                {ROLE_LABEL[user?.role || 'user']}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Power className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="fixed left-4 top-4 z-30 lg:hidden"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
    </>
  );
}

export default Sidebar;
