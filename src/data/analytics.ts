export type AnalyticsPeriod = '24h' | '7d' | '30d';

export interface AnalyticsSeriesPoint {
  timestamp: number;
  pageviews: number;
  visitors: number;
}

export interface AnalyticsPeriodOption {
  value: AnalyticsPeriod;
  label: string;
}

export const analyticsPeriods: AnalyticsPeriodOption[] = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

export interface AnalyticsData {
  pageviews: number;
  visitors: number;
  series: AnalyticsSeriesPoint[];
}
