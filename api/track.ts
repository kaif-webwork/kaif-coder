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

const CORS_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'Content-Type, Authorization',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'cache-control': 'no-store, no-cache, must-revalidate',
};

// Edge memory store for fast multi-device tracking
const memoryStore = new Map<string, number>();

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: CORS_HEADERS,
    });
  }

  try {
    let body: { path?: string; visitorId?: string } = {};
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
      headers: CORS_HEADERS,
    });
  } catch {
    return new Response(JSON.stringify({ ok: true, fallback: true }), {
      headers: CORS_HEADERS,
    });
  }
}
