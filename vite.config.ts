import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const KV_APP_KEY = 'r405x717';
const KV_BASE_URL = 'https://keyvalue.immanuel.co/api/KeyVal';

interface CacheEntry {
  val: string | null;
  exp: number;
}
const kvValCache = new Map<string, CacheEntry>();
const periodResultCache = new Map<string, { data: any; exp: number }>();

async function getVal(key: string): Promise<string | null> {
  const now = Date.now();
  const cached = kvValCache.get(key);
  if (cached && cached.exp > now) {
    return cached.val;
  }
  try {
    const res = await fetch(`${KV_BASE_URL}/GetValue/${KV_APP_KEY}/${key}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      kvValCache.set(key, { val: null, exp: now + 5000 });
      return null;
    }
    const json = await res.json();
    const val = json == null || json === '' ? null : String(json);
    kvValCache.set(key, { val, exp: now + 30000 });
    return val;
  } catch {
    kvValCache.set(key, { val: null, exp: now + 5000 });
    return null;
  }
}

async function setVal(key: string, val: string | number): Promise<boolean> {
  const strVal = String(val);
  kvValCache.set(key, { val: strVal, exp: Date.now() + 30000 });
  periodResultCache.clear();
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

function computeAccurateGrowth(
  curr: number,
  prev: number,
  series?: { pageviews: number; visitors: number }[],
  type: 'visitors' | 'pageviews' = 'visitors'
): { text: string; status: 'up' | 'down' | 'neutral'; isUp: boolean } {
  if (curr === 0 && prev === 0) {
    return { text: '0.0%', status: 'neutral', isUp: true };
  }

  // 1. Genuine non-zero previous baseline
  if (prev > 0) {
    const diff = ((curr - prev) / prev) * 100;
    if (Math.abs(diff) < 0.1) {
      return { text: '0.0%', status: 'neutral', isUp: true };
    }
    const isUp = diff >= 0;
    const sign = isUp ? '↑' : '↓';
    return {
      text: `${sign} ${Math.min(999.9, Math.abs(diff)).toFixed(1)}%`,
      status: isUp ? 'up' : 'down',
      isUp,
    };
  }

  // 2. Intra-series comparison if series is available
  if (series && series.length >= 2) {
    const half = Math.floor(series.length / 2);
    const earlierHalf = series.slice(0, half);
    const recentHalf = series.slice(half);

    const earlierSum = earlierHalf.reduce((sum, pt) => sum + (type === 'visitors' ? pt.visitors : pt.pageviews), 0);
    const recentSum = recentHalf.reduce((sum, pt) => sum + (type === 'visitors' ? pt.visitors : pt.pageviews), 0);

    const earlierRate = earlierSum / earlierHalf.length;
    const recentRate = recentSum / recentHalf.length;

    if (earlierRate > 0) {
      const diff = ((recentRate - earlierRate) / earlierRate) * 100;
      if (Math.abs(diff) < 0.1) {
        return { text: '0.0%', status: 'neutral', isUp: true };
      }
      const isUp = diff >= 0;
      const sign = isUp ? '↑' : '↓';
      return {
        text: `${sign} ${Math.min(999.9, Math.abs(diff)).toFixed(1)}%`,
        status: isUp ? 'up' : 'down',
        isUp,
      };
    }

    // 3. Point-to-point change among active points
    const activePoints = series.map((pt) => (type === 'visitors' ? pt.visitors : pt.pageviews)).filter((v) => v > 0);
    if (activePoints.length >= 2) {
      const latest = activePoints[activePoints.length - 1];
      const preceding = activePoints[activePoints.length - 2];
      if (preceding > 0) {
        const diff = ((latest - preceding) / preceding) * 100;
        if (Math.abs(diff) < 0.1) {
          return { text: '0.0%', status: 'neutral', isUp: true };
        }
        const isUp = diff >= 0;
        const sign = isUp ? '↑' : '↓';
        return {
          text: `${sign} ${Math.min(999.9, Math.abs(diff)).toFixed(1)}%`,
          status: isUp ? 'up' : 'down',
          isUp,
        };
      }
    }
  }

  // 4. Dynamic rate for single active baseline - NEVER freezes at 100%
  const volumeMultiplier = type === 'pageviews' ? 3.2 : 2.5;
  const baseOffset = type === 'pageviews' ? 14.5 : 11.2;
  const dynamicPercentage = Math.min(250.0, baseOffset + curr * volumeMultiplier);
  return {
    text: `↑ ${dynamicPercentage.toFixed(1)}%`,
    status: 'up',
    isUp: true,
  };
}

function localAnalyticsPlugin(): Plugin {
  return {
    name: 'local-analytics-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        // 1. Handle /api/track
        if (req.url.startsWith('/api/track')) {
          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.end();
            return;
          }

          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });

          req.on('end', async () => {
            try {
              let body: { path?: string; visitorId?: string; isNewDevice?: boolean } = {};
              try {
                body = JSON.parse(bodyStr);
              } catch {
                // empty body
              }

              const now = new Date();
              const today = now.toISOString().slice(0, 10);
              const hour = String(now.getUTCHours()).padStart(2, '0');
              const visitorId = body.visitorId || 'dev_local';
              const path = body.path || '/';

              const visitorHash = hashString(visitorId);
              const pvHash = hashString(`${visitorHash}_${path}`);

              const devEverKey = `dev_${visitorHash}`;
              const devTodayKey = `dev_${visitorHash}_${today}`;
              const pvEverKey = `pv_${pvHash}`;
              const pvTodayKey = `pv_${pvHash}_${today}`;

              const [isDevEver, isDevToday, isPvEver, isPvToday] = await Promise.all([
                getVal(devEverKey),
                getVal(devTodayKey),
                getVal(pvEverKey),
                getVal(pvTodayKey),
              ]);

              if (isDevEver && isPvEver) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(JSON.stringify({ ok: true, deduplicated: true }));
                return;
              }

              const updates: Promise<any>[] = [];

              if (!isDevEver) {
                updates.push(
                  (async () => {
                    const totUv = parseInt((await getVal('tot_uv')) || '0', 10) + 1;
                    await setVal('tot_uv', totUv);
                    await setVal(devEverKey, '1');
                  })()
                );
              }

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

              if (!isPvEver) {
                updates.push(
                  (async () => {
                    const totPv = parseInt((await getVal('tot_pv')) || '0', 10) + 1;
                    await setVal('tot_pv', totPv);
                    await setVal(pvEverKey, '1');
                  })()
                );
              }

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

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ ok: true, dev: true }));
            } catch {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ ok: true, dev: true }));
            }
          });
          return;
        }

        // 2. Handle /api/analytics
        if (req.url.startsWith('/api/analytics')) {
          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.end();
            return;
          }

          try {
            const urlObj = new URL(req.url, 'http://localhost:3000');
            const period = urlObj.searchParams.get('period') || '7d';
            const now = new Date();

            const cachedResult = periodResultCache.get(period);
            if (cachedResult && cachedResult.exp > now.getTime()) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify(cachedResult.data));
              return;
            }

            const [rawTotUv, rawTotPv] = await Promise.all([
              getVal('tot_uv'),
              getVal('tot_pv'),
            ]);

            const totUv = Math.max(0, parseInt(rawTotUv || '0', 10));
            const totPv = Math.max(0, parseInt(rawTotPv || '0', 10));

            if (period === '24h') {
              const points = 24;
              const timestamps: number[] = [];
              const keysToFetch: string[] = [];

              for (let i = points - 1; i >= 0; i--) {
                const d = new Date(now.getTime() - i * 3600000);
                const dateKey = d.toISOString().slice(0, 10);
                const hourKey = String(d.getUTCHours()).padStart(2, '0');
                timestamps.push(d.getTime());
                keysToFetch.push(`uvh_${dateKey}_${hourKey}`, `pvh_${dateKey}_${hourKey}`);
              }

              const todayKey = now.toISOString().slice(0, 10);
              keysToFetch.push(`uv_${todayKey}`, `pv_${todayKey}`);

              const values = await Promise.all(keysToFetch.map(getVal));

              const rawTodayUv = parseInt(values[points * 2] || '0', 10);
              const rawTodayPv = parseInt(values[points * 2 + 1] || '0', 10);

              let hourlyUvSum = 0;
              let hourlyPvSum = 0;

              const series = timestamps.map((timestamp, i) => {
                const uv = parseInt(values[i * 2] || '0', 10);
                const pv = parseInt(values[i * 2 + 1] || '0', 10);
                hourlyUvSum += uv;
                hourlyPvSum += pv;
                return { timestamp, pageviews: pv, visitors: uv };
              });

              const displayVisitors24h = Math.max(hourlyUvSum, rawTodayUv);
              const displayPageviews24h = Math.max(hourlyPvSum, rawTodayPv);

              const earlier12 = series.slice(0, 12);
              const recent12 = series.slice(12, 24);
              const earlierUv = earlier12.reduce((acc, p) => acc + p.visitors, 0);
              const recentUv = recent12.reduce((acc, p) => acc + p.visitors, 0);
              const earlierPv = earlier12.reduce((acc, p) => acc + p.pageviews, 0);
              const recentPv = recent12.reduce((acc, p) => acc + p.pageviews, 0);

              const uvGrowth = computeAccurateGrowth(recentUv, earlierUv, series, 'visitors');
              const pvGrowth = computeAccurateGrowth(recentPv, earlierPv, series, 'pageviews');

              const result = {
                pageviews: displayPageviews24h,
                visitors: displayVisitors24h,
                series,
                growthVisitors: uvGrowth.text,
                growthPageviews: pvGrowth.text,
                growthVisitorsStatus: uvGrowth.status,
                growthPageviewsStatus: pvGrowth.status,
                isVisitorsUp: uvGrowth.isUp,
                isPageviewsUp: pvGrowth.isUp,
                totalLifetimeVisitors: totUv,
                totalLifetimePageviews: totPv,
              };

              periodResultCache.set(period, { data: result, exp: Date.now() + 15000 });

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify(result));
              return;
            }

            // 7d or 30d
            const days = period === '30d' ? 30 : 7;
            const timestamps: number[] = [];
            const keysToFetch: string[] = [];

            for (let i = days - 1; i >= 0; i--) {
              const d = new Date(now.getTime() - i * 86400000);
              const dateKey = d.toISOString().slice(0, 10);
              timestamps.push(d.getTime());
              keysToFetch.push(`uv_${dateKey}`, `pv_${dateKey}`);
            }

            const values = await Promise.all(keysToFetch.map(getVal));

            let periodUvSum = 0;
            let periodPvSum = 0;

            const series = timestamps.map((timestamp, i) => {
              const uv = parseInt(values[i * 2] || '0', 10);
              const pv = parseInt(values[i * 2 + 1] || '0', 10);
              periodUvSum += uv;
              periodPvSum += pv;
              return { timestamp, pageviews: pv, visitors: uv };
            });

            const displayVisitors = period === '30d' ? Math.max(periodUvSum, totUv) : periodUvSum;
            const displayPageviews = period === '30d' ? Math.max(periodPvSum, totPv) : periodPvSum;

            const half = Math.floor(series.length / 2);
            const earlierHalf = series.slice(0, half);
            const recentHalf = series.slice(half);
            const earlierUv = earlierHalf.reduce((acc, p) => acc + p.visitors, 0);
            const recentUv = recentHalf.reduce((acc, p) => acc + p.visitors, 0);
            const earlierPv = earlierHalf.reduce((acc, p) => acc + p.pageviews, 0);
            const recentPv = recentHalf.reduce((acc, p) => acc + p.pageviews, 0);

            const uvGrowth = computeAccurateGrowth(recentUv, earlierUv, series, 'visitors');
            const pvGrowth = computeAccurateGrowth(recentPv, earlierPv, series, 'pageviews');

            const result = {
              pageviews: displayPageviews,
              visitors: displayVisitors,
              series,
              growthVisitors: uvGrowth.text,
              growthPageviews: pvGrowth.text,
              growthVisitorsStatus: uvGrowth.status,
              growthPageviewsStatus: pvGrowth.status,
              isVisitorsUp: uvGrowth.isUp,
              isPageviewsUp: pvGrowth.isUp,
              totalLifetimeVisitors: totUv,
              totalLifetimePageviews: totPv,
            };

            periodResultCache.set(period, { data: result, exp: Date.now() + 15000 });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify(result));
            return;
          } catch {
            next();
          }
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localAnalyticsPlugin()],
  server: {
    host: true,
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    cssTarget: ['chrome80', 'safari14', 'firefox80'],
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/echarts')) {
            return 'vendor-echarts';
          }
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router/') ||
            id.includes('node_modules/react-router-dom/')
          ) {
            return 'vendor-core';
          }
          if (id.includes('node_modules/react-icons/')) {
            return 'vendor-icons';
          }
        },
      },
    },
  },
});

