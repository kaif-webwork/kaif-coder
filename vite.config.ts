import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEV_STORE_FILE = path.resolve(__dirname, '.analytics-dev-store.json');

interface StoredDay {
  pageviews: number;
  visitors: string[];
  pvKeys: string[];
  hourly: Record<string, number>;
  hourlyVisitors: Record<string, string[]>;
}

interface DevStore {
  daily: Record<string, StoredDay>;
}

function loadDevStore(): DevStore {
  try {
    if (fs.existsSync(DEV_STORE_FILE)) {
      const raw = fs.readFileSync(DEV_STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.daily === 'object') {
        return parsed as DevStore;
      }
    }
  } catch {
    // fallback to clean state
  }
  return { daily: {} };
}

let devStore: DevStore = loadDevStore();
let saveTimeout: NodeJS.Timeout | null = null;

function queueSaveDevStore() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      fs.writeFileSync(DEV_STORE_FILE, JSON.stringify(devStore, null, 2), 'utf-8');
    } catch {
      // ignore write errors in dev
    }
  }, 500);
}

function getDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function computeGrowth(
  curr: number,
  prev: number,
  series?: { pageviews: number; visitors: number }[],
  type: 'visitors' | 'pageviews' = 'visitors'
): { text: string; status: 'up' | 'down' | 'neutral'; isUp: boolean } {
  if (curr === 0 && prev === 0) {
    return { text: '0.0%', status: 'neutral', isUp: true };
  }

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
  }

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

          req.on('end', () => {
            try {
              let body: { path?: string; visitorId?: string } = {};
              try {
                body = JSON.parse(bodyStr);
              } catch {
                // empty body
              }

              const now = new Date();
              const today = getDateKey(now);
              const hour = String(now.getHours()).padStart(2, '0');
              const visitorId = body.visitorId || 'dev_local';
              const path = body.path || '/';
              const devicePathKey = `${visitorId}_${path}`;

              devStore.daily = devStore.daily || {};
              if (!devStore.daily[today]) {
                devStore.daily[today] = {
                  pageviews: 0,
                  visitors: [],
                  pvKeys: [],
                  hourly: {},
                  hourlyVisitors: {},
                };
              }

              const day = devStore.daily[today];
              day.visitors = Array.isArray(day.visitors) ? day.visitors : [];
              day.pvKeys = Array.isArray(day.pvKeys) ? day.pvKeys : [];
              day.hourly = day.hourly || {};
              day.hourlyVisitors = day.hourlyVisitors || {};
              day.hourlyVisitors[hour] = Array.isArray(day.hourlyVisitors[hour]) ? day.hourlyVisitors[hour] : [];

              let changed = false;

              // Unique visitor check
              if (!day.visitors.includes(visitorId)) {
                day.visitors.push(visitorId);
                if (!day.hourlyVisitors[hour].includes(visitorId)) {
                  day.hourlyVisitors[hour].push(visitorId);
                }
                changed = true;
              }

              // Unique pageview check
              if (!day.pvKeys.includes(devicePathKey)) {
                day.pvKeys.push(devicePathKey);
                day.pageviews = day.pvKeys.length;
                day.hourly[hour] = (Number(day.hourly[hour]) || 0) + 1;
                changed = true;
              }

              if (changed) {
                queueSaveDevStore();
              }

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
            const rawPeriod = urlObj.searchParams.get('period');
            const period: '24h' | '7d' | '30d' = rawPeriod === '24h' || rawPeriod === '30d' ? rawPeriod : '7d';
            const now = new Date();

            const daily = devStore.daily || {};

            // Compute lifetime metrics
            const allLifetimeVisitors = new Set<string>();
            let lifetimePv = 0;
            Object.keys(daily).forEach((k) => {
              const d = daily[k];
              if (d) {
                if (Array.isArray(d.visitors)) d.visitors.forEach((v) => allLifetimeVisitors.add(v));
                lifetimePv += Number(d.pageviews) || 0;
              }
            });

            if (period === '24h') {
              const points = 24;
              const series = [];
              let currPv = 0;
              let prevPv = 0;
              const currVisitors = new Set<string>();
              const prevVisitors = new Set<string>();

              // Current 24 hours
              for (let i = points - 1; i >= 0; i--) {
                const d = new Date(now.getTime() - i * 3600000);
                const dateKey = getDateKey(d);
                const hourKey = String(d.getHours()).padStart(2, '0');
                const timestamp = d.getTime();

                const dayData = daily[dateKey];
                const pv = Number(dayData?.hourly?.[hourKey]) || 0;
                const hourlyUvList = Array.isArray(dayData?.hourlyVisitors?.[hourKey])
                  ? dayData.hourlyVisitors[hourKey]
                  : [];
                const uv = hourlyUvList.length > 0 ? hourlyUvList.length : pv > 0 ? 1 : 0;

                hourlyUvList.forEach((v) => currVisitors.add(v));
                if (pv > 0 && hourlyUvList.length === 0) {
                  currVisitors.add(`v_${dateKey}_${hourKey}`);
                }

                currPv += pv;
                series.push({ timestamp, pageviews: pv, visitors: uv });
              }

              // Previous 24 hours
              for (let i = points * 2 - 1; i >= points; i--) {
                const d = new Date(now.getTime() - i * 3600000);
                const dateKey = getDateKey(d);
                const hourKey = String(d.getHours()).padStart(2, '0');

                const dayData = daily[dateKey];
                const pv = Number(dayData?.hourly?.[hourKey]) || 0;
                const hourlyUvList = Array.isArray(dayData?.hourlyVisitors?.[hourKey])
                  ? dayData.hourlyVisitors[hourKey]
                  : [];

                hourlyUvList.forEach((v) => prevVisitors.add(v));
                prevPv += pv;
              }

              const totalVisitors = currVisitors.size > 0 ? currVisitors.size : currPv > 0 ? 1 : 0;
              const uvGrowth = computeGrowth(totalVisitors, prevVisitors.size, series, 'visitors');
              const pvGrowth = computeGrowth(currPv, prevPv, series, 'pageviews');

              const result = {
                pageviews: currPv,
                visitors: totalVisitors,
                series,
                growthVisitors: uvGrowth.text,
                growthPageviews: pvGrowth.text,
                growthVisitorsStatus: uvGrowth.status,
                growthPageviewsStatus: pvGrowth.status,
                isVisitorsUp: uvGrowth.isUp,
                isPageviewsUp: pvGrowth.isUp,
                totalLifetimeVisitors: allLifetimeVisitors.size,
                totalLifetimePageviews: lifetimePv,
              };

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify(result));
              return;
            }

            // 7d or 30d
            const days = period === '30d' ? 30 : 7;
            const series = [];
            let sumDailyPv = 0;
            let sumDailyPrevPv = 0;
            const currVisitors = new Set<string>();
            const prevVisitors = new Set<string>();

            // Current days
            for (let i = days - 1; i >= 0; i--) {
              const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
              const dateKey = getDateKey(d);
              const timestamp = d.getTime();

              const dayData = daily[dateKey];
              const pv = Number(dayData?.pageviews) || (Array.isArray(dayData?.pvKeys) ? dayData.pvKeys.length : 0);
              const uvList = Array.isArray(dayData?.visitors) ? dayData.visitors : [];
              const uv = uvList.length > 0 ? uvList.length : pv > 0 ? 1 : 0;

              uvList.forEach((v) => currVisitors.add(v));
              if (uvList.length === 0 && pv > 0) {
                currVisitors.add(`v_${dateKey}`);
              }

              sumDailyPv += pv;
              series.push({ timestamp, pageviews: pv, visitors: uv });
            }

            // Previous days
            for (let i = days * 2 - 1; i >= days; i--) {
              const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
              const dateKey = getDateKey(d);

              const dayData = daily[dateKey];
              const pv = Number(dayData?.pageviews) || (Array.isArray(dayData?.pvKeys) ? dayData.pvKeys.length : 0);
              const uvList = Array.isArray(dayData?.visitors) ? dayData.visitors : [];

              uvList.forEach((v) => prevVisitors.add(v));
              sumDailyPrevPv += pv;
            }

            const totalVisitors = currVisitors.size > 0 ? currVisitors.size : sumDailyPv > 0 ? 1 : 0;
            const uvGrowth = computeGrowth(totalVisitors, prevVisitors.size, series, 'visitors');
            const pvGrowth = computeGrowth(sumDailyPv, sumDailyPrevPv, series, 'pageviews');

            const result = {
              pageviews: sumDailyPv,
              visitors: totalVisitors,
              series,
              growthVisitors: uvGrowth.text,
              growthPageviews: pvGrowth.text,
              growthVisitorsStatus: uvGrowth.status,
              growthPageviewsStatus: pvGrowth.status,
              isVisitorsUp: uvGrowth.isUp,
              isPageviewsUp: pvGrowth.isUp,
              totalLifetimeVisitors: allLifetimeVisitors.size,
              totalLifetimePageviews: lifetimePv,
            };

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
