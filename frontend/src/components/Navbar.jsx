import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Activity,
  Bell,
  ChevronDown,
  Eye,
  LayoutGrid,
  Menu,
  Moon,
  ShieldAlert,
} from 'lucide-react';

import { useSystem } from '../context/SessionContext';
import { cn } from '../lib/utils';
import { StatusBadge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

const PRIMARY = [
  { to: '/', label: 'Overview', end: true },
  { to: '/dashboard', label: 'Monitor' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/emergency', label: 'Emergency' },
];

const SECONDARY = [
  { to: '/emergency/contacts', label: 'Emergency contacts' },
  { to: '/driver', label: 'Session' },
  { to: '/system', label: 'System' },
  { to: '/technology', label: 'Technology' },
];

const ALL_LINKS = [...PRIMARY, ...SECONDARY];

function navClass({ isActive }) {
  return cn(
    'rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors',
    isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
  );
}

/** The product is dark-only. Shown as a fixed label rather than a control. */
function ThemeMenu() {
  return (
    <span className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground">
      <Moon className="size-3.5" />
      Dark
    </span>
  );
}

function LiveStatus() {
  const { online, fps, demoMode, activeIncident, riskScore } = useSystem();

  if (demoMode) {
    return <StatusBadge tone="warning">Demo</StatusBadge>;
  }
  if (activeIncident) {
    return <StatusBadge tone="danger">Incident open</StatusBadge>;
  }
  if (online === false) {
    return <StatusBadge tone="danger">Camera error</StatusBadge>;
  }
  if (online === null) {
    return <StatusBadge tone="neutral">Standby</StatusBadge>;
  }
  if (riskScore >= 70) {
    return <StatusBadge tone="danger">High risk</StatusBadge>;
  }
  return (
    <StatusBadge tone="success">
      Live
      <span className="font-mono text-[11px] font-normal tabular">{fps ? `${fps.toFixed(0)} fps` : ''}</span>
    </StatusBadge>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
          <Menu className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm p-0">
        <DialogHeader className="border-b px-4 py-4">
          <DialogTitle>Navigate</DialogTitle>
        </DialogHeader>
        <nav className="flex flex-col gap-0.5 p-2">
          {ALL_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </DialogContent>
    </Dialog>
  );
}

export default function Navbar() {
  const location = useLocation();
  const moreActive = SECONDARY.some((item) => location.pathname.startsWith(item.to));

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="page-gutter flex h-14 items-center gap-2">
        <Link to="/" className="mr-2 flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <span className="flex size-6 items-center justify-center rounded-md border bg-secondary">
            <Eye className="size-3.5 text-primary" />
          </span>
          Netrakshak
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
          {PRIMARY.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              {item.label}
            </NavLink>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors',
                moreActive
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
              )}
            >
              More
              <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {SECONDARY.map((item) => (
                <DropdownMenuItem key={item.to} asChild>
                  <Link to={item.to}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="mr-1 hidden sm:block">
            <LiveStatus />
          </div>
          <ThemeMenu />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
