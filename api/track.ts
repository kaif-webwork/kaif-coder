import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Get date key like "2026-08-26"
function getDateKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

// Simple hash function for IP to avoid storing raw IPs
function hashIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const today = getDateKey();
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    const visitorHash = hashIP(ip + today); // unique per IP per day

    // Increment page views for today
    await redis.hincrby(`pv:${today}`, 'count', 1);

    // Add unique visitor (Set ensures one IP = one count per day)
    await redis.sadd(`uv:${today}`, visitorHash);

    // Set expiry (auto-cleanup after 35 days)
    await redis.expire(`pv:${today}`, 35 * 86400);
    await redis.expire(`uv:${today}`, 35 * 86400);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}
