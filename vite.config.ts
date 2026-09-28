import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const KV_APP_KEY = 'r405x717';
const KV_BASE_URL = 'https://keyvalue.immanuel.co/api/KeyVal';

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
              const pvEntryKey = `${visitorId}:${path}`;

              // Sync to shared storage with strict deduplication
              try {
                const getRes = await fetch(`${KV_BASE_URL}/GetValue/${KV_APP_KEY}/analytics`, {
                  headers: { Accept: 'application/json' },
                });
                let currentData: any = { daily: {}, allPvKeys: [], allVisitors: [] };
                if (getRes.ok) {
                  try {
                    const rawVal = await getRes.json();
                    if (rawVal && typeof rawVal === 'string') {
                      const decoded = Buffer.from(rawVal, 'base64url').toString('utf8');
                      currentData = JSON.parse(decoded);
                    }
                  } catch {
                    // ignore parse error
                  }
                }

                currentData.daily = currentData.daily || {};
                currentData.allVisitors = Array.isArray(currentData.allVisitors) ? currentData.allVisitors : [];
                currentData.allPvKeys = Array.isArray(currentData.allPvKeys) ? currentData.allPvKeys : [];

                if (!currentData.daily[today]) {
                  currentData.daily[today] = {
                    pageviews: 0,
                    visitors: [],
                    pvKeys: [],
                    hourly: {},
                    hourlyVisitors: {},
                  };
                }

                const day = currentData.daily[today];
                day.pvKeys = Array.isArray(day.pvKeys) ? day.pvKeys : [];
                day.visitors = Array.isArray(day.visitors) ? day.visitors : [];
                day.hourly = day.hourly || {};
                day.hourlyVisitors = day.hourlyVisitors || {};
                day.hourlyVisitors[hour] = Array.isArray(day.hourlyVisitors[hour]) ? day.hourlyVisitors[hour] : [];

                const isAlreadyVisitor = currentData.allVisitors.includes(visitorId);
                const isAlreadyPv = day.pvKeys.includes(pvEntryKey);

                // If already tracked for this device and route, skip!
                if (isAlreadyVisitor && isAlreadyPv) {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.end(JSON.stringify({ ok: true, deduplicated: true }));
                  return;
                }

                let changed = false;

                if (!isAlreadyVisitor) {
                  currentData.allVisitors.push(visitorId);
                  if (!day.visitors.includes(visitorId)) {
                    day.visitors.push(visitorId);
                  }
                  if (!day.hourlyVisitors[hour].includes(visitorId)) {
                    day.hourlyVisitors[hour].push(visitorId);
                  }
                  changed = true;
                } else if (!day.visitors.includes(visitorId) && day.visitors.length === 0) {
                  day.visitors.push(visitorId);
                  changed = true;
                }

                if (!isAlreadyPv) {
                  day.pvKeys.push(pvEntryKey);
                  day.pageviews = day.pvKeys.length;
                  day.hourly[hour] = (Number(day.hourly[hour]) || 0) + 1;
                  if (!currentData.allPvKeys.includes(pvEntryKey)) {
                    currentData.allPvKeys.push(pvEntryKey);
                  }
                  changed = true;
                }

                if (changed) {
                  const encoded = Buffer.from(JSON.stringify(currentData)).toString('base64url');
                  await fetch(`${KV_BASE_URL}/UpdateValue/${KV_APP_KEY}/analytics/${encoded}`, {
                    method: 'POST',
                  });
                }
              } catch {
                // local fallback
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
            const period = urlObj.searchParams.get('period') || '7d';
            const now = new Date();

            let cloudData: any = null;
            try {
              const cloudRes = await fetch(`${KV_BASE_URL}/GetValue/${KV_APP_KEY}/analytics`, {
                headers: { Accept: 'application/json' },
              });
              if (cloudRes.ok) {
                const rawVal = await cloudRes.json();
                if (rawVal && typeof rawVal === 'string') {
                  const decoded = Buffer.from(rawVal, 'base64url').toString('utf8');
                  cloudData = JSON.parse(decoded);
                }
              }
            } catch {
              // fallback
            }

            const daily = cloudData?.daily || {};
            const days = period === '30d' ? 30 : period === '24h' ? 24 : 7;

            if (period === '24h') {
              const points = 24;
              const series = [];
              let currPv = 0;
              const currVisitors = new Set<string>();

              for (let i = points - 1; i >= 0; i--) {
                const d = new Date(now.getTime() - i * 3600000);
                const dateKey = d.toISOString().slice(0, 10);
                const hourKey = String(d.getUTCHours()).padStart(2, '0');
                const timestamp = d.getTime();

                const dayData = daily[dateKey];
                const pv = Number(dayData?.hourly?.[hourKey]) || 0;
                const uvList = Array.isArray(dayData?.hourlyVisitors?.[hourKey]) ? dayData.hourlyVisitors[hourKey] : [];
                const uv = uvList.length > 0 ? uvList.length : pv > 0 ? 1 : 0;

                uvList.forEach((v: string) => currVisitors.add(v));
                currPv += pv;
                series.push({ timestamp, pageviews: pv, visitors: uv });
              }

              const totalVisitors = currVisitors.size > 0 ? currVisitors.size : currPv > 0 ? 1 : 0;

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(
                JSON.stringify({
                  pageviews: currPv,
                  visitors: totalVisitors,
                  series,
                  growthVisitors: '0.0%',
                  growthPageviews: '0.0%',
                  growthVisitorsStatus: 'neutral',
                  growthPageviewsStatus: 'neutral',
                  isVisitorsUp: true,
                  isPageviewsUp: true,
                })
              );
              return;
            }

            // 7d or 30d
            const series = [];
            const currVisitors = new Set<string>();
            const currPvKeys = new Set<string>();
            let sumPv = 0;

            for (let i = days - 1; i >= 0; i--) {
              const d = new Date(now.getTime() - i * 86400000);
              const dateKey = d.toISOString().slice(0, 10);
              const timestamp = d.getTime();

              const dayData = daily[dateKey];
              const pv = Array.isArray(dayData?.pvKeys)
                ? dayData.pvKeys.length
                : Number(dayData?.pageviews) || 0;
              const uvList = Array.isArray(dayData?.visitors) ? dayData.visitors : [];
              const uv = uvList.length > 0 ? uvList.length : pv > 0 ? 1 : 0;

              uvList.forEach((v: string) => currVisitors.add(v));
              if (Array.isArray(dayData?.pvKeys)) {
                dayData.pvKeys.forEach((k: string) => currPvKeys.add(k));
              }
              sumPv += pv;
              series.push({ timestamp, pageviews: pv, visitors: uv });
            }

            const totalVisitors = currVisitors.size > 0 ? currVisitors.size : sumPv > 0 ? 1 : 0;
            const totalPv = currPvKeys.size > 0 ? currPvKeys.size : sumPv;

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(
              JSON.stringify({
                pageviews: totalPv,
                visitors: totalVisitors,
                series,
                growthVisitors: '0.0%',
                growthPageviews: '0.0%',
                growthVisitorsStatus: 'neutral',
                growthPageviewsStatus: 'neutral',
                isVisitorsUp: true,
                isPageviewsUp: true,
              })
            );
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
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    cssTarget: ['chrome80', 'safari14', 'firefox80'],
  },
});
