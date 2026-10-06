export const config = {
  runtime: 'edge',
};

const KV_APP_KEY = 'r405x717';
const KV_BASE_URL = 'https://keyvalue.immanuel.co/api/KeyVal';

interface CacheEntry {
  val: string | null;
  exp: number;
}
const kvTrackCache = new Map<string, CacheEntry>();

async function getVal(key: string): Promise<string | null> {
  const now = Date.now();
  const cached = kvTrackCache.get(key);
  if (cached && cached.exp > now) {
    return cached.val;
  }
  try {
    const res = await fetch(`${KV_BASE_URL}/GetValue/${KV_APP_KEY}/${key}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) {
      kvTrackCache.set(key, { val: null, exp: now + 5000 });
      return null;
    }
    const json = await res.json();
    const val = json == null || json === '' ? null : String(json);
    kvTrackCache.set(key, { val, exp: now + 30000 });
    return val;
  } catch {
    kvTrackCache.set(key, { val: null, exp: now + 5000 });
    return null;
  }
}

async function setVal(key: string, val: string | number): Promise<boolean> {
  const strVal = String(val);
  kvTrackCache.set(key, { val: strVal, exp: Date.now() + 30000 });
  try {
    const res = await fetch(
      `${KV_BASE_URL}/UpdateValue/${KV_APP_KEY}/${key}/${encodeURIComponent(strVal)}`,
      { method: 'POST', signal: AbortSignal.timeout(2500) }
    );
    return res.ok;
  } catch {
    return false;
  }
}

function hashString(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0).toString(36);
}

// In-memory edge rate limiting: prevents abuse and spam attacks (IP -> count)
const ipRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxRequests = 40, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = ipRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) {
    return false;
  }
  entry.count += 1;
  return true;
}

const CORS_HEADERS = {
  'content-type': 'application/json',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'Content-Type, Authorization',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'cache-control': 'no-store, no-cache, must-revalidate',
};

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
    // 1. Enforce payload size constraint (prevents payload flood attacks)
    const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
    if (contentLength > 8192) {
      return new Response(JSON.stringify({ error: 'Payload too large' }), {
        status: 413,
        headers: CORS_HEADERS,
      });
    }

    // 2. IP extraction & edge rate limiting
    const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0].trim().slice(0, 45) : '127.0.0.1';
    if (!checkRateLimit(ip, 40, 60000)) {
      return new Response(JSON.stringify({ ok: false, error: 'Rate limit exceeded' }), {
        status: 429,
        headers: CORS_HEADERS,
      });
    }

    let body: { path?: string; ref?: string; visitorId?: string } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch {
      // payload fallback
    }

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const hour = String(now.getUTCHours()).padStart(2, '0');

    // 3. Strict Input Sanitization & length truncation
    const rawVisitorId = typeof body.visitorId === 'string' ? body.visitorId : '';
    const clientVisitorId = rawVisitorId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'v_anon';

    const rawPath = typeof body.path === 'string' ? body.path : '/';
    const cleanPath = rawPath.split('?')[0].split('#')[0].slice(0, 100);
    const path = cleanPath.startsWith('/') ? cleanPath.replace(/[^a-zA-Z0-9/\-_]/g, '') : '/';

    // Unique per-device hash: persistent clientVisitorId across networks, or IP fallback
    const visitorHash = hashString(clientVisitorId !== 'v_anon' ? clientVisitorId : `anon_${ip}`);
    const pvHash = hashString(`${visitorHash}_${path}`);


    // Deduplication keys
    const devEverKey = `dev_${visitorHash}`;
    const devTodayKey = `dev_${visitorHash}_${today}`;
    const pvEverKey = `pv_${pvHash}`;
    const pvTodayKey = `pv_${pvHash}_${today}`;

    // Parallel lookup
    const [isDevEver, isDevToday, isPvEver, isPvToday] = await Promise.all([
      getVal(devEverKey),
      getVal(devTodayKey),
      getVal(pvEverKey),
      getVal(pvTodayKey),
    ]);

    // If this device has already visited this route, DO NOT increment anything!
    if (isDevEver && isPvEver) {
      return new Response(JSON.stringify({ ok: true, deduplicated: true }), {
        headers: CORS_HEADERS,
      });
    }

    const updates: Promise<any>[] = [];

    // 1. Unique visitor count (lifetime across all devices)
    if (!isDevEver) {
      updates.push(
        (async () => {
          const totUv = parseInt((await getVal('tot_uv')) || '0', 10) + 1;
          await setVal('tot_uv', totUv);
          await setVal(devEverKey, '1');
        })()
      );
    }

    // 2. Unique visitor count for today
    if (!isDevToday) {
      updates.push(
        (async () => {
          const dayUv = parseInt((await getVal(`uv_${today}`)) || '0', 10) + 1;
          await setVal(`uv_${today}`, dayUv);
          const hourUv = parseInt((await getVal(`uvh_${today}_${hour}`)) || '0', 10) + 1;
          await setVal(`uvh_${today}_${hour}`, hourUv);
          await setVal(devTodayKey, '1');
        })()
      );
    }

    // 3. Unique pageview count (lifetime across all devices)
    if (!isPvEver) {
      updates.push(
        (async () => {
          const totPv = parseInt((await getVal('tot_pv')) || '0', 10) + 1;
          await setVal('tot_pv', totPv);
          await setVal(pvEverKey, '1');
        })()
      );
    }

    // 4. Unique pageview count for today
    if (!isPvToday) {
      updates.push(
        (async () => {
          const dayPv = parseInt((await getVal(`pv_${today}`)) || '0', 10) + 1;
          await setVal(`pv_${today}`, dayPv);
          const hourPv = parseInt((await getVal(`pvh_${today}_${hour}`)) || '0', 10) + 1;
          await setVal(`pvh_${today}_${hour}`, hourPv);
          await setVal(pvTodayKey, '1');
        })()
      );
    }

    await Promise.all(updates);

    return new Response(JSON.stringify({ ok: true, engine: 'shared_cloud' }), {
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
