export interface DayData {
  pv: number;
  visitors: string[];
  hourly: Record<string, number>;
  hourlyVisitors: Record<string, string[]>;
}

export interface LiveAnalyticsStore {
  daily: Record<string, DayData>;
  totalPv: number;
  totalVisitors: string[];
  lastUpdated: number;
}

const BLOB_PATH = 'kaif_analytics_live.json';
let cachedStore: LiveAnalyticsStore | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 2500; // 2.5 seconds cache for high throughput

declare const process: { env: Record<string, string | undefined> };

function getBlobCredentials(): { token: string; storeId: string } | null {
  try {
    const token = typeof process !== 'undefined' && process.env ? process.env.BLOB_READ_WRITE_TOKEN : undefined;
    if (!token) return null;
    const parts = token.split('_');
    const storeId = parts[3] || 'nxxynmqPlr3GHtMv';
    return { token, storeId: storeId.toLowerCase() };
  } catch {
    return null;
  }
}

export async function getLiveStore(): Promise<LiveAnalyticsStore> {
  const now = Date.now();
  if (cachedStore && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedStore;
  }

  const creds = getBlobCredentials();
  if (creds) {
    try {
      const getUrl = `https://${creds.storeId}.private.blob.vercel-storage.com/${BLOB_PATH}?cache=0`;
      const res = await fetch(getUrl, {
        headers: {
          authorization: `Bearer ${creds.token}`,
        },
      });
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const parsed = JSON.parse(text) as LiveAnalyticsStore;
          if (parsed && typeof parsed === 'object' && parsed.daily) {
            cachedStore = parsed;
            lastCacheTime = now;
            return parsed;
          }
        }
      }
    } catch {
      // Fallback if network hiccup
    }
  }

  if (!cachedStore) {
    cachedStore = { daily: {}, totalPv: 0, totalVisitors: [], lastUpdated: now };
  }
  return cachedStore;
}

export async function recordRealVisit(
  today: string,
  hour: string,
  visitorId: string
): Promise<LiveAnalyticsStore> {
  const store = await getLiveStore();

  if (!store.daily[today]) {
    store.daily[today] = {
      pv: 0,
      visitors: [],
      hourly: {},
      hourlyVisitors: {},
    };
  }

  const day = store.daily[today];
  day.hourly = day.hourly || {};
  day.hourlyVisitors = day.hourlyVisitors || {};
  day.visitors = Array.isArray(day.visitors) ? day.visitors : [];

  // 1. Increment pageviews
  day.pv = (Number(day.pv) || 0) + 1;
  day.hourly[hour] = (Number(day.hourly[hour]) || 0) + 1;
  store.totalPv = (Number(store.totalPv) || 0) + 1;

  // 2. Track daily unique visitor
  if (!day.visitors.includes(visitorId)) {
    day.visitors.push(visitorId);
  }

  // 3. Track hourly unique visitor
  day.hourlyVisitors[hour] = Array.isArray(day.hourlyVisitors[hour]) ? day.hourlyVisitors[hour] : [];
  if (!day.hourlyVisitors[hour].includes(visitorId)) {
    day.hourlyVisitors[hour].push(visitorId);
  }

  // 4. Track lifetime unique visitor
  store.totalVisitors = Array.isArray(store.totalVisitors) ? store.totalVisitors : [];
  if (!store.totalVisitors.includes(visitorId)) {
    store.totalVisitors.push(visitorId);
  }

  store.lastUpdated = Date.now();
  cachedStore = store;
  lastCacheTime = Date.now();

  const creds = getBlobCredentials();
  if (creds) {
    try {
      const putUrl = `https://vercel.com/api/blob?pathname=${encodeURIComponent(BLOB_PATH)}`;
      await fetch(putUrl, {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${creds.token}`,
          'x-api-version': '13',
          'x-vercel-blob-access': 'private',
          'x-allow-overwrite': '1',
          'x-add-random-suffix': '0',
          'content-type': 'application/json',
        },
        body: JSON.stringify(store),
      });
    } catch (err) {
      console.warn('Failed to sync analytics to Vercel Blob:', err);
    }
  }

  return store;
}
