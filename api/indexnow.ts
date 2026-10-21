export const config = {
  runtime: 'edge',
};

declare const process: { env: Record<string, string | undefined> };

const INDEXNOW_KEY = 'c4b8e21a8f944a9b8f2d57319e73552d';
const HOST = 'www.kaifcoder.in';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

const URL_LIST = [
  `https://${HOST}/`,
  `https://${HOST}/projects`,
  `https://${HOST}/projects/adzero`,
  `https://${HOST}/certificates`,
  `https://${HOST}/resume`,
  `https://${HOST}/analytics`,
  `https://${HOST}/blogs`,
  `https://${HOST}/blogs/how-to-plan-a-project`,
  `https://${HOST}/uses`,
  `https://${HOST}/support`,
];

export default async function handler(req: Request): Promise<Response> {
  // Method validation
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        Allow: 'POST',
      },
    });
  }

  // Authorization check: only authorized cron jobs or authenticated triggers can execute IndexNow submissions
  const authHeader = req.headers.get('authorization') || '';
  const isVercelCron = Boolean(req.headers.get('x-vercel-cron'));
  const url = new URL(req.url);
  const secretParam = url.searchParams.get('secret');

  const expectedSecret =
    (process.env.INDEXNOW_SECRET || process.env.CRON_SECRET || INDEXNOW_KEY).trim();

  const isAuthorized =
    isVercelCron ||
    authHeader === `Bearer ${expectedSecret}` ||
    secretParam === expectedSecret;

  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: 'Unauthorized: invalid or missing security credentials' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: URL_LIST,
  };

  const results: Record<string, { status: number; text: string }> = {};

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow',
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });
      const text = await res.text();
      results[endpoint] = { status: res.status, text };
    } catch (err) {
      results[endpoint] = { status: 500, text: err instanceof Error ? err.message : String(err) };
    }
  }

  return new Response(JSON.stringify({ success: true, submittedUrls: URL_LIST.length, results }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
