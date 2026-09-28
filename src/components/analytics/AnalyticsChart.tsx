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

  // Initialize ECharts instance on mount and handle cleanup on unmount
  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current || chartInstance.current.isDisposed()) {
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        renderer: 'canvas',
      });
    }

    let resizeTimer: number;
    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (chartInstance.current && !chartInstance.current.isDisposed()) {
          chartInstance.current.resize();
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.clearTimeout(resizeTimer);
      if (chartInstance.current && !chartInstance.current.isDisposed()) {
        chartInstance.current.dispose();
      }
      chartInstance.current = null;
    };
  }, []);

  // Update chart options smoothly when data or period changes WITHOUT destroying canvas
  useEffect(() => {
    if (!chartRef.current) return;

    // Ensure instance is ready
    if (!chartInstance.current || chartInstance.current.isDisposed()) {
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        renderer: 'canvas',
      });
    }

    const chart = chartInstance.current;
    if (!chart) return;

    const displaySeries = Array.isArray(series) ? series : [];

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

    const formatTooltipDate = (ts: number) => {
      const d = new Date(ts);
      if (period === '24h') {
        const datePart = d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const timePart = d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        return `${datePart} • ${timePart}`;
      }
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    // Calculate maximum value safely with NaN guard
    const numbersList = displaySeries.flatMap((p) => [
      typeof p?.pageviews === 'number' && !isNaN(p.pageviews) ? p.pageviews : 0,
      typeof p?.visitors === 'number' && !isNaN(p.visitors) ? p.visitors : 0,
    ]);
    const computedMax = numbersList.length > 0 ? Math.max(...numbersList, 5) : 5;
    const maxVal = isFinite(computedMax) ? computedMax : 10;
    const yAxisMax = maxVal <= 10 ? 10 : Math.ceil(maxVal * 1.2);

    try {
      chart.setOption(
        {
          backgroundColor: 'transparent',
          animationDuration: 450,
          animationEasing: 'cubicOut',
          grid: {
            left: 12,
            right: 14,
            top: 22,
            bottom: 12,
            containLabel: true,
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
              interval: period === '24h' ? 3 : period === '30d' ? 4 : 0,
              showMinLabel: true,
              showMaxLabel: true,
            },
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: yAxisMax,
            minInterval: 1,
            splitNumber: 4,
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
            backgroundColor: '#0b0d0e',
            borderColor: '#383838',
            borderWidth: 1,
            borderType: 'dashed',
            padding: [10, 14],
            extraCssText:
              'border: 1px dashed #383838 !important; border-radius: 0px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6); pointer-events: none; backdrop-filter: blur(4px);',
            axisPointer: {
              type: 'line',
              lineStyle: {
                color: '#383838',
                type: 'dashed',
                width: 1,
              },
            },
            formatter: (params: any) => {
              if (!Array.isArray(params) || params.length === 0) return '';
              const dataIndex = params[0].dataIndex;
              const point = displaySeries[dataIndex];
              const dateStr = point
                ? formatTooltipDate(point.timestamp)
                : params[0].axisValueLabel || '';

              let visitors = 0;
              let pageviews = 0;

              if (point) {
                visitors = typeof point.visitors === 'number' ? point.visitors : 0;
                pageviews = typeof point.pageviews === 'number' ? point.pageviews : 0;
              } else {
                params.forEach((item: any) => {
                  if (item.seriesName === 'Visitors') {
                    visitors = typeof item.value === 'number' ? item.value : 0;
                  } else if (item.seriesName === 'Page Views') {
                    pageviews = typeof item.value === 'number' ? item.value : 0;
                  }
                });
              }

              return `
                <div style="font-family: 'Figtree', sans-serif; min-width: 145px; user-select: none;">
                  <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 8px; line-height: 1.2;">
                    ${dateStr}
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 5px;">
                    <div style="display: flex; align-items: center; gap: 7px;">
                      <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #2dd4bf; flex-shrink: 0;"></span>
                      <span style="font-size: 12px; color: #9ca3af; font-weight: 400;">Visitors</span>
                    </div>
                    <span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: -0.2px;">
                      ${visitors.toLocaleString()}
                    </span>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 24px;">
                    <div style="display: flex; align-items: center; gap: 7px;">
                      <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #f43f5e; flex-shrink: 0;"></span>
                      <span style="font-size: 12px; color: #9ca3af; font-weight: 400;">Page Views</span>
                    </div>
                    <span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: -0.2px;">
                      ${pageviews.toLocaleString()}
                    </span>
                  </div>
                </div>
              `;
            },
          },
          series: [
            {
              name: 'Visitors',
              type: 'line',
              data: displaySeries.map((p) =>
                typeof p?.visitors === 'number' && !isNaN(p.visitors) ? p.visitors : 0
              ),
              smooth: 0.25,
              showSymbol: false,
              symbol: 'circle',
              symbolSize: 6,
              itemStyle: {
                color: '#2dd4bf',
                borderColor: '#0b0d0e',
                borderWidth: 1.5,
              },
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
              data: displaySeries.map((p) =>
                typeof p?.pageviews === 'number' && !isNaN(p.pageviews) ? p.pageviews : 0
              ),
              smooth: 0.25,
              showSymbol: false,
              symbol: 'circle',
              symbolSize: 6,
              itemStyle: {
                color: '#f43f5e',
                borderColor: '#0b0d0e',
                borderWidth: 1.5,
              },
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
        },
        true // notMerge: true ensures clean dataset swap without disposing canvas
      );
    } catch {
      // suppress chart setOption errors
    }
  }, [series, period]);

  return <div ref={chartRef} style={{ width: '100%', height: '220px' }} />;
}
