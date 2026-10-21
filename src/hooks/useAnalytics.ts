import { useState, useEffect, useCallback } from 'react';
import type { AnalyticsPeriod, AnalyticsData } from '../data/analytics';
import { getRealAnalyticsForPeriod } from '../utils/realAnalyticsTracker';

interface UseAnalyticsResult {
  data: AnalyticsData;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const CACHE_STORAGE_KEY = 'kaif_analytics_server_cache_v7_';

// Purge all obsolete, poisoned or zeroed caches from previous sessions
if (typeof window !== 'undefined' && window.sessionStorage) {
  try {
    const keysToRemove = [
      'kaif_analytics_server_cache_v6_24h',
      'kaif_analytics_server_cache_v6_7d',
      'kaif_analytics_server_cache_v6_30d',
      'kaif_analytics_server_cache_v5_24h',
      'kaif_analytics_server_cache_v5_7d',
      'kaif_analytics_server_cache_v5_30d',
      'kaif_analytics_server_cache_24h',
      'kaif_analytics_server_cache_7d',
      'kaif_analytics_server_cache_30d',
    ];
    keysToRemove.forEach((k) => window.sessionStorage.removeItem(k));
  } catch {
    // ignore
  }
}

function getCachedData(period: AnalyticsPeriod): AnalyticsData | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = window.sessionStorage.getItem(`${CACHE_STORAGE_KEY}${period}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed.visitors === 'number' &&
          parsed.visitors > 0 &&
          typeof parsed.pageviews === 'number' &&
          parsed.pageviews > 0 &&
          Array.isArray(parsed.series) &&
          parsed.series.length > 0
        ) {
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
      if (data && data.visitors > 0 && data.pageviews > 0 && Array.isArray(data.series) && data.series.length > 0) {
        window.sessionStorage.setItem(`${CACHE_STORAGE_KEY}${period}`, JSON.stringify(data));
      }
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Returns the best immediate analytics data: fresh cached server data or local real analytics.
 * Guarantees 0ms instantaneous loading and zero render lag across all 3 periods.
 */
function getBestImmediateData(period: AnalyticsPeriod): AnalyticsData {
  const cached = getCachedData(period);
  const local = getRealAnalyticsForPeriod(period);

  if (cached && Array.isArray(cached.series) && cached.series.length > 0) {
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

const ALL_PERIODS: AnalyticsPeriod[] = ['24h', '7d', '30d'];

export function useAnalytics(period: AnalyticsPeriod): UseAnalyticsResult {
  // Pre-populate all 3 periods in memory for immediate 0ms switching
  const [dataMap, setDataMap] = useState<Record<AnalyticsPeriod, AnalyticsData>>(() => ({
    '24h': getBestImmediateData('24h'),
    '7d': getBestImmediateData('7d'),
    '30d': getBestImmediateData('30d'),
  }));

  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Instantaneous 0ms switch: active period data is guaranteed to exist
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
        const nextMap: Record<AnalyticsPeriod, AnalyticsData> = {
          '24h': {
            ...fresh24h,
            pageviews: Math.max(fresh24h.pageviews, prev['24h']?.pageviews ?? 0),
            visitors: Math.max(fresh24h.visitors, prev['24h']?.visitors ?? 0),
          },
          '7d': {
            ...fresh7d,
            pageviews: Math.max(fresh7d.pageviews, prev['7d']?.pageviews ?? 0),
            visitors: Math.max(fresh7d.visitors, prev['7d']?.visitors ?? 0),
          },
          '30d': {
            ...fresh30d,
            pageviews: Math.max(fresh30d.pageviews, prev['30d']?.pageviews ?? 0),
            visitors: Math.max(fresh30d.visitors, prev['30d']?.visitors ?? 0),
          },
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

  // 3. Parallel synchronization of ALL 3 periods so 24H, 7D, and 30D are always distinct and fresh
  useEffect(() => {
    let ignore = false;

    async function syncAllPeriods() {
      setError(null);

      // Fetch all 3 periods in parallel (priority on active period)
      await Promise.all(
        ALL_PERIODS.map(async (p) => {
          try {
            const response = await fetch(`/api/analytics?period=${p}`, {
              headers: { Accept: 'application/json' },
            });

            if (!response.ok) return;

            const serverData = (await response.json()) as AnalyticsData;
            if (
              !ignore &&
              serverData &&
              typeof serverData === 'object' &&
              Array.isArray(serverData.series) &&
              serverData.series.length > 0 &&
              serverData.visitors > 0
            ) {
              setDataMap((prev) => {
                const current = prev[p] ?? getRealAnalyticsForPeriod(p);

                // Point-by-point merge so authentic counts are preserved
                const mergedSeries = serverData.series.map((serverPt, i) => {
                  const localPt = current.series?.[i];
                  return {
                    timestamp: serverPt.timestamp,
                    pageviews: Math.max(serverPt.pageviews, localPt?.pageviews ?? 0),
                    visitors: Math.max(serverPt.visitors, localPt?.visitors ?? 0),
                  };
                });

                const merged: AnalyticsData = {
                  ...serverData,
                  series: mergedSeries,
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

                setCachedData(p, merged);
                return { ...prev, [p]: merged };
              });
            }
          } catch {
            // Silently fall back to rock-solid local state
          }
        })
      );
    }

    void syncAllPeriods();

    // Background poll every 10 seconds to keep counts live across all devices
    const interval = setInterval(() => {
      void syncAllPeriods();
    }, 10000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [refreshKey]);

  return { data: currentData, loading: false, error, refetch };
}
