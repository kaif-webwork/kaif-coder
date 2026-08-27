import { useEffect, useRef, useState } from 'react';
import type { AnalyticsPeriod, AnalyticsSeriesPoint } from '../../data/analytics';

interface AnalyticsChartProps {
  period: AnalyticsPeriod;
  series: AnalyticsSeriesPoint[];
}

export default function AnalyticsChart({ period, series }: AnalyticsChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const [echarts, setEcharts] = useState<any>(null);

  useEffect(() => {
    import('echarts').then((mod) => setEcharts(mod));
  }, []);

  useEffect(() => {
    if (!chartRef.current || !echarts) return;

    if (!chartInstance.current || chartInstance.current.isDisposed()) {
      chartInstance.current = echarts.init(chartRef.current, 'dark');
    }

    const chart = chartInstance.current;

    // Default mock curve matching reference screenshot shape
    const displaySeries =
      series && series.length > 0
        ? series
        : [
            { timestamp: Date.now() - 6 * 86400000, pageviews: 80, visitors: 35 },
            { timestamp: Date.now() - 5 * 86400000, pageviews: 105, visitors: 42 },
            { timestamp: Date.now() - 4 * 86400000, pageviews: 75, visitors: 36 },
            { timestamp: Date.now() - 3 * 86400000, pageviews: 130, visitors: 38 },
            { timestamp: Date.now() - 2 * 86400000, pageviews: 235, visitors: 70 },
            { timestamp: Date.now() - 1 * 86400000, pageviews: 185, visitors: 48 },
            { timestamp: Date.now(), pageviews: 10, visitors: 6 },
          ];

    const formatDate = (ts: number) => {
      const d = new Date(ts);
      if (period === '24h') {
        return d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      }
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    };

    chart.setOption({
      backgroundColor: 'transparent',
      grid: {
        left: 28,
        right: 12,
        top: 20,
        bottom: 24,
      },
      xAxis: {
        type: 'category',
        data: displaySeries.map((p) => formatDate(p.timestamp)),
        axisLine: { lineStyle: { color: '#2a2b2f' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#888888',
          fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace',
          margin: 10,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 300,
        interval: 100,
        splitLine: { lineStyle: { color: '#1c1d20', type: 'dashed' } },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#888888',
          fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace',
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#18191c',
        borderColor: '#383838',
        textStyle: {
          color: '#ffffff',
          fontFamily: 'Figtree, sans-serif',
          fontSize: 11,
        },
      },
      series: [
        {
          name: 'Visitors',
          type: 'line',
          data: displaySeries.map((p) => p.visitors),
          smooth: 0.25,
          symbol: 'none',
          lineStyle: {
            color: '#2dd4bf',
            width: 1.8,
            type: 'dotted',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(45, 212, 191, 0.16)' },
              { offset: 1, color: 'rgba(45, 212, 191, 0.0)' },
            ]),
          },
        },
        {
          name: 'Page Views',
          type: 'line',
          data: displaySeries.map((p) => p.pageviews),
          smooth: 0.25,
          symbol: 'none',
          lineStyle: {
            color: '#f43f5e',
            width: 1.8,
            type: 'dotted',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(244, 63, 94, 0.18)' },
              { offset: 1, color: 'rgba(244, 63, 94, 0.0)' },
            ]),
          },
        },
      ],
    });

    const handleResize = () => {
      if (chart && !chart.isDisposed()) {
        chart.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [series, period, echarts]);

  useEffect(() => {
    return () => {
      if (chartInstance.current && !chartInstance.current.isDisposed()) {
        chartInstance.current.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '220px' }}
    />
  );
}
