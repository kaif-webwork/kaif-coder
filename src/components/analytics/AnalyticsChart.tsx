import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { graphic } from 'echarts/core';
import type { AnalyticsPeriod, AnalyticsSeriesPoint } from '../../data/analytics';

// Register only needed ECharts modules to drastically reduce bundle size
echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

interface AnalyticsChartProps {
  period: AnalyticsPeriod;
  series: AnalyticsSeriesPoint[];
}

export default function AnalyticsChart({ period, series }: AnalyticsChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current || chartInstance.current.isDisposed()) {
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        renderer: 'canvas',
      });
    }

    const chart = chartInstance.current;
    const displaySeries = series || [];

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

    const maxVal = Math.max(
      ...displaySeries.map((p) => Math.max(p.pageviews, p.visitors)),
      5
    );

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
        max: maxVal <= 10 ? 10 : Math.ceil(maxVal * 1.2),
        minInterval: 1,
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
            color: new graphic.LinearGradient(0, 0, 0, 1, [
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
            color: new graphic.LinearGradient(0, 0, 0, 1, [
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
  }, [series, period]);

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
