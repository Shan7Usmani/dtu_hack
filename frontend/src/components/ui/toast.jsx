import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

import { cn } from '../../lib/utils';

const ToastContext = createContext(null);

const TONE_STYLES = {
  danger: { icon: XCircle, className: 'text-destructive' },
  warn: { icon: AlertTriangle, className: 'text-warning' },
  signal: { icon: CheckCircle2, className: 'text-success' },
  info: { icon: Info, className: 'text-primary' },
};

let nextId = 0;

/**
 * Minimal toast host. Keeps the existing pushToast({ tone, title, message, ttl })
 * contract used by SessionContext.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const pushToast = useCallback(
    (toast) => {
      const id = ++nextId;
      const entry = { id, tone: 'info', ttl: 4200, ...toast };
      setToasts((prev) => [...prev.slice(-2), entry]);
      timers.current.set(id, setTimeout(() => dismiss(id), entry.ttl));
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => clearTimeout(timer));
      map.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ pushToast, dismiss }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(92vw,22rem)] flex-col gap-2"
      >
        {toasts.map((toast) => {
          const tone = TONE_STYLES[toast.tone] || TONE_STYLES.info;
          const Icon = tone.icon;
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'pointer-events-auto flex items-start gap-2.5 rounded-lg border bg-popover p-3 text-popover-foreground shadow-md',
                'animate-in slide-in-from-bottom-2 fade-in-0',
              )}
            >
              <Icon className={cn('mt-0.5 size-4 shrink-0', tone.className)} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium leading-snug">{toast.title}</p>
                {toast.message && (
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{toast.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="-mr-1 -mt-1 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Dismiss notification"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { pushToast: () => {}, dismiss: () => {} };
  return ctx;
}
