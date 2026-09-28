declare const process: { env: Record<string, string | undefined> };

export const config = {
  runtime: 'edge',
};

const KV_APP_KEY = 'r405x717';
const KV_BASE_URL = 'https://keyvalue.immanuel.co/api/KeyVal';

async function getVal(key: string): Promise<string | null> {
  try {
    const res = await fetch(`${KV_BASE_URL}/GetValue/${KV_APP_KEY}/${key}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json == null || json === '') return null;
    return String(json);
  } catch {
    return null;
  }
}

function calculateGrowth(curr: number, prev: number) {
  if (curr === 0 && prev === 0) {
    return { text: '0.0%', status: 'neutral' as const, isUp: true };
  }
  if (prev === 0 && curr > 0) {
    return { text: '↑ 100.0%', status: 'up' as const, isUp: true };
  }
  if (prev > 0 && curr === 0) {
    return { text: '↓ 100.0%', status: 'down' as const, isUp: false };
  }
  const diff = ((curr - prev) / (prev || 1)) * 100;
  if (Math.abs(diff) < 0.05) {
    return { text: '0.0%', status: 'neutral' as const, isUp: true };
  }
  const sign = diff > 0 ? '↑' : '↓';
  return {
    text: `${sign} ${Math.abs(diff).toFixed(1)}%`,
    status: diff > 0 ? ('up' as const) : ('down' as const),
    isUp: diff >= 0,
  };
}

const CORS_HEADERS = {
  'content-type': 'application/json',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'Content-Type, Authorization',
  'x-content-type-options': 'nosniff',
  'cache-control': 'no-store, no-cache, must-revalidate',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  const url = new URL(req.url, 'http://localhost');
  const period = url.searchParams.get('period') || '7d';
  const now = new Date();

  try {
    // 1. Fetch total unique visitors & total unique pageviews across ALL users/devices
    const [rawTotUv, rawTotPv] = await Promise.all([
      getVal('tot_uv'),
      getVal('tot_pv'),
    ]);

    const totUv = Math.max(0, parseInt(rawTotUv || '0', 10));
    const totPv = Math.max(0, parseInt(rawTotPv || '0', 10));

    if (period === '24h') {
      const points = 24;
      const timestamps: number[] = [];
      const keysToFetch: string[] = [];

      for (let i = points - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 3600000);
        const dateKey = d.toISOString().slice(0, 10);
        const hourKey = String(d.getUTCHours()).padStart(2, '0');
        timestamps.push(d.getTime());
        keysToFetch.push(`uvh_${dateKey}_${hourKey}`, `pvh_${dateKey}_${hourKey}`);
      }

      const values = await Promise.all(keysToFetch.map(getVal));

      const series = timestamps.map((timestamp, i) => {
        const uv = parseInt(values[i * 2] || '0', 10);
        const pv = parseInt(values[i * 2 + 1] || '0', 10);
        return { timestamp, pageviews: pv, visitors: uv };
      });

      const todayKey = now.toISOString().slice(0, 10);
      const rawTodayUv = await getVal(`uv_${todayKey}`);
      const rawTodayPv = await getVal(`pv_${todayKey}`);
      const todayUv = Math.max(totUv, parseInt(rawTodayUv || '0', 10));
      const todayPv = Math.max(totPv, parseInt(rawTodayPv || '0', 10));

      if (series.length > 0) {
        const lastIdx = series.length - 1;
        if (series[lastIdx].pageviews === 0 && todayPv > 0) {
          series[lastIdx].pageviews = todayPv;
        }
        if (series[lastIdx].visitors === 0 && todayUv > 0) {
          series[lastIdx].visitors = todayUv;
        }
      }

      const uvGrowth = calculateGrowth(todayUv, 0);
      const pvGrowth = calculateGrowth(todayPv, 0);

      return new Response(
        JSON.stringify({
          pageviews: todayPv,
          visitors: todayUv,
          series,
          growthVisitors: uvGrowth.text,
          growthPageviews: pvGrowth.text,
          growthVisitorsStatus: uvGrowth.status,
          growthPageviewsStatus: pvGrowth.status,
          isVisitorsUp: uvGrowth.isUp,
          isPageviewsUp: pvGrowth.isUp,
          engine: 'shared_cloud',
        }),
        { headers: CORS_HEADERS }
      );
    } else {
      const days = period === '30d' ? 30 : 7;
      const timestamps: number[] = [];
      const keysToFetch: string[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        const dateKey = d.toISOString().slice(0, 10);
        timestamps.push(d.getTime());
        keysToFetch.push(`uv_${dateKey}`, `pv_${dateKey}`);
      }

      const values = await Promise.all(keysToFetch.map(getVal));

      let periodUvSum = 0;
      let periodPvSum = 0;

      const series = timestamps.map((timestamp, i) => {
        const uv = parseInt(values[i * 2] || '0', 10);
        const pv = parseInt(values[i * 2 + 1] || '0', 10);
        periodUvSum += uv;
        periodPvSum += pv;
        return { timestamp, pageviews: pv, visitors: uv };
      });

      // Display the global total across all devices (or period sum if higher)
      const displayVisitors = Math.max(totUv, periodUvSum);
      const displayPageviews = Math.max(totPv, periodPvSum);

      // If today is index days - 1, ensure series today reflects active counts
      if (series.length > 0) {
        const lastIdx = series.length - 1;
        if (series[lastIdx].pageviews === 0 && displayPageviews > 0) {
          series[lastIdx].pageviews = displayPageviews;
        }
        if (series[lastIdx].visitors === 0 && displayVisitors > 0) {
          series[lastIdx].visitors = displayVisitors;
        }
      }

      const uvGrowth = calculateGrowth(displayVisitors, 0);
      const pvGrowth = calculateGrowth(displayPageviews, 0);

      return new Response(
        JSON.stringify({
          pageviews: displayPageviews,
          visitors: displayVisitors,
          series,
          growthVisitors: uvGrowth.text,
          growthPageviews: pvGrowth.text,
          growthVisitorsStatus: uvGrowth.status,
          growthPageviewsStatus: pvGrowth.status,
          isVisitorsUp: uvGrowth.isUp,
          isPageviewsUp: pvGrowth.isUp,
          engine: 'shared_cloud',
        }),
        { headers: CORS_HEADERS }
      );
    }
  } catch (err: any) {
    const points = period === '24h' ? 24 : period === '7d' ? 7 : 30;
    const interval = period === '24h' ? 3600000 : 86400000;
    const baseTimestamp = Math.floor(now.getTime() / interval) * interval;
    const series = Array.from({ length: points }, (_, i) => ({
      timestamp: baseTimestamp - (points - 1 - i) * interval,
      pageviews: 0,
      visitors: 0,
    }));

    return new Response(
      JSON.stringify({
        pageviews: 0,
        visitors: 0,
        series,
        growthVisitors: '0.0%',
        growthPageviews: '0.0%',
        growthVisitorsStatus: 'neutral',
        growthPageviewsStatus: 'neutral',
        isVisitorsUp: true,
        isPageviewsUp: true,
        error: err?.message,
      }),
      { headers: CORS_HEADERS }
    );
  }
}
