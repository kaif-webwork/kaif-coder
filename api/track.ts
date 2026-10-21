import { Redis } from '@upstash/redis';

export const config = {
  runtime: 'edge',
};

declare const process: { env: Record<string, string | undefined> };

const KV_APP_KEY = 'r405x717';
const KV_BASE_URL = 'https://keyvalue.immanuel.co/api/KeyVal';

let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  if (redisClient) return redisClient;
  try {
    const env = typeof process !== 'undefined' ? process.env : undefined;
    const url = env?.UPSTASH_REDIS_REST_URL || env?.KV_REST_API_URL;
    const token = env?.UPSTASH_REDIS_REST_TOKEN || env?.KV_REST_API_TOKEN;

    if (url && token) {
      redisClient = new Redis({ url, token });
      return redisClient;
    }
  } catch {
    // Fail silently
  }
  return null;
}

// In-memory sliding rate limiter per Edge instance
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const trackRateLimitStore = new Map<string, RateLimitRecord>();
const TRACK_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_TRACK_REQUESTS_PER_WINDOW = 60;

function checkTrackRateLimit(ip: string): boolean {
  const now = Date.now();
  if (trackRateLimitStore.size > 2000) {
    for (const [key, val] of trackRateLimitStore.entries()) {
      if (now > val.resetAt) trackRateLimitStore.delete(key);
    }
  }

  const record = trackRateLimitStore.get(ip);
  if (!record || now > record.resetAt) {
    trackRateLimitStore.set(ip, { count: 1, resetAt: now + TRACK_RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_TRACK_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Same-origin or non-browser request
  try {
    const url = new URL(origin);
    const host = url.hostname;
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.kaifcoder.in') ||
      host === 'kaifcoder.in' ||
      host.endsWith('.vercel.app')
    );
  } catch {
    return false;
  }
}

// Edge memory store for fast multi-device tracking fallback
const memoryStore = new Map<string, number>();

export default async function handler(req: Request) {
  const origin = req.headers.get('origin');
  if (!isOriginAllowed(origin)) {
    return new Response(JSON.stringify({ error: 'Access denied' }), {
      status: 403,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'x-content-type-options': 'nosniff',
      },
    });
  }

  const allowedOrigin = origin && isOriginAllowed(origin) ? origin : 'https://www.kaifcoder.in';
  const corsHeaders = {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': allowedOrigin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'Content-Type',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'cache-control': 'no-store, no-cache, must-revalidate',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  // Rate Limiting per client IP
  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  if (!checkTrackRateLimit(clientIp)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: corsHeaders,
    });
  }

  try {
    let body: { path?: unknown; visitorId?: unknown } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch {
      // payload fallback
    }

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const hour = String(now.getUTCHours()).padStart(2, '0');

    const rawVisitorId = typeof body.visitorId === 'string' ? body.visitorId : '';
    const visitorId = rawVisitorId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'v_anon';

    const redis = getRedis();

    if (redis) {
      const pipeline = redis.pipeline();
      // Track pageviews & visitors atomically in Redis
      pipeline.incr(`pv_${today}`);
      pipeline.incr(`pvh_${today}_${hour}`);
      pipeline.incr('tot_pv');
      // Daily unique visitor set
      pipeline.sadd(`uv_set_${today}`, visitorId);
      pipeline.sadd(`uvh_set_${today}_${hour}`, visitorId);
      pipeline.sadd('tot_uv_set', visitorId);
      await pipeline.exec().catch(() => {});
    } else {
      // Fast edge fallback: increment in-memory counts
      const curTotPv = memoryStore.get('tot_pv') || 0;
      memoryStore.set('tot_pv', curTotPv + 1);
      memoryStore.set(`pv_${today}`, (memoryStore.get(`pv_${today}`) || 0) + 1);
      memoryStore.set(`pvh_${today}_${hour}`, (memoryStore.get(`pvh_${today}_${hour}`) || 0) + 1);

      // Non-blocking best-effort update to KV if available
      try {
        fetch(`${KV_BASE_URL}/UpdateValue/${KV_APP_KEY}/tot_pv/${curTotPv + 1}`, {
          method: 'POST',
          signal: AbortSignal.timeout(600),
        }).catch(() => {});
      } catch {
        // ignore KV downtime
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: corsHeaders,
    });
  } catch {
    return new Response(JSON.stringify({ ok: true, fallback: true }), {
      headers: corsHeaders,
    });
  }
}
