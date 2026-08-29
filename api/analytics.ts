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

        for (let i = points - 1; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 3600000);
          const dateKey = getDateKey(d);
          const hourKey = String(d.getUTCHours()).padStart(2, '0');
          timestamps.push(d.getTime());
          pipeline.get(`pvh:${dateKey}:${hourKey}`);
          pipeline.scard(`uvh:${dateKey}:${hourKey}`);
        }

        const results = await pipeline.exec();
        const series = timestamps.map((timestamp, i) => {
          const pv = Number(results[i * 2]) || 0;
          const uv = Number(results[i * 2 + 1]) || 0;
          return { timestamp, pageviews: pv, visitors: uv };
        });

        const totalPageviews = series.reduce((sum, p) => sum + p.pageviews, 0);
        const totalVisitors = series.reduce((sum, p) => sum + p.visitors, 0);

        return new Response(
          JSON.stringify({
            pageviews: totalPageviews,
            visitors: totalVisitors,
            series,
            growthVisitors: totalVisitors > 0 ? '↑ 100%' : '0%',
            growthPageviews: totalPageviews > 0 ? '↑ 100%' : '0%',
            isVisitorsUp: true,
            isPageviewsUp: true,
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

        const pvDiff = prevPv > 0 ? ((currPv - prevPv) / prevPv) * 100 : (currPv > 0 ? 100 : 0);
        const uvDiff = prevUv > 0 ? ((currUv - prevUv) / prevUv) * 100 : (currUv > 0 ? 100 : 0);

        return new Response(
          JSON.stringify({
            pageviews: currPv,
            visitors: currUv,
            series,
            growthVisitors: `${uvDiff >= 0 ? '↑' : '↓'} ${Math.abs(uvDiff).toFixed(1)}%`,
            growthPageviews: `${pvDiff >= 0 ? '↑' : '↓'} ${Math.abs(pvDiff).toFixed(1)}%`,
            isVisitorsUp: uvDiff >= 0,
            isPageviewsUp: pvDiff >= 0,
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
      // Fall through to 0-based fallback if Redis query fails
    }
  }

  // Pure 0-based initial real series when backend is clean
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
      growthVisitors: '0%',
      growthPageviews: '0%',
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
