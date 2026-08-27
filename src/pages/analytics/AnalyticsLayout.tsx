import AnalyticsDashboard from '../../components/analytics/AnalyticsDashboard';
import Footer from '../../components/footer/Footer';
import '../blogs/BlogLayout.css';

export default function AnalyticsLayout() {
  return (
    <div className="analytics-page-wrapper">
      <div className="blog-layout-page">
        <h1 className="blog-layout-title">Site Analytics</h1>
        <p className="blog-layout-subtitle">
          Real-time, privacy-friendly analytics and traffic metrics powering kaifcoder.in.
        </p>

        <AnalyticsDashboard />
      </div>
      <Footer />
    </div>
  );
}
