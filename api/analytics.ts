export default async function handler(req: Request) {
  const url = new URL(req.url);
  const period = url.searchParams.get('period') || '30d';

  // Calculate timestamps and mock series for serverless environment
  const points = period === '24h' ? 24 : period === '7d' ? 7 : 30;
  const now = Date.now();
  const interval = period === '24h' ? 3600000 : 86400000;

  const series = Array.from({ length: points }, (_, i) => ({
    timestamp: now - (points - i) * interval,
    pageviews: Math.floor(Math.random() * 80) + 20,
    visitors: Math.floor(Math.random() * 40) + 10,
  }));

  const totalPageviews = series.reduce((sum, p) => sum + p.pageviews, 0);
  const totalVisitors = series.reduce((sum, p) => sum + p.visitors, 0);

  return new Response(
    JSON.stringify({
      pageviews: totalPageviews,
      visitors: totalVisitors,
      series,
    }),
    {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
