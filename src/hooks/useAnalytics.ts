import { useState, useEffect, useCallback } from 'react';
import type { AnalyticsPeriod, AnalyticsData } from '../data/analytics';
import { getRealAnalyticsForPeriod } from '../utils/realAnalyticsTracker';

interface UseAnalyticsResult {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAnalytics(period: AnalyticsPeriod): UseAnalyticsResult {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Listen for real-time local page view events
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const local = getRealAnalyticsForPeriod(period);
        setData((prev) => {
          // If server already gave higher counts, keep server or merge
          if (prev && (prev.pageviews > local.pageviews || prev.visitors > local.visitors)) {
            return {
              ...prev,
              pageviews: Math.max(prev.pageviews, local.pageviews),
              visitors: Math.max(prev.visitors, local.visitors),
            };
          }
          return local;
        });
      } catch {
        // safe ignore
      }
    };

    window.addEventListener('kaif_analytics_updated', handleUpdate);
    return () => {
      window.removeEventListener('kaif_analytics_updated', handleUpdate);
    };
  }, [period]);

  // Window focus listener: refetch when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetch]);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      setError(null);
      let localRealData: AnalyticsData;
      try {
        localRealData = getRealAnalyticsForPeriod(period);
      } catch {
        localRealData = {
          pageviews: 0,
          visitors: 0,
          series: [],
          growthVisitors: '0.0%',
          growthPageviews: '0.0%',
          growthVisitorsStatus: 'neutral',
          growthPageviewsStatus: 'neutral',
          isVisitorsUp: true,
          isPageviewsUp: true,
        };
      }

      // Show local data immediately if not loaded yet
      setData((curr) => curr || localRealData);

      try {
        const response = await fetch(`/api/analytics?period=${period}`, {
          headers: { Accept: 'application/json' },
        });

        const contentType = response.headers.get('content-type') || '';
        if (!response.ok || !contentType.includes('application/json')) {
          throw new Error(`HTTP ${response.status} or invalid content type`);
        }

        const json = (await response.json()) as AnalyticsData;
        if (!ignore && json && typeof json === 'object') {
          // If server returned valid series and counts
          if (json.pageviews > 0 || json.visitors > 0) {
            setData(json);
          } else if (localRealData.pageviews > 0 || localRealData.visitors > 0) {
            setData(localRealData);
          } else {
            setData(json);
          }
        }
      } catch {
        if (!ignore) {
          setData((prev) => prev || localRealData);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void fetchData();

    // Periodic background sync every 30 seconds
    const interval = setInterval(() => {
      void fetchData();
    }, 30000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [period, refreshKey]);

  return { data, loading, error, refetch };
}
