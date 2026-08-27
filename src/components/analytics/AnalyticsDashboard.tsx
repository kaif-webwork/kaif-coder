import { useState } from 'react';
import { LuSettings } from 'react-icons/lu';
import { useAnalytics } from '../../hooks/useAnalytics';
import AnalyticsChart from './AnalyticsChart';
import './Analytics.css';

type Period = '24h' | '7d' | '30d';

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>('7d');
  const { data, loading } = useAnalytics(period);

  const visitorsCount = data?.visitors ?? 268;
  const pageviewsCount = data?.pageviews ?? 799;

  return (
    <div className="analytics-dashboard">
      {/* Top 2 Stat Cards */}
      <div className="analytics-stats-row">
        <div className="analytics-stat-card">
          <div className="analytics-stat-label">Visitors</div>
          <div className="analytics-stat-value">{visitorsCount}</div>
          <div className="analytics-stat-indicator down">↓ 33.0%</div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-label">Page Views</div>
          <div className="analytics-stat-value">{pageviewsCount}</div>
          <div className="analytics-stat-indicator down">↓ 23.4%</div>
        </div>
      </div>

      {/* Chart Box */}
      <div className="analytics-chart-box">
        <div className="analytics-chart-header">
          <div className="analytics-chart-filename">
            <LuSettings className="analytics-gear-icon" />
            <span className="analytics-filename-text">~/analytics.tsx</span>
          </div>

          <div className="analytics-period-buttons">
            <button
              className={`analytics-period-tab ${period === '24h' ? 'active' : ''}`}
              onClick={() => setPeriod('24h')}
            >
              24H
            </button>
            <button
              className={`analytics-period-tab ${period === '7d' ? 'active' : ''}`}
              onClick={() => setPeriod('7d')}
            >
              7D
            </button>
            <button
              className={`analytics-period-tab ${period === '30d' ? 'active' : ''}`}
              onClick={() => setPeriod('30d')}
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
