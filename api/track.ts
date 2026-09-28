import { Redis } from '@upstash/redis';

export const config = {
  runtime: 'edge',
};

declare const process: { env: Record<string, string | undefined> };

const KV_APP_KEY = 'r405x717';
const KV_BASE_URL = `https://keyvalue.immanuel.co/api/KeyVal`;

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

function toBase64Url(str: string): string {
  try {
    if (typeof Buffer !== 'undefined' && Buffer.from) {
      return Buffer.from(str).toString('base64url');
    }
  } catch {
    // edge fallback
  }
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return '';
  }
}

function fromBase64Url(str: string): string {
  try {
    if (typeof Buffer !== 'undefined' && Buffer.from) {
      return Buffer.from(str, 'base64url').toString('utf8');
    }
  } catch {
    // edge fallback
  }
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return '{}';
  }
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
    let body: { path?: string; ref?: string; visitorId?: string; isNewDevice?: boolean } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch {
      // sendBeacon payload fallback
    }

    const now = new Date();
    const today = getDateKey(now);
    const hour = String(now.getUTCHours()).padStart(2, '0');

    const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    const clientVisitorId = body.visitorId || 'v_anon';

    // Unique per-device hash (stable across days so repeat visits are deduplicated)
    const visitorHash = hashString(`${clientVisitorId}_${ip}`);
    const pvEntryKey = `${visitorHash}:${body.path || '/'}`;

    const redis = getRedis();

    // Strategy 1: Upstash Redis / Vercel KV (primary when configured)
    if (redis) {
      const pipeline = redis.pipeline();
      // 1. Unique visitors set (deduplicated per device)
      pipeline.sadd('uv:all', visitorHash);
      pipeline.sadd(`uv:${today}`, visitorHash);
      pipeline.sadd(`uvh:${today}:${hour}`, visitorHash);

      // 2. Unique pageviews set (deduplicated per device & route)
      pipeline.sadd('pvs:all', pvEntryKey);
      pipeline.sadd(`pvs:${today}`, pvEntryKey);
      pipeline.sadd(`pvsh:${today}:${hour}`, pvEntryKey);

      pipeline.expire(`uv:${today}`, 90 * 86400);
      pipeline.expire(`uvh:${today}:${hour}`, 7 * 86400);
      pipeline.expire(`pvs:${today}`, 90 * 86400);
      pipeline.expire(`pvsh:${today}:${hour}`, 7 * 86400);

      await pipeline.exec();

      return new Response(JSON.stringify({ ok: true, engine: 'redis' }), {
        headers: CORS_HEADERS,
      });
    }

    // Strategy 2: High-Availability Cloud Storage Fallback
    try {
      const getRes = await fetch(`${KV_BASE_URL}/GetValue/${KV_APP_KEY}/analytics`, {
        headers: { Accept: 'application/json' },
      });

      let currentData: any = {
        allVisitors: [],
        allPvKeys: [],
        daily: {},
      };

      if (getRes.ok) {
        try {
          const rawVal = await getRes.json();
          if (rawVal && typeof rawVal === 'string') {
            const decoded = fromBase64Url(rawVal);
            currentData = JSON.parse(decoded);
          }
        } catch {
          // ignore parsing error
        }
      }

      currentData.daily = currentData.daily || {};
      currentData.allVisitors = Array.isArray(currentData.allVisitors) ? currentData.allVisitors : [];
      currentData.allPvKeys = Array.isArray(currentData.allPvKeys) ? currentData.allPvKeys : [];

      if (!currentData.daily[today]) {
        currentData.daily[today] = {
          pageviews: 0,
          visitors: [],
          pvKeys: [],
          hourly: {},
          hourlyVisitors: {},
        };
      }

      const day = currentData.daily[today];
      day.pvKeys = Array.isArray(day.pvKeys) ? day.pvKeys : [];
      day.visitors = Array.isArray(day.visitors) ? day.visitors : [];
      day.hourly = day.hourly || {};
      day.hourlyVisitors = day.hourlyVisitors || {};
      day.hourlyVisitors[hour] = Array.isArray(day.hourlyVisitors[hour]) ? day.hourlyVisitors[hour] : [];

      const isAlreadyCountedVisitor = currentData.allVisitors.includes(visitorHash);
      const isAlreadyViewedPage = day.pvKeys.includes(pvEntryKey);

      // If already visited this route, DO NOT increment anything!
      if (isAlreadyViewedPage && isAlreadyCountedVisitor) {
        return new Response(JSON.stringify({ ok: true, deduplicated: true }), {
          headers: CORS_HEADERS,
        });
      }

      let changed = false;

      // Unique device visitor count
      if (!isAlreadyCountedVisitor) {
        currentData.allVisitors.push(visitorHash);
        if (!day.visitors.includes(visitorHash)) {
          day.visitors.push(visitorHash);
        }
        if (!day.hourlyVisitors[hour].includes(visitorHash)) {
          day.hourlyVisitors[hour].push(visitorHash);
        }
        changed = true;
      } else if (!day.visitors.includes(visitorHash) && day.visitors.length === 0) {
        day.visitors.push(visitorHash);
        changed = true;
      }

      // Unique pageview count
      if (!isAlreadyViewedPage) {
        day.pvKeys.push(pvEntryKey);
        day.pageviews = day.pvKeys.length;
        day.hourly[hour] = (Number(day.hourly[hour]) || 0) + 1;
        if (!currentData.allPvKeys.includes(pvEntryKey)) {
          currentData.allPvKeys.push(pvEntryKey);
        }
        changed = true;
      }

      if (changed) {
        // Keep last 35 days only to maintain lightweight storage
        const dateKeys = Object.keys(currentData.daily).sort();
        if (dateKeys.length > 35) {
          for (const oldKey of dateKeys.slice(0, dateKeys.length - 35)) {
            delete currentData.daily[oldKey];
          }
        }

        const encoded = toBase64Url(JSON.stringify(currentData));
        await fetch(`${KV_BASE_URL}/UpdateValue/${KV_APP_KEY}/analytics/${encoded}`, {
          method: 'POST',
        });
      }

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

