import { useState } from 'react';
import { LuSettings } from 'react-icons/lu';
import { useAnalytics } from '../../hooks/useAnalytics';
import AnalyticsChart from './AnalyticsChart';
import './Analytics.css';

type Period = '24h' | '7d' | '30d';

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>('7d');
  const { data, loading } = useAnalytics(period);

  const visitorsCount = data?.visitors ?? 0;
  const pageviewsCount = data?.pageviews ?? 0;
  const visitorsGrowth = data?.growthVisitors ?? '0.0%';
  const pageviewsGrowth = data?.growthPageviews ?? '0.0%';
  const visitorsStatus = data?.growthVisitorsStatus ?? 'neutral';
  const pageviewsStatus = data?.growthPageviewsStatus ?? 'neutral';

  return (
    <div className="analytics-dashboard">
      {/* Top 2 Stat Cards */}
      <div className="analytics-stats-row">
        <div className="analytics-stat-card">
          <div className="analytics-stat-label">
            Visitors {period === '24h' ? '(24H)' : period === '7d' ? '(7D)' : '(30D)'}
          </div>
          <div className="analytics-stat-value">
            {loading && !data ? '...' : visitorsCount.toLocaleString()}
          </div>
          <div className={`analytics-stat-indicator ${loading && !data ? 'neutral' : visitorsStatus}`}>
            {loading && !data ? '—' : visitorsGrowth}
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-label">
            Page Views {period === '24h' ? '(24H)' : period === '7d' ? '(7D)' : '(30D)'}
          </div>
          <div className="analytics-stat-value">
            {loading && !data ? '...' : pageviewsCount.toLocaleString()}
          </div>
          <div className={`analytics-stat-indicator ${loading && !data ? 'neutral' : pageviewsStatus}`}>
            {loading && !data ? '—' : pageviewsGrowth}
          </div>
        </div>
      </div>

      {data?.totalLifetimeVisitors !== undefined && (
        <div className="analytics-lifetime-bar">
          <span className="analytics-lifetime-dot" />
          <span className="analytics-lifetime-text">
            All-Time Total: <strong>{data.totalLifetimeVisitors.toLocaleString()}</strong> Visitors • <strong>{(data.totalLifetimePageviews ?? 0).toLocaleString()}</strong> Page Views
          </span>
        </div>
      )}

      {/* Chart Box */}
      <div className="analytics-chart-box">
        <div className="analytics-chart-header">
          <div className="analytics-chart-filename">
            <LuSettings className="analytics-gear-icon" />
            <span className="analytics-filename-text">~/analytics.tsx</span>
          </div>

          <div className="analytics-period-buttons">
            <button
              type="button"
              className={`analytics-period-tab ${period === '24h' ? 'active' : ''}`}
              onClick={() => setPeriod('24h')}
              aria-label="View 24-hour analytics"
              aria-pressed={period === '24h'}
            >
              24H
            </button>
            <button
              type="button"
              className={`analytics-period-tab ${period === '7d' ? 'active' : ''}`}
              onClick={() => setPeriod('7d')}
              aria-label="View 7-day analytics"
              aria-pressed={period === '7d'}
            >
              7D
            </button>
            <button
              type="button"
              className={`analytics-period-tab ${period === '30d' ? 'active' : ''}`}
              onClick={() => setPeriod('30d')}
              aria-label="View 30-day analytics"
              aria-pressed={period === '30d'}
            >
              30D
            </button>
          </div>
        </div>

        <div className="analytics-legend-row">
          <span className="analytics-legend-item">
            <span className="analytics-legend-dot teal" /> Visitors
          </span>
          <span className="analytics-legend-item">
            <span className="analytics-legend-dot red" /> Page Views
          </span>
        </div>

        <div className="analytics-chart-render">
          {loading && !data ? (
            <div className="analytics-loading-placeholder">Loading analytics...</div>
          ) : (
            <AnalyticsChart period={period} series={data?.series || []} />
          )}
        </div>
      </div>
    </div>
  );
}
