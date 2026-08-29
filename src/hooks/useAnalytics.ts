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
      setData(getRealAnalyticsForPeriod(period));
    };

    window.addEventListener('kaif_analytics_updated', handleUpdate);
    return () => {
      window.removeEventListener('kaif_analytics_updated', handleUpdate);
    };
  }, [period]);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      // Start with real local storage data
      const localRealData = getRealAnalyticsForPeriod(period);

      try {
        const response = await fetch(`/api/analytics?period=${period}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const json = (await response.json()) as AnalyticsData;
        if (!ignore) {
          // If server has real recorded counts > 0, prefer server data; otherwise use real local tracked data
          if (json && (json.pageviews > 0 || json.visitors > 0)) {
            setData(json);
          } else {
            setData(localRealData);
          }
        }
      } catch {
        if (!ignore) {
          // Fallback to real tracked local storage data starting from actual 0/real visits
          setData(localRealData);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      ignore = true;
    };
  }, [period, refreshKey]);

  return { data, loading, error, refetch };
}
