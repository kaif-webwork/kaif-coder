declare const process: { env: Record<string, string | undefined> };

export const config = {
  runtime: 'edge',
};

const KV_APP_KEY = 'r405x717';
const KV_BASE_URL = 'https://keyvalue.immanuel.co/api/KeyVal';

async function getVal(key: string): Promise<string | null> {
  try {
    const res = await fetch(`${KV_BASE_URL}/GetValue/${KV_APP_KEY}/${key}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json == null || json === '') return null;
    return String(json);
  } catch {
    return null;
  }
}

async function setVal(key: string, val: string | number): Promise<boolean> {
  try {
    const res = await fetch(
      `${KV_BASE_URL}/UpdateValue/${KV_APP_KEY}/${key}/${encodeURIComponent(String(val))}`,
      { method: 'POST' }
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

const CORS_HEADERS = {
  'content-type': 'application/json',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'Content-Type, Authorization',
  'x-content-type-options': 'nosniff',
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
    let body: { path?: string; ref?: string; visitorId?: string } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch {
      // payload fallback
    }

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const hour = String(now.getUTCHours()).padStart(2, '0');

    const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    const clientVisitorId = body.visitorId || 'v_anon';

    // Unique per-device hash: persistent clientVisitorId across networks, or IP fallback
    const visitorHash = hashString(clientVisitorId !== 'v_anon' ? clientVisitorId : `anon_${ip}`);
    const path = body.path || '/';
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
