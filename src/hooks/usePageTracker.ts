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

  useEffect(() => {
    const currentPath = location.pathname;
    if (lastTrackedPath.current === currentPath) return;
    lastTrackedPath.current = currentPath;

    let isNewDevice = false;
    let isPathTrackedInSession = false;

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        isPathTrackedInSession = !!window.sessionStorage.getItem(`kaif_trk_${currentPath}`);
        window.sessionStorage.setItem(`kaif_trk_${currentPath}`, '1');
      }

      if (typeof localStorage !== 'undefined') {
        isNewDevice = !localStorage.getItem(DEVICE_SEEN_KEY);
        localStorage.setItem(DEVICE_SEEN_KEY, '1');
      }
    } catch {
      // Storage fallback
    }

    const visitorId = getVisitorId();

    // 1. Client-side local visit recording (strictly deduplicated per device)
    recordRealPageView(currentPath, isNewDevice);

    // If already tracked in this active session tab, avoid redundant network requests
    if (isPathTrackedInSession) {
      return;
    }

    // 2. Cloud backend beacon to /api/track for global shared multi-device sync
    // The server performs permanent deduplication so refreshes and repeat visits never increment counts
    try {
      const payloadString = JSON.stringify({
        path: currentPath,
        ref: typeof document !== 'undefined' ? document.referrer : '',
        visitorId,
        isNewDevice,
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

