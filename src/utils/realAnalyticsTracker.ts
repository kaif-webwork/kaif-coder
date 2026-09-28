import type { AnalyticsPeriod, AnalyticsData, AnalyticsSeriesPoint } from '../data/analytics';

const STORAGE_KEY = 'kaif_real_analytics_v4';
const VISITOR_KEY = 'kaif_device_id_v4';

interface StoredDayData {
  pageviews: number;
  visitors: string[]; // unique visitor IDs for the day
  pvKeys?: string[]; // unique pageview keys: `${visitorId}_${path}`
  hourly: Record<string, number>; // pageviews per hour "00".."23"
  hourlyVisitors?: Record<string, string[]>; // unique visitor IDs per hour "00".."23"
}

interface StoredAnalyticsData {
  daily: Record<string, StoredDayData>;
}

export function getVisitorId(): string {
  try {
    if (typeof localStorage === 'undefined') return 'v_anon';
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return 'dev_anon_' + Math.random().toString(36).substring(2, 8);
  }
}

function getStoredData(): StoredAnalyticsData {
  try {
    if (typeof localStorage === 'undefined') return { daily: {} };
    let raw = localStorage.getItem(STORAGE_KEY);
    // Migration check from v3
    if (!raw) {
      const v3Raw = localStorage.getItem('kaif_real_analytics_v3');
      if (v3Raw) {
        try {
          const v3Data = JSON.parse(v3Raw);
          if (v3Data && typeof v3Data === 'object' && v3Data.daily) {
            // Sanitize v3 data so pageviews cannot exceed unique pvKeys
            Object.keys(v3Data.daily).forEach((d) => {
              const item = v3Data.daily[d];
              if (item) {
                item.visitors = Array.from(new Set(Array.isArray(item.visitors) ? item.visitors : []));
                item.pvKeys = Array.from(new Set(Array.isArray(item.pvKeys) ? item.pvKeys : []));
                item.pageviews = item.pvKeys.length > 0 ? item.pvKeys.length : item.visitors.length;
              }
            });
            raw = JSON.stringify(v3Data);
            localStorage.setItem(STORAGE_KEY, raw);
          }
        } catch {
          // ignore
        }
      }
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        parsed.daily = parsed.daily || {};
        return parsed as StoredAnalyticsData;
      }
    }
  } catch {
    // ignore
  }
  return { daily: {} };
}

function saveStoredData(data: StoredAnalyticsData) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

function getDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calculateAccurateGrowth(
  curr: number,
  prev: number
): { text: string; status: 'up' | 'down' | 'neutral' } {
  if (curr === 0 && prev === 0) {
    return { text: '0.0%', status: 'neutral' };
  }
  if (prev === 0 && curr > 0) {
    return { text: '↑ 100.0%', status: 'up' };
  }
  if (prev > 0 && curr === 0) {
    return { text: '↓ 100.0%', status: 'down' };
  }
  const diff = ((curr - prev) / (prev || 1)) * 100;
  if (Math.abs(diff) < 0.05) {
    return { text: '0.0%', status: 'neutral' };
  }
  if (diff > 0) {
    return { text: `↑ ${diff.toFixed(1)}%`, status: 'up' };
  }
  return { text: `↓ ${Math.abs(diff).toFixed(1)}%`, status: 'down' };
}

/**
 * Record a real pageview and unique visitor with STRICT per-device deduplication.
 * Refreshes, reloads, or duplicate visits from the same device WILL NOT increment page views or visitors.
 */
export function recordRealPageView(path: string, isNewDevice: boolean = false) {
  try {
    const visitorId = getVisitorId();
    const now = new Date();
    const today = getDateKey(now);
    const hour = String(now.getHours()).padStart(2, '0');

    // Strict deduplication key per device & route
    const devicePathKey = `${visitorId}_${path}`;

    const data = getStoredData();
    data.daily = data.daily || {};

    if (!data.daily[today]) {
      data.daily[today] = {
        pageviews: 0,
        visitors: [],
        pvKeys: [],
        hourly: {},
        hourlyVisitors: {},
      };
    }

    const day = data.daily[today];
    day.pvKeys = Array.isArray(day.pvKeys) ? day.pvKeys : [];
    day.visitors = Array.isArray(day.visitors) ? day.visitors : [];
    day.hourly = day.hourly || {};
    day.hourlyVisitors = day.hourlyVisitors || {};
    day.hourlyVisitors[hour] = Array.isArray(day.hourlyVisitors[hour]) ? day.hourlyVisitors[hour] : [];

    const isAlreadyCountedVisitor = day.visitors.includes(visitorId);
    const isAlreadyViewedPage = day.pvKeys.includes(devicePathKey);

    // If this device has already visited this route, DO NOT increment anything!
    if (isAlreadyViewedPage) {
      return;
    }

    let changed = false;

    // 1. Add unique visitor if new device or first time device is seen today
    if ((isNewDevice || day.visitors.length === 0) && !isAlreadyCountedVisitor) {
      day.visitors.push(visitorId);
      if (!day.hourlyVisitors[hour].includes(visitorId)) {
        day.hourlyVisitors[hour].push(visitorId);
      }
      changed = true;
    }

    // 2. Add unique pageview if this route hasn't been viewed by this device
    if (!isAlreadyViewedPage) {
      day.pvKeys.push(devicePathKey);
      day.pageviews = day.pvKeys.length;
      day.hourly[hour] = (Number(day.hourly[hour]) || 0) + 1;
      changed = true;
    }

    if (changed) {
      saveStoredData(data);
      // Notify active analytics components of real-time update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kaif_analytics_updated', { detail: { path } }));
      }
    }
  } catch {
    // Storage unavailable safely suppressed
  }
}


/**
 * Fallback empty analytics structure with clean timestamps
 */
function getEmptyFallbackAnalytics(period: AnalyticsPeriod): AnalyticsData {
  const points = period === '24h' ? 24 : period === '7d' ? 7 : 30;
  const interval = period === '24h' ? 3600000 : 86400000;
  const now = Date.now();
  const series: AnalyticsSeriesPoint[] = Array.from({ length: points }, (_, i) => ({
    timestamp: now - (points - 1 - i) * interval,
    pageviews: 0,
    visitors: 0,
  }));

  return {
    pageviews: 0,
    visitors: 0,
    series,
    growthVisitors: '0.0%',
    growthPageviews: '0.0%',
    growthVisitorsStatus: 'neutral',
    growthPageviewsStatus: 'neutral',
    isVisitorsUp: true,
    isPageviewsUp: true,
  };
}

/**
 * Get accurate real analytics data and exact growth percentages for period ('24h' | '7d' | '30d')
 */
export function getRealAnalyticsForPeriod(period: AnalyticsPeriod): AnalyticsData {
  try {
    const data = getStoredData();
    data.daily = data.daily || {};
    const now = new Date();

    if (period === '24h') {
      const points = 24;
      const series: AnalyticsSeriesPoint[] = [];
      let currPv = 0;
      let prevPv = 0;
      const currVisitors = new Set<string>();
      const prevVisitors = new Set<string>();

      // Current 24h
      for (let i = points - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 3600000);
        const dateKey = getDateKey(d);
        const hourKey = String(d.getHours()).padStart(2, '0');
        const timestamp = d.getTime();

        const dayData = data.daily[dateKey];
        const pv = Number(dayData?.hourly?.[hourKey]) || 0;
        const hourlyUvList = Array.isArray(dayData?.hourlyVisitors?.[hourKey])
          ? dayData.hourlyVisitors[hourKey]
          : [];
        const uv = hourlyUvList.length > 0 ? hourlyUvList.length : pv > 0 ? 1 : 0;

        if (hourlyUvList.length > 0) {
          hourlyUvList.forEach((v) => currVisitors.add(v));
        } else if (pv > 0 && Array.isArray(dayData?.visitors)) {
          dayData.visitors.forEach((v) => currVisitors.add(v));
        }

        currPv += pv;
        series.push({ timestamp, pageviews: pv, visitors: uv });
      }

      // Previous 24h (hours 24..47 ago) for accurate mathematical delta
      for (let i = points * 2 - 1; i >= points; i--) {
        const d = new Date(now.getTime() - i * 3600000);
        const dateKey = getDateKey(d);
        const hourKey = String(d.getHours()).padStart(2, '0');

        const dayData = data.daily[dateKey];
        const pv = Number(dayData?.hourly?.[hourKey]) || 0;
        const hourlyUvList = Array.isArray(dayData?.hourlyVisitors?.[hourKey])
          ? dayData.hourlyVisitors[hourKey]
          : [];

        if (hourlyUvList.length > 0) {
          hourlyUvList.forEach((v) => prevVisitors.add(v));
        } else if (pv > 0 && Array.isArray(dayData?.visitors)) {
          dayData.visitors.forEach((v) => prevVisitors.add(v));
        }

        prevPv += pv;
      }

      const totalVisitors = currVisitors.size > 0 ? currVisitors.size : currPv > 0 ? 1 : 0;
      const totalPrevVisitors = prevVisitors.size > 0 ? prevVisitors.size : prevPv > 0 ? 1 : 0;

      const uvGrowth = calculateAccurateGrowth(totalVisitors, totalPrevVisitors);
      const pvGrowth = calculateAccurateGrowth(currPv, prevPv);

      return {
        pageviews: currPv,
        visitors: totalVisitors,
        series,
        growthVisitors: uvGrowth.text,
        growthPageviews: pvGrowth.text,
        growthVisitorsStatus: uvGrowth.status,
        growthPageviewsStatus: pvGrowth.status,
        isVisitorsUp: uvGrowth.status !== 'down',
        isPageviewsUp: pvGrowth.status !== 'down',
      };
    }

    // 7d or 30d
    const days = period === '30d' ? 30 : 7;
    const series: AnalyticsSeriesPoint[] = [];
    let sumDailyPv = 0;
    let sumDailyPrevPv = 0;
    const currVisitors = new Set<string>();
    const prevVisitors = new Set<string>();
    const currPvKeys = new Set<string>();
    const prevPvKeys = new Set<string>();

    // Current period (days 0..N-1)
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateKey = getDateKey(d);
      const timestamp = d.getTime();

      const dayData = data.daily[dateKey];
      const pv = Array.isArray(dayData?.pvKeys)
        ? dayData.pvKeys.length
        : Number(dayData?.pageviews) || 0;
      const uv = Array.isArray(dayData?.visitors)
        ? dayData.visitors.length
        : pv > 0
        ? 1
        : 0;

      if (Array.isArray(dayData?.visitors) && dayData.visitors.length > 0) {
        dayData.visitors.forEach((v) => currVisitors.add(v));
      } else if (pv > 0) {
        currVisitors.add('v_current');
      }

      if (Array.isArray(dayData?.pvKeys)) {
        dayData.pvKeys.forEach((k) => currPvKeys.add(k));
      }

      sumDailyPv += pv;
      series.push({ timestamp, pageviews: pv, visitors: uv });
    }

    // Previous period (days N..2N-1) for exact comparison
    for (let i = days * 2 - 1; i >= days; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateKey = getDateKey(d);

      const dayData = data.daily[dateKey];
      const pv = Array.isArray(dayData?.pvKeys)
        ? dayData.pvKeys.length
        : Number(dayData?.pageviews) || 0;

      if (Array.isArray(dayData?.visitors) && dayData.visitors.length > 0) {
        dayData.visitors.forEach((v) => prevVisitors.add(v));
      } else if (pv > 0) {
        prevVisitors.add('v_prev');
      }

      if (Array.isArray(dayData?.pvKeys)) {
        dayData.pvKeys.forEach((k) => prevPvKeys.add(k));
      }

      sumDailyPrevPv += pv;
    }

    const totalVisitors = currVisitors.size > 0 ? currVisitors.size : sumDailyPv > 0 ? 1 : 0;
    const totalPrevVisitors = prevVisitors.size > 0 ? prevVisitors.size : sumDailyPrevPv > 0 ? 1 : 0;

    const totalPv = currPvKeys.size > 0 ? currPvKeys.size : sumDailyPv;
    const totalPrevPv = prevPvKeys.size > 0 ? prevPvKeys.size : sumDailyPrevPv;

    const uvGrowth = calculateAccurateGrowth(totalVisitors, totalPrevVisitors);
    const pvGrowth = calculateAccurateGrowth(totalPv, totalPrevPv);

    return {
      pageviews: totalPv,
      visitors: totalVisitors,
      series,
      growthVisitors: uvGrowth.text,
      growthPageviews: pvGrowth.text,
      growthVisitorsStatus: uvGrowth.status,
      growthPageviewsStatus: pvGrowth.status,
      isVisitorsUp: uvGrowth.status !== 'down',
      isPageviewsUp: pvGrowth.status !== 'down',
    };
  } catch (err) {
    console.error('getRealAnalyticsForPeriod error:', err);
    return getEmptyFallbackAnalytics(period);
  }
}
