import SectionTitle from '../sectionTitle/SectionTitle';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';
import '../analytics/Analytics.css';

export default function AnalyticsSection() {
  return (
    <section className="analytics-section">
      <SectionTitle>/analytics</SectionTitle>
      <AnalyticsDashboard />
      <div className="analytics-section-divider" />
    </section>
  );
}
