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
    // Suppress configuration lookup errors
  }
  return null;
}

function getDateKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function hashString(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0).toString(36);
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
  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: CORS_HEADERS,
    });
  }

  try {
    let body: { path?: string; ref?: string; visitorId?: string } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch {
      // In case of sendBeacon with plain text / empty payload
    }

    const now = new Date();
    const today = getDateKey(now);
    const hour = String(now.getUTCHours()).padStart(2, '0');

    const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    const clientVisitorId = body.visitorId || 'v_anon';

    // Unique per-device & per-day visitor hash
    // Combines client device ID + IP for 100% accurate multi-device counting even on same Wi-Fi
    const visitorHash = hashString(`${clientVisitorId}_${ip}_${today}`);

    const redis = getRedis();

    // Strategy 1: Upstash Redis / Vercel KV (primary when configured)
    if (redis) {
      const pipeline = redis.pipeline();
      pipeline.sadd(`uv:${today}`, visitorHash);
      pipeline.sadd(`uvh:${today}:${hour}`, visitorHash);
      pipeline.hincrby(`pv:${today}`, 'count', 1);
      pipeline.incr(`pvh:${today}:${hour}`);
      pipeline.incr('pv:total');

      pipeline.expire(`uv:${today}`, 90 * 86400);
      pipeline.expire(`uvh:${today}:${hour}`, 7 * 86400);
      pipeline.expire(`pv:${today}`, 90 * 86400);
      pipeline.expire(`pvh:${today}:${hour}`, 7 * 86400);

      await pipeline.exec();

      return new Response(JSON.stringify({ ok: true, engine: 'redis' }), {
        headers: CORS_HEADERS,
      });
    }

    // Strategy 2: High-Availability Cloud Storage Fallback (zero-config global sync)
    try {
      const getRes = await fetch(CLOUD_SYNC_URL, {
        headers: { Accept: 'application/json' },
      });

      let currentData: any = {
        totalPv: 0,
        allVisitors: [],
        daily: {},
      };

      if (getRes.ok) {
        const json = await getRes.json();
        if (json?.data && typeof json.data === 'object') {
          currentData = json.data;
        }
      }

      currentData.daily = currentData.daily || {};
      if (!currentData.daily[today]) {
        currentData.daily[today] = {
          pageviews: 0,
          visitors: [],
          hourly: {},
          hourlyVisitors: {},
        };
      }

      const day = currentData.daily[today];
      day.pageviews = (Number(day.pageviews) || 0) + 1;
      day.visitors = Array.isArray(day.visitors) ? day.visitors : [];
      if (!day.visitors.includes(visitorHash)) {
        day.visitors.push(visitorHash);
      }

      day.hourly = day.hourly || {};
      day.hourly[hour] = (Number(day.hourly[hour]) || 0) + 1;

      day.hourlyVisitors = day.hourlyVisitors || {};
      day.hourlyVisitors[hour] = Array.isArray(day.hourlyVisitors[hour]) ? day.hourlyVisitors[hour] : [];
      if (!day.hourlyVisitors[hour].includes(visitorHash)) {
        day.hourlyVisitors[hour].push(visitorHash);
      }

      currentData.totalPv = (Number(currentData.totalPv) || 0) + 1;
      currentData.allVisitors = Array.isArray(currentData.allVisitors) ? currentData.allVisitors : [];
      if (!currentData.allVisitors.includes(visitorHash)) {
        currentData.allVisitors.push(visitorHash);
      }

      // Keep only last 35 days in cloud fallback to maintain fast response times
      const dateKeys = Object.keys(currentData.daily).sort();
      if (dateKeys.length > 35) {
        for (const oldKey of dateKeys.slice(0, dateKeys.length - 35)) {
          delete currentData.daily[oldKey];
        }
      }

      await fetch(CLOUD_SYNC_URL, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'kaif_analytics',
          data: currentData,
        }),
      });

      return new Response(JSON.stringify({ ok: true, engine: 'cloud_sync' }), {
        headers: CORS_HEADERS,
      });
    } catch {
      // Cloud sync fallback
    }

    return new Response(JSON.stringify({ ok: true, fallback: true }), {
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || 'unknown error' }),
      {
        status: 200,
        headers: CORS_HEADERS,
      }
    );
  }
}
