import { Redis } from '@upstash/redis';

declare const process: { env: Record<string, string | undefined> };

let redisInstance: Redis | null = null;

function getRedis(): Redis | null {
  if (redisInstance) return redisInstance;
  try {
    const env = typeof process !== 'undefined' ? process.env : undefined;
    if (env?.UPSTASH_REDIS_REST_URL && env?.UPSTASH_REDIS_REST_TOKEN) {
      redisInstance = Redis.fromEnv();
      return redisInstance;
    }
  } catch {
    // Fail silently if environment variables are not yet configured
  }
  return null;
}

function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
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
  const diff = ((curr - prev) / prev) * 100;
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

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const period = url.searchParams.get('period') || '7d';

  const redis = getRedis();
  const now = new Date();

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
          }),
          {
            headers: {
              'content-type': 'application/json',
              'cache-control': 'public, s-maxage=30, stale-while-revalidate=120',
            },
          }
        );
      } else {
        const days = period === '30d' ? 30 : 7;
        const pipeline = redis.pipeline();
        const timestamps: number[] = [];

        // Fetch current period + previous period for growth comparison
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
          }),
          {
            headers: {
              'content-type': 'application/json',
              'cache-control': 'public, s-maxage=30, stale-while-revalidate=120',
            },
          }
        );
      }
    } catch {
      // Fall through to fallback if Redis query fails
    }
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
    }),
    {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
