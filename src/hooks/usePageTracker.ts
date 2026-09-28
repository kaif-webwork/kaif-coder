import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { recordRealPageView, getVisitorId } from '../utils/realAnalyticsTracker';

const DEVICE_ROUTES_KEY = 'kaif_device_visited_routes_v4';
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

    let visitedRoutes: string[] = [];
    let isNewDevice = false;

    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(DEVICE_ROUTES_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              visitedRoutes = parsed;
            }
          } catch {
            visitedRoutes = [];
          }
        }

        // If this device has already visited this route, DO NOT increment anything!
        if (visitedRoutes.includes(currentPath)) {
          return;
        }

        // Check if device is visiting the website for the very first time
        isNewDevice = !localStorage.getItem(DEVICE_SEEN_KEY);

        // Record this route as visited by this device permanently
        visitedRoutes.push(currentPath);
        localStorage.setItem(DEVICE_ROUTES_KEY, JSON.stringify(visitedRoutes));
        localStorage.setItem(DEVICE_SEEN_KEY, '1');
      }
    } catch {
      // Storage fallback
    }

    const visitorId = getVisitorId();

    // 1. Client-side local visit recording (strictly deduplicated)
    recordRealPageView(currentPath, isNewDevice);

    // 2. Silent backend beacon to /api/track for multi-device sync
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

