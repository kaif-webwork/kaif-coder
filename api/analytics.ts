import { Redis } from '@upstash/redis';

declare const process: { env: Record<string, string | undefined> };

const CLOUD_SYNC_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a0e6db00c02c66';

let redisInstance: Redis | null = null;

function getRedis(): Redis | null {
  if (redisInstance) return redisInstance;
  try {
    const env = typeof process !== 'undefined' ? process.env : undefined;
    const url = env?.UPSTASH_REDIS_REST_URL || env?.KV_REST_API_URL;
    const token = env?.UPSTASH_REDIS_REST_TOKEN || env?.KV_REST_API_TOKEN;

    if (url && token) {
      redisInstance = new Redis({ url, token });
      return redisInstance;
    }
  } catch {
    // Fail silently if environment variables are not yet configured
  }
  return null;
}

function getDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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
  'cache-control': 'public, s-maxage=10, stale-while-revalidate=60',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  const url = new URL(req.url);
  const period = url.searchParams.get('period') || '7d';

  const redis = getRedis();
  const now = new Date();

  // Strategy 1: Upstash Redis / Vercel KV
  if (redis) {
    try {
      if (period === '24h') {
        const points = 24;
        const pipeline = redis.pipeline();
        const timestamps: number[] = [];

        // Fetch 48 hours (24h current + 24h previous comparison)
        for (let i = points * 2 - 1; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 3600000);
          const dateKey = getDateKey(d);
          const hourKey = String(d.getUTCHours()).padStart(2, '0');
          if (i < points) {
            timestamps.push(d.getTime());
          }
          pipeline.get(`pvh:${dateKey}:${hourKey}`);
          pipeline.scard(`uvh:${dateKey}:${hourKey}`);
        }

        const results = await pipeline.exec();

        let prevPv = 0;
        let prevUv = 0;
        for (let i = 0; i < points; i++) {
          prevPv += Number(results[i * 2]) || 0;
          prevUv += Number(results[i * 2 + 1]) || 0;
        }

        const series = timestamps.map((timestamp, i) => {
          const idx = (points + i) * 2;
          const pv = Number(results[idx]) || 0;
          const uv = Number(results[idx + 1]) || 0;
          return { timestamp, pageviews: pv, visitors: uv };
        });

        const currPv = series.reduce((sum, p) => sum + p.pageviews, 0);
        const currUv = series.reduce((sum, p) => sum + p.visitors, 0);

        const uvGrowth = calculateGrowth(currUv, prevUv);
        const pvGrowth = calculateGrowth(currPv, prevPv);

        return new Response(
          JSON.stringify({
            pageviews: currPv,
            visitors: currUv,
            series,
            growthVisitors: uvGrowth.text,
            growthPageviews: pvGrowth.text,
            growthVisitorsStatus: uvGrowth.status,
            growthPageviewsStatus: pvGrowth.status,
            isVisitorsUp: uvGrowth.isUp,
            isPageviewsUp: pvGrowth.isUp,
            engine: 'redis',
          }),
          { headers: CORS_HEADERS }
        );
      } else {
        const days = period === '30d' ? 30 : 7;
        const pipeline = redis.pipeline();
        const timestamps: number[] = [];

        for (let i = days * 2 - 1; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 86400000);
          const dateKey = getDateKey(d);
          if (i < days) {
            timestamps.push(d.getTime());
          }
          pipeline.hget(`pv:${dateKey}`, 'count');
          pipeline.scard(`uv:${dateKey}`);
        }

        const results = await pipeline.exec();

        let prevPv = 0;
        let prevUv = 0;
        for (let i = 0; i < days; i++) {
          prevPv += Number(results[i * 2]) || 0;
          prevUv += Number(results[i * 2 + 1]) || 0;
        }

        const series = timestamps.map((timestamp, i) => {
          const idx = (days + i) * 2;
          const pv = Number(results[idx]) || 0;
          const uv = Number(results[idx + 1]) || 0;
          return { timestamp, pageviews: pv, visitors: uv };
        });

        const currPv = series.reduce((sum, p) => sum + p.pageviews, 0);
        const currUv = series.reduce((sum, p) => sum + p.visitors, 0);

        const uvGrowth = calculateGrowth(currUv, prevUv);
        const pvGrowth = calculateGrowth(currPv, prevPv);

        return new Response(
          JSON.stringify({
            pageviews: currPv,
            visitors: currUv,
            series,
            growthVisitors: uvGrowth.text,
            growthPageviews: pvGrowth.text,
            growthVisitorsStatus: uvGrowth.status,
            growthPageviewsStatus: pvGrowth.status,
            isVisitorsUp: uvGrowth.isUp,
            isPageviewsUp: pvGrowth.isUp,
            engine: 'redis',
          }),
          { headers: CORS_HEADERS }
        );
      }
    } catch {
      // Fall through to cloud sync fallback
    }
  }

  // Strategy 2: High-Availability Cloud Storage Fallback (zero-config global sync)
  try {
    const res = await fetch(CLOUD_SYNC_URL, {
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const json = await res.json();
      const cloudData = json?.data;
      if (cloudData && typeof cloudData === 'object') {
        const daily = cloudData.daily || {};

        if (period === '24h') {
          const points = 24;
          const series = [];
          let currPv = 0;
          let prevPv = 0;
          const currVisitors = new Set<string>();
          const prevVisitors = new Set<string>();

          for (let i = points - 1; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 3600000);
            const dateKey = getDateKey(d);
            const hourKey = String(d.getUTCHours()).padStart(2, '0');
            const timestamp = d.getTime();

            const dayData = daily[dateKey];
            const pv = Number(dayData?.hourly?.[hourKey]) || 0;
            const uvList = Array.isArray(dayData?.hourlyVisitors?.[hourKey])
              ? dayData.hourlyVisitors[hourKey]
              : [];
            const uv = uvList.length > 0 ? uvList.length : pv > 0 ? 1 : 0;

            uvList.forEach((v: string) => currVisitors.add(v));
            currPv += pv;
            series.push({ timestamp, pageviews: pv, visitors: uv });
          }

          // Previous 24h
          for (let i = points * 2 - 1; i >= points; i--) {
            const d = new Date(now.getTime() - i * 3600000);
            const dateKey = getDateKey(d);
            const hourKey = String(d.getUTCHours()).padStart(2, '0');

            const dayData = daily[dateKey];
            const pv = Number(dayData?.hourly?.[hourKey]) || 0;
            const uvList = Array.isArray(dayData?.hourlyVisitors?.[hourKey])
              ? dayData.hourlyVisitors[hourKey]
              : [];

            uvList.forEach((v: string) => prevVisitors.add(v));
            prevPv += pv;
          }

          const totalVisitors = currVisitors.size > 0 ? currVisitors.size : currPv > 0 ? 1 : 0;
          const totalPrevVisitors = prevVisitors.size > 0 ? prevVisitors.size : prevPv > 0 ? 1 : 0;

          const uvGrowth = calculateGrowth(totalVisitors, totalPrevVisitors);
          const pvGrowth = calculateGrowth(currPv, prevPv);

          return new Response(
            JSON.stringify({
              pageviews: currPv,
              visitors: totalVisitors,
              series,
              growthVisitors: uvGrowth.text,
              growthPageviews: pvGrowth.text,
              growthVisitorsStatus: uvGrowth.status,
              growthPageviewsStatus: pvGrowth.status,
              isVisitorsUp: uvGrowth.isUp,
              isPageviewsUp: pvGrowth.isUp,
              engine: 'cloud_sync',
            }),
            { headers: CORS_HEADERS }
          );
        } else {
          const days = period === '30d' ? 30 : 7;
          const series = [];
          let currPv = 0;
          let prevPv = 0;
          const currVisitors = new Set<string>();
          const prevVisitors = new Set<string>();

          for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 86400000);
            const dateKey = getDateKey(d);
            const timestamp = d.getTime();

            const dayData = daily[dateKey];
            const pv = Number(dayData?.pageviews) || 0;
            const uvList = Array.isArray(dayData?.visitors) ? dayData.visitors : [];
            const uv = uvList.length > 0 ? uvList.length : pv > 0 ? 1 : 0;

            uvList.forEach((v: string) => currVisitors.add(v));
            currPv += pv;
            series.push({ timestamp, pageviews: pv, visitors: uv });
          }

          // Previous period
          for (let i = days * 2 - 1; i >= days; i--) {
            const d = new Date(now.getTime() - i * 86400000);
            const dateKey = getDateKey(d);

            const dayData = daily[dateKey];
            const pv = Number(dayData?.pageviews) || 0;
            const uvList = Array.isArray(dayData?.visitors) ? dayData.visitors : [];

            uvList.forEach((v: string) => prevVisitors.add(v));
            prevPv += pv;
          }

          const totalVisitors = currVisitors.size > 0 ? currVisitors.size : currPv > 0 ? 1 : 0;
          const totalPrevVisitors = prevVisitors.size > 0 ? prevVisitors.size : prevPv > 0 ? 1 : 0;

          const uvGrowth = calculateGrowth(totalVisitors, totalPrevVisitors);
          const pvGrowth = calculateGrowth(currPv, prevPv);

          return new Response(
            JSON.stringify({
              pageviews: currPv,
              visitors: totalVisitors,
              series,
              growthVisitors: uvGrowth.text,
              growthPageviews: pvGrowth.text,
              growthVisitorsStatus: uvGrowth.status,
              growthPageviewsStatus: pvGrowth.status,
              isVisitorsUp: uvGrowth.isUp,
              isPageviewsUp: pvGrowth.isUp,
              engine: 'cloud_sync',
            }),
            { headers: CORS_HEADERS }
          );
        }
      }
    }
  } catch {
    // Cloud sync lookup failed
  }

  // Pure 0-based initial fallback series when backend is empty
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
      engine: 'fallback',
    }),
    { headers: CORS_HEADERS }
  );
}
