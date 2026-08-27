import { useState, useEffect, useCallback } from 'react';
import type { AnalyticsPeriod, AnalyticsData } from '../data/analytics';

interface UseAnalyticsResult {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function generateMockSeries(period: AnalyticsPeriod) {
  const points = period === '24h' ? 24 : period === '7d' ? 7 : 30;
  const now = Date.now();
  const interval = period === '24h' ? 3600000 : 86400000;

  return Array.from({ length: points }, (_, i) => ({
    timestamp: now - (points - i) * interval,
    pageviews: Math.floor(Math.random() * 80) + 20,
    visitors: Math.floor(Math.random() * 40) + 10,
  }));
}

export function useAnalytics(period: AnalyticsPeriod): UseAnalyticsResult {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/analytics?period=${period}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const json = (await response.json()) as AnalyticsData;
        if (!ignore) {
          setData(json);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
          setData({
            pageviews: 1247,
            visitors: 423,
            series: generateMockSeries(period),
          });
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
