'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getApiUrl } from '@/lib/api';
import { usePathname } from 'next/navigation';

interface TrackingContextValue {
  sessionId: string | null;
  trackClick: (label: string) => void;
}

const TrackingContext = createContext<TrackingContextValue>({
  sessionId: null,
  trackClick: () => {},
});

export function useTracking() {
  return useContext(TrackingContext);
}

const SESSION_KEY = 'jp_visitor_session';

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const initialized = useRef(false);
  const pathname = usePathname();

  function sendEvent(id: string, type: 'pageview' | 'click', label: string, path: string) {
    fetch(`${getApiUrl()}/api/track/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: id, type, label, path }),
    }).catch(() => undefined);
  }

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      let id = window.sessionStorage.getItem(SESSION_KEY);
      if (!id) {
        try {
          const res = await fetch(`${getApiUrl()}/api/track/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userAgent: navigator.userAgent,
              referrer: document.referrer,
            }),
          });
          const data = await res.json();
          id = data.id;
          if (id) window.sessionStorage.setItem(SESSION_KEY, id);
        } catch {
          /* tracking is best-effort */
        }
      }
      if (id) setSessionId(id);
    }

    init();
  }, []);

  useEffect(() => {
    if (!sessionId || !pathname) return;
    sendEvent(sessionId, 'pageview', document.title || pathname, pathname);
  }, [pathname, sessionId]);

  function trackClick(label: string) {
    if (sessionId) sendEvent(sessionId, 'click', label, window.location.pathname);
  }

  // Capture clicks on elements with a data-track attribute automatically.
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest('[data-track]');
      if (target && sessionId) {
        const label = target.getAttribute('data-track') || target.textContent || 'click';
        sendEvent(sessionId, 'click', label.trim().slice(0, 120), window.location.pathname);
      }
    }
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [sessionId]);

  return (
    <TrackingContext.Provider value={{ sessionId, trackClick }}>
      {children}
    </TrackingContext.Provider>
  );
}
