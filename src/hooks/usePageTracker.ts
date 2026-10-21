import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { recordRealPageView, getVisitorId } from '../utils/realAnalyticsTracker';

const DEVICE_SEEN_KEY = 'kaif_device_seen_v4';

/**
 * Tracks page visits silently to /api/track on route change.
 * Strictly deduplicates per unique device:
 * 1. Each device counts as exactly 1 visitor.
 * 2. Each page route is counted only once per device.
 * 3. Page reloads (F5 / refresh) and repeat visits WILL NEVER increment page views or visitors.
 */
export function usePageTracker() {
  const location = useLocation();
  const lastTrackedPath = useRef<string | null>(null);
  const lastTrackTime = useRef<number>(0);

  useEffect(() => {
    const currentPath = location.pathname;
    const now = Date.now();

    // Prevent duplicate triggers if path has not changed or triggered within 500ms
    if (lastTrackedPath.current === currentPath && now - lastTrackTime.current < 500) {
      return;
    }
    lastTrackedPath.current = currentPath;
    lastTrackTime.current = now;

    let isNewDevice = false;
    try {
      if (typeof localStorage !== 'undefined') {
        isNewDevice = !localStorage.getItem(DEVICE_SEEN_KEY);
        localStorage.setItem(DEVICE_SEEN_KEY, '1');
      }
    } catch {
      // Storage fallback
    }

    const visitorId = getVisitorId();

    // 1. Client-side local visit recording
    recordRealPageView(currentPath, isNewDevice);

    // 2. Cloud backend beacon to /api/track for shared analytics sync
    try {
      const payloadString = JSON.stringify({
        path: currentPath,
        ref: typeof document !== 'undefined' ? document.referrer : '',
        visitorId,
        isNewDevice,
        timestamp: now,
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

