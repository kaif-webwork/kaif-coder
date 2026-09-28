import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { recordRealPageView, getVisitorId } from '../utils/realAnalyticsTracker';

/**
 * Tracks page visits silently to /api/track on route change
 * Sends visitorId so multi-device visitors are uniquely identified
 */
export function usePageTracker() {
  const location = useLocation();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const currentPath = location.pathname;
    if (lastTrackedPath.current === currentPath) return;
    lastTrackedPath.current = currentPath;

    // 1. Client-side local visit recording
    recordRealPageView(currentPath);

    // 2. Silent backend beacon to /api/track for multi-device sync
    try {
      const visitorId = getVisitorId();
      const payloadString = JSON.stringify({
        path: currentPath,
        ref: typeof document !== 'undefined' ? document.referrer : '',
        visitorId,
        timestamp: Date.now(),
      });

      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const payload = new Blob([payloadString], {
          type: 'application/json',
        });
        navigator.sendBeacon('/api/track', payload);
      } else if (typeof fetch !== 'undefined') {
        void fetch('/api/track', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: payloadString,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Fail silently for tracker
    }
  }, [location.pathname]);
}
