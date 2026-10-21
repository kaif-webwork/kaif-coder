import { put, get } from '@vercel/blob';

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

function getBlobToken(): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }
  return undefined;
}

export async function getLiveStore(): Promise<LiveAnalyticsStore> {
  const now = Date.now();
  if (cachedStore && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedStore;
  }

  const token = getBlobToken();
  if (!token) {
    if (!cachedStore) {
      cachedStore = { daily: {}, totalPv: 0, totalVisitors: [], lastUpdated: now };
    }
    return cachedStore;
  }

  try {
    const res = await get(BLOB_PATH, { access: 'private', token });
    if (res && res.stream) {
      const text = await new Response(res.stream).text();
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
    // If blob not created yet or network hiccup, use fallback
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

  const token = getBlobToken();
  if (token) {
    try {
      await put(BLOB_PATH, JSON.stringify(store), {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        token,
      });
    } catch (err) {
      console.warn('Failed to sync analytics to Vercel Blob:', err);
    }
  }

  return store;
}
