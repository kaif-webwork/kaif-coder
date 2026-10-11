export const config = {
  runtime: 'edge',
};

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
      'Cache-Control': 'no-store',
    },
  });
}
