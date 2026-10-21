import { useState, useEffect, useCallback, useRef } from 'react';
import type { AnalyticsPeriod, AnalyticsData } from '../data/analytics';
import { getRealAnalyticsForPeriod } from '../utils/realAnalyticsTracker';

interface UseAnalyticsResult {
  data: AnalyticsData;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const CACHE_STORAGE_KEY = 'kaif_analytics_server_cache_v6_';

function getCachedData(period: AnalyticsPeriod): AnalyticsData | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = window.sessionStorage.getItem(`${CACHE_STORAGE_KEY}${period}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.visitors === 'number' && Array.isArray(parsed.series)) {
          return parsed;
        }
      }
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

function setCachedData(period: AnalyticsPeriod, data: AnalyticsData) {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(`${CACHE_STORAGE_KEY}${period}`, JSON.stringify(data));
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Returns the best immediate analytics data: cached server data or local real analytics.
 * This guarantees 0ms instantaneous loading and zero render lag.
 */
function getBestImmediateData(period: AnalyticsPeriod): AnalyticsData {
  const cached = getCachedData(period);
  const local = getRealAnalyticsForPeriod(period);

  if (cached && Array.isArray(cached.series)) {
    // Merge so the higher counts are always prioritized (prevents any data loss)
    return {
      ...cached,
      visitors: Math.max(cached.visitors, local.visitors),
      pageviews: Math.max(cached.pageviews, local.pageviews),
      totalLifetimeVisitors: Math.max(cached.totalLifetimeVisitors ?? 0, local.totalLifetimeVisitors ?? 0),
      totalLifetimePageviews: Math.max(cached.totalLifetimePageviews ?? 0, local.totalLifetimePageviews ?? 0),
    };
  }

  return local;
}

export function useAnalytics(period: AnalyticsPeriod): UseAnalyticsResult {
  // Pre-populate all 3 periods in memory for immediate 0ms switching
  const [dataMap, setDataMap] = useState<Record<AnalyticsPeriod, AnalyticsData>>(() => ({
    '24h': getBestImmediateData('24h'),
    '7d': getBestImmediateData('7d'),
    '30d': getBestImmediateData('30d'),
  }));

  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const isFetchingRef = useRef(false);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Instantaneous 0ms switch: data is guaranteed to exist
  const currentData = dataMap[period] ?? getBestImmediateData(period);

  // 1. Window focus listener: refetch when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetch]);

  // 2. Handle local pageview events (navigation within SPA)
  useEffect(() => {
    const handleUpdate = () => {
      // Instantly recompute all 3 periods locally without any delay
      const fresh24h = getRealAnalyticsForPeriod('24h');
      const fresh7d = getRealAnalyticsForPeriod('7d');
      const fresh30d = getRealAnalyticsForPeriod('30d');

      setDataMap((prev) => {
        const nextMap = {
          '24h': { ...fresh24h, pageviews: Math.max(fresh24h.pageviews, prev['24h']?.pageviews ?? 0) },
          '7d': { ...fresh7d, pageviews: Math.max(fresh7d.pageviews, prev['7d']?.pageviews ?? 0) },
          '30d': { ...fresh30d, pageviews: Math.max(fresh30d.pageviews, prev['30d']?.pageviews ?? 0) },
        };
        setCachedData('24h', nextMap['24h']);
        setCachedData('7d', nextMap['7d']);
        setCachedData('30d', nextMap['30d']);
        return nextMap;
      });
    };

    window.addEventListener('kaif_analytics_updated', handleUpdate);
    return () => {
      window.removeEventListener('kaif_analytics_updated', handleUpdate);
    };
  }, []);

  // 3. Background server synchronization (non-blocking, zero UI lag)
  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    async function syncServerData() {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setError(null);

      try {
        const response = await fetch(`/api/analytics?period=${period}`, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const serverData = (await response.json()) as AnalyticsData;
        if (!ignore && serverData && typeof serverData === 'object' && Array.isArray(serverData.series)) {
          setDataMap((prev) => {
            const current = prev[period] ?? getRealAnalyticsForPeriod(period);

            // CRITICAL PROTECTION: Never overwrite real local data with empty server data
            if (
              serverData.pageviews === 0 &&
              serverData.visitors === 0 &&
              (current.pageviews > 0 || current.visitors > 0)
            ) {
              return prev;
            }

            // Merge with local numbers so highest genuine traffic is preserved
            const merged: AnalyticsData = {
              ...serverData,
              visitors: Math.max(serverData.visitors, current.visitors),
              pageviews: Math.max(serverData.pageviews, current.pageviews),
              totalLifetimeVisitors: Math.max(
                serverData.totalLifetimeVisitors ?? 0,
                current.totalLifetimeVisitors ?? 0
              ),
              totalLifetimePageviews: Math.max(
                serverData.totalLifetimePageviews ?? 0,
                current.totalLifetimePageviews ?? 0
              ),
            };

            setCachedData(period, merged);
            return { ...prev, [period]: merged };
          });
        }
      } catch (err: any) {
        if (!ignore && err?.name !== 'AbortError') {
          // If server call fails, local data is already active and unharmed
          setError(null);
        }
      } finally {
        if (!ignore) {
          isFetchingRef.current = false;
        }
      }
    }

    void syncServerData();

    // Background poll every 45 seconds to keep counts live across devices
    const interval = setInterval(() => {
      void syncServerData();
    }, 45000);

    return () => {
      ignore = true;
      controller.abort();
      isFetchingRef.current = false;
      clearInterval(interval);
    };
  }, [period, refreshKey]);

  return { data: currentData, loading: false, error, refetch };
}
