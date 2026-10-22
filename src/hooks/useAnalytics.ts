import { useState, useEffect, useCallback } from 'react';
import type { AnalyticsPeriod, AnalyticsData } from '../data/analytics';
import { getHistoricalBaselineForPeriod, purgePoisonedStorage } from '../utils/realAnalyticsTracker';

interface UseAnalyticsResult {
  data: AnalyticsData;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const CACHE_STORAGE_KEY = 'kaif_analytics_server_v12_';

const POISONED_SESSION_KEYS = [
  'kaif_analytics_server_cache_v7_24h',
  'kaif_analytics_server_cache_v7_7d',
  'kaif_analytics_server_cache_v7_30d',
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

function purgeAllStorage() {
  purgePoisonedStorage();
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      POISONED_SESSION_KEYS.forEach((k) => window.sessionStorage.removeItem(k));
    } catch {
      // Ignore storage restrictions
    }
  }
}

// Immediate execution on import
purgeAllStorage();

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
 * Returns immediate analytics data for 0ms initial render:
 * 1. Fresh server data cached from this session if present.
 * 2. Clean baseline mathematical model (identical on all devices, NEVER poisoned by local storage).
 */
function getBestImmediateData(period: AnalyticsPeriod): AnalyticsData {
  const cached = getCachedData(period);
  if (cached && Array.isArray(cached.series) && cached.series.length > 0) {
    return cached;
  }
  return getHistoricalBaselineForPeriod(period);
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

  // 2. Refetch when local navigation triggers an update
  useEffect(() => {
    const handleUpdate = () => {
      refetch();
    };
    window.addEventListener('kaif_analytics_updated', handleUpdate);
    return () => {
      window.removeEventListener('kaif_analytics_updated', handleUpdate);
    };
  }, [refetch]);

  // 3. Parallel synchronization of ALL 3 periods directly from the authoritative server API
  useEffect(() => {
    let ignore = false;
    purgeAllStorage();

    async function syncAllPeriods() {
      setError(null);

      // Fetch all 3 periods in parallel (active period + remaining)
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
              typeof serverData.visitors === 'number' &&
              serverData.visitors > 0
            ) {
              // Authoritative assignment: server is the SOLE source of truth (SSOT)
              // No local Math.max inflation, ensuring 100% device synchronization
              setDataMap((prev) => ({
                ...prev,
                [p]: serverData,
              }));
              setCachedData(p, serverData);
            }
          } catch {
            // Silently retain current clean state
          }
        })
      );
    }

    void syncAllPeriods();

    // Background poll every 8 seconds to keep counts live and 100% in sync across all devices
    const interval = setInterval(() => {
      void syncAllPeriods();
    }, 8000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [refreshKey]);

  return { data: currentData, loading: false, error, refetch };
}
