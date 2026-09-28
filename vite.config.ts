import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

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

              const values = await Promise.all(keysToFetch.map(getVal));

              const series = timestamps.map((timestamp, i) => {
                const uv = parseInt(values[i * 2] || '0', 10);
                const pv = parseInt(values[i * 2 + 1] || '0', 10);
                return { timestamp, pageviews: pv, visitors: uv };
              });

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(
                JSON.stringify({
                  pageviews: totPv,
                  visitors: totUv,
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

            const displayVisitors = Math.max(totUv, periodUvSum);
            const displayPageviews = Math.max(totPv, periodPvSum);

            if (series.length > 0) {
              const lastIdx = series.length - 1;
              if (series[lastIdx].pageviews === 0 && displayPageviews > 0) {
                series[lastIdx].pageviews = displayPageviews;
              }
              if (series[lastIdx].visitors === 0 && displayVisitors > 0) {
                series[lastIdx].visitors = displayVisitors;
              }
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(
              JSON.stringify({
                pageviews: displayPageviews,
                visitors: displayVisitors,
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
