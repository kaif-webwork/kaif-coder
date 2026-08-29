import type { AnalyticsPeriod, AnalyticsData, AnalyticsSeriesPoint } from '../data/analytics';

const STORAGE_KEY = 'kaif_real_analytics_v2';
const VISITOR_KEY = 'kaif_visitor_id_v2';

interface StoredDayData {
  pageviews: number;
  visitors: string[]; // unique visitor IDs
  hourly: Record<string, number>; // "00".."23"
}

interface StoredAnalyticsData {
  daily: Record<string, StoredDayData>;
}

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = 'v_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return 'v_anon';
  }
}

function getStoredData(): StoredAnalyticsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as StoredAnalyticsData;
    }
  } catch {
    // ignore
  }
  return { daily: {} };
}

function saveStoredData(data: StoredAnalyticsData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function calculateAccurateGrowth(
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
  const diff = ((curr - prev) / prev) * 100;
  if (Math.abs(diff) < 0.05) {
    return { text: '0.0%', status: 'neutral' };
  }
  if (diff > 0) {
    return { text: `↑ ${diff.toFixed(1)}%`, status: 'up' };
  }
  return { text: `↓ ${Math.abs(diff).toFixed(1)}%`, status: 'down' };
}

/**
 * Record a real pageview and unique visitor strictly ONCE per session/day per user
 */
export function recordRealPageView(path: string) {
  try {
    const visitorId = getVisitorId();
    const now = new Date();
    const today = getDateKey(now);
    const hour = String(now.getHours()).padStart(2, '0');

    // Deduplication check: only track each user once per path per session
    const sessionKey = `kaif_tracked_${today}_${path}`;
    if (typeof sessionStorage !== 'undefined') {
      if (sessionStorage.getItem(sessionKey)) {
        return; // Already tracked for this user in this session, skip duplicate
      }
      sessionStorage.setItem(sessionKey, '1');
    }

    const data = getStoredData();
    if (!data.daily[today]) {
      data.daily[today] = {
        pageviews: 0,
        visitors: [],
        hourly: {},
      };
    }

    const day = data.daily[today];
    day.pageviews = (day.pageviews || 0) + 1;
    day.hourly[hour] = (day.hourly[hour] || 0) + 1;

    if (!day.visitors) day.visitors = [];
    if (!day.visitors.includes(visitorId)) {
      day.visitors.push(visitorId);
    }

    saveStoredData(data);

    // Notify active analytics components of real-time update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kaif_analytics_updated', { detail: { path } }));
    }
  } catch {
    // Storage unavailable
  }
}

/**
 * Get accurate real analytics data and exact growth percentages for period ('24h' | '7d' | '30d')
 */
export function getRealAnalyticsForPeriod(period: AnalyticsPeriod): AnalyticsData {
  const data = getStoredData();
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
      const pv = dayData?.hourly?.[hourKey] || 0;
      const uv = pv > 0 ? (dayData?.visitors?.length || 1) : 0;

      if (pv > 0 && dayData?.visitors) {
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
      const pv = dayData?.hourly?.[hourKey] || 0;
      if (pv > 0 && dayData?.visitors) {
        dayData.visitors.forEach((v) => prevVisitors.add(v));
      }
      prevPv += pv;
    }

    const totalVisitors = currVisitors.size > 0 ? currVisitors.size : (currPv > 0 ? 1 : 0);
    const totalPrevVisitors = prevVisitors.size > 0 ? prevVisitors.size : (prevPv > 0 ? 1 : 0);

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
  let currPv = 0;
  let prevPv = 0;
  const currVisitors = new Set<string>();
  const prevVisitors = new Set<string>();

  // Current period (days 0..N-1)
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateKey = getDateKey(d);
    const timestamp = d.getTime();

    const dayData = data.daily[dateKey];
    const pv = dayData?.pageviews || 0;
    const uv = dayData?.visitors?.length || 0;

    if (dayData?.visitors) {
      dayData.visitors.forEach((v) => currVisitors.add(v));
    }

    currPv += pv;
    series.push({ timestamp, pageviews: pv, visitors: uv });
  }

  // Previous period (days N..2N-1) for exact comparison
  for (let i = days * 2 - 1; i >= days; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateKey = getDateKey(d);

    const dayData = data.daily[dateKey];
    const pv = dayData?.pageviews || 0;

    if (dayData?.visitors) {
      dayData.visitors.forEach((v) => prevVisitors.add(v));
    }

    prevPv += pv;
  }

  const totalVisitors = currVisitors.size > 0 ? currVisitors.size : (currPv > 0 ? 1 : 0);
  const totalPrevVisitors = prevVisitors.size > 0 ? prevVisitors.size : (prevPv > 0 ? 1 : 0);

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
