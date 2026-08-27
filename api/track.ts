import { Redis } from '@upstash/redis';

let redisInstance: Redis | null = null;

function getRedis(): Redis | null {
  if (redisInstance) return redisInstance;
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redisInstance = Redis.fromEnv();
      return redisInstance;
    }
  } catch {
    // Fail silently if environment variables are not yet configured
  }
  return null;
}

// Get date key like "2026-08-26"
function getDateKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

// Cryptographic-style deterministic hash function for IP to protect user privacy
function hashIP(ip: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < ip.length; i++) {
    hash ^= ip.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0).toString(36);
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'content-type': 'application/json',
        'x-content-type-options': 'nosniff',
      },
    });
  }

  try {
    const redis = getRedis();
    if (!redis) {
      return new Response(JSON.stringify({ ok: true, fallback: true }), {
        headers: { 'content-type': 'application/json' },
      });
    }

    const today = getDateKey();
    const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    const visitorHash = hashIP(ip + today); // salted per day for privacy

    // Increment page views & unique visitor
    await Promise.all([
      redis.hincrby(`pv:${today}`, 'count', 1),
      redis.sadd(`uv:${today}`, visitorHash),
      redis.expire(`pv:${today}`, 35 * 86400),
      redis.expire(`uv:${today}`, 35 * 86400),
    ]);

    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store, no-cache, must-revalidate',
        'x-content-type-options': 'nosniff',
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ ok: false }),
      {
        status: 200, // Return 200 so analytics tracker does not produce client console errors
        headers: {
          'content-type': 'application/json',
          'x-content-type-options': 'nosniff',
        },
      }
    );
  }
}
