import { useState, useEffect, useCallback, useRef } from 'react';
import type { AnalyticsPeriod, AnalyticsData } from '../data/analytics';
import { calculateAccurateGrowth } from '../utils/realAnalyticsTracker';

interface UseAnalyticsResult {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const CACHE_STORAGE_KEY = 'kaif_analytics_server_cache_v5_';

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

export function useAnalytics(period: AnalyticsPeriod): UseAnalyticsResult {
  // Initialize with cached server data if available so there is ZERO number flicker on refresh
  const [data, setData] = useState<AnalyticsData | null>(() => getCachedData(period));
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const isFetchingRef = useRef(false);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // 1. Instantaneous 0ms switch when clicking 24H, 7D, or 30D tabs
  const [prevPeriod, setPrevPeriod] = useState(period);
  if (prevPeriod !== period) {
    setPrevPeriod(period);
    const cached = getCachedData(period);
    setData(cached);
    setLoading(!cached);
  }

  // 2. Prefetch all 3 periods in the background after initial render has settled
  useEffect(() => {
    const timer = setTimeout(() => {
      const periodsToPrefetch: AnalyticsPeriod[] = ['24h', '7d', '30d'];
      periodsToPrefetch.forEach((p) => {
        fetch(`/api/analytics?period=${p}`, { headers: { Accept: 'application/json' } })
          .then((res) => (res.ok ? res.json() : null))
          .then((json) => {
            if (json && Array.isArray(json.series)) {
              setCachedData(p, json);
            }
          })
          .catch(() => {});
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, []);


  // 3. Window focus listener: refetch when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetch]);

  // 4. Handle local pageview events (navigation within SPA)
  useEffect(() => {
    const handleUpdate = () => {
      setData((prev) => {
        if (!prev) return null;
        const nextPv = prev.pageviews + 1;
        const nextSeries = prev.series.map((pt, i) => {
          if (i === prev.series.length - 1) {
            return { ...pt, pageviews: pt.pageviews + 1 };
          }
          return pt;
        });

        const uvGrowth = calculateAccurateGrowth(prev.visitors, 0, nextSeries, 'visitors');
        const pvGrowth = calculateAccurateGrowth(nextPv, 0, nextSeries, 'pageviews');

        const updated: AnalyticsData = {
          ...prev,
          pageviews: nextPv,
          series: nextSeries,
          growthVisitors: uvGrowth.text,
          growthPageviews: pvGrowth.text,
          growthVisitorsStatus: uvGrowth.status,
          growthPageviewsStatus: pvGrowth.status,
          isVisitorsUp: uvGrowth.isUp,
          isPageviewsUp: pvGrowth.isUp,
        };

        setCachedData(period, updated);
        return updated;
      });

      // Refetch from server in background to sync authoritative state
      refetch();
    };

    window.addEventListener('kaif_analytics_updated', handleUpdate);
    return () => {
      window.removeEventListener('kaif_analytics_updated', handleUpdate);
    };
  }, [period, refetch]);

  // 5. Fetch accurate analytics from server API for active period
  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setError(null);

      // Only show loading if we don't even have cached data
      const cached = getCachedData(period);
      if (!cached) {
        setLoading(true);
      }

      try {
        const response = await fetch(`/api/analytics?period=${period}`, {
          headers: { Accept: 'application/json' },
        });

        const contentType = response.headers.get('content-type') || '';
        if (!response.ok || !contentType.includes('application/json')) {
          throw new Error(`HTTP ${response.status} or invalid content type`);
        }

        const json = (await response.json()) as AnalyticsData;
        if (!ignore && json && typeof json === 'object' && Array.isArray(json.series)) {
          setData(json);
          setCachedData(period, json);
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err?.message || 'Failed to load analytics');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          isFetchingRef.current = false;
        }
      }
    }

    void fetchData();

    // Background sync every 30 seconds
    const interval = setInterval(() => {
      void fetchData();
    }, 30000);

    return () => {
      ignore = true;
      isFetchingRef.current = false;
      clearInterval(interval);
    };
  }, [period, refreshKey]);

  return { data, loading, error, refetch };
}
