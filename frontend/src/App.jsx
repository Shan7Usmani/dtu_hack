import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ToastProvider } from './components/ui/toast';
import { TooltipProvider } from './components/ui/tooltip';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog';
import { SessionProvider, useSystem } from './context/SessionContext';
import { ThemeProvider } from './context/ThemeContext';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import AlertsPage from './pages/AlertsPage';
import SystemPage from './pages/SystemPage';
import DriverPage from './pages/DriverPage';
import Technology from './pages/Technology';
import EmergencyPage from './pages/EmergencyPage';
import ContactsPage from './pages/ContactsPage';

const SHORTCUTS = [
  { keys: '1', action: 'Overview' },
  { keys: '2', action: 'Monitor' },
  { keys: '3', action: 'Alerts' },
  { keys: '4', action: 'Analytics' },
  { keys: '5', action: 'Emergency' },
  { keys: '6', action: 'Emergency contacts' },
  { keys: '7', action: 'Session' },
  { keys: '8', action: 'System' },
  { keys: '9', action: 'Technology' },
  { keys: 'r', action: 'Refresh the polling loop' },
  { keys: '?', action: 'Show this dialog' },
];

const ROUTE_KEYS = {
  1: '/',
  2: '/dashboard',
  3: '/alerts',
  4: '/analytics',
  5: '/emergency',
  6: '/emergency/contacts',
  7: '/driver',
  8: '/system',
  9: '/technology',
};

function DemoNotice() {
  const { demoMode, setDemoMode } = useSystem();
  if (!demoMode) return null;
  return (
    <div className="mb-6 flex items-start justify-between gap-3 rounded-lg border border-warning/40 bg-warning/5 px-4 py-2.5">
      <p className="text-[12px] leading-relaxed text-foreground">
        <span className="font-medium">Demo mode is on.</span>{' '}
        <span className="text-muted-foreground">
          Drowsiness, phone and risk values are synthesised in the browser. No camera frames are analysed.
        </span>
      </p>
      <button
        type="button"
        onClick={() => setDemoMode(false)}
        className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
        aria-label="Turn demo mode off"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

function ShortcutDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Shortcuts are ignored while typing in a field.</DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-1.5">
          {SHORTCUTS.map((item) => (
            <li key={item.keys} className="flex items-center justify-between gap-4 text-[13px]">
              <span className="text-muted-foreground">{item.action}</span>
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                {item.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { online, lastUpdate, refresh } = useSystem();
  const [helpOpen, setHelpOpen] = useState(false);
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      const tag = target && target.tagName ? target.tagName : '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || target?.isContentEditable) return;

      if (event.key === '?') {
        event.preventDefault();
        setHelpOpen((value) => !value);
        return;
      }
      if (ROUTE_KEYS[event.key]) {
        event.preventDefault();
        navigate(ROUTE_KEYS[event.key]);
        return;
      }
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        refresh();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate, refresh]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:bg-background focus:px-3 focus:py-2 focus:text-[13px]"
      >
        Skip to content
      </a>

      <Navbar />

      <div className="page-gutter flex-1 pb-4 pt-6">
        <DemoNotice />
        <main id="main" key={location.pathname}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/emergency/contacts" element={<ContactsPage />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/system" element={<SystemPage />} />
            <Route path="/driver" element={<DriverPage />} />
            <Route path="/technology" element={<Technology />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>

      <ShortcutDialog open={helpOpen} onOpenChange={setHelpOpen} />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setHelpOpen(true)}
        className="fixed bottom-4 left-4 z-30 hidden text-[12px] text-muted-foreground sm:inline-flex"
      >
        Shortcuts <kbd className="font-mono">?</kbd>
      </Button>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SessionProvider>
          <TooltipProvider delayDuration={200}>
            <Router>
              <Shell />
            </Router>
          </TooltipProvider>
        </SessionProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
