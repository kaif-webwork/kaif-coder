import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { recordRealPageView } from '../utils/realAnalyticsTracker';

/**
 * Tracks page visits silently to /api/track on route change
 * Also maintains real counts in localStorage starting from actual visits
 */
export function usePageTracker() {
  const location = useLocation();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const currentPath = location.pathname;
    if (lastTrackedPath.current === currentPath) return;
    lastTrackedPath.current = currentPath;

    // 1. Client-side real visit recording (0-based actual visits)
    recordRealPageView(currentPath);

    // 2. Silent backend beacon to /api/track for serverless production
    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const payload = new Blob([JSON.stringify({ path: currentPath, ref: document.referrer })], {
          type: 'application/json',
        });
        navigator.sendBeacon('/api/track', payload);
      } else {
        void fetch('/api/track', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ path: currentPath, ref: document.referrer }),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Fail silently for tracker
    }
  }, [location.pathname]);
}
