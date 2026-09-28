import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const CLOUD_SYNC_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a0e6db00c02c66';

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
              let body: { path?: string; visitorId?: string } = {};
              try {
                body = JSON.parse(bodyStr);
              } catch {
                // empty body
              }

              const now = new Date();
              const today = now.toISOString().slice(0, 10);
              const hour = String(now.getUTCHours()).padStart(2, '0');
              const visitorId = body.visitorId || 'v_local';

              // Sync to shared cloud storage in dev
              try {
                const getRes = await fetch(CLOUD_SYNC_URL, {
                  headers: { Accept: 'application/json' },
                });
                let currentData: any = { daily: {}, totalPv: 0, allVisitors: [] };
                if (getRes.ok) {
                  const json = (await getRes.json()) as any;
                  if (json?.data && typeof json.data === 'object') {
                    currentData = json.data;
                  }
                }

                currentData.daily = currentData.daily || {};
                if (!currentData.daily[today]) {
                  currentData.daily[today] = {
                    pageviews: 0,
                    visitors: [],
                    hourly: {},
                    hourlyVisitors: {},
                  };
                }

                const day = currentData.daily[today];
                day.pageviews = (Number(day.pageviews) || 0) + 1;
                day.visitors = Array.isArray(day.visitors) ? day.visitors : [];
                if (!day.visitors.includes(visitorId)) {
                  day.visitors.push(visitorId);
                }

                day.hourly = day.hourly || {};
                day.hourly[hour] = (Number(day.hourly[hour]) || 0) + 1;

                day.hourlyVisitors = day.hourlyVisitors || {};
                day.hourlyVisitors[hour] = Array.isArray(day.hourlyVisitors[hour]) ? day.hourlyVisitors[hour] : [];
                if (!day.hourlyVisitors[hour].includes(visitorId)) {
                  day.hourlyVisitors[hour].push(visitorId);
                }

                currentData.totalPv = (Number(currentData.totalPv) || 0) + 1;
                currentData.allVisitors = Array.isArray(currentData.allVisitors) ? currentData.allVisitors : [];
                if (!currentData.allVisitors.includes(visitorId)) {
                  currentData.allVisitors.push(visitorId);
                }

                await fetch(CLOUD_SYNC_URL, {
                  method: 'PUT',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({
                    name: 'kaif_analytics',
                    data: currentData,
                  }),
                });
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
              const cloudRes = await fetch(CLOUD_SYNC_URL, {
                headers: { Accept: 'application/json' },
              });
              if (cloudRes.ok) {
                const cloudJson = (await cloudRes.json()) as any;
                cloudData = cloudJson?.data;
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
                  growthVisitors: '↑ 100.0%',
                  growthPageviews: '↑ 100.0%',
                  growthVisitorsStatus: 'up',
                  growthPageviewsStatus: 'up',
                  isVisitorsUp: true,
                  isPageviewsUp: true,
                })
              );
              return;
            }

            // 7d or 30d
            const series = [];
            let currPv = 0;
            const currVisitors = new Set<string>();

            for (let i = days - 1; i >= 0; i--) {
              const d = new Date(now.getTime() - i * 86400000);
              const dateKey = d.toISOString().slice(0, 10);
              const timestamp = d.getTime();

              const dayData = daily[dateKey];
              const pv = Number(dayData?.pageviews) || 0;
              const uvList = Array.isArray(dayData?.visitors) ? dayData.visitors : [];
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
                growthVisitors: '↑ 100.0%',
                growthPageviews: '↑ 100.0%',
                growthVisitorsStatus: 'up',
                growthPageviewsStatus: 'up',
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
