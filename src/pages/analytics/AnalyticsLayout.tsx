import { useSEO } from '../../hooks/useSEO';
import AnalyticsDashboard from '../../components/analytics/AnalyticsDashboard';
import Footer from '../../components/footer/Footer';
import '../blogs/BlogLayout.css';

export default function AnalyticsLayout() {
  useSEO({
    title: 'Traffic & Analytics | kaifcoder.in • Mohd Kaif',
    description:
      'Real-time, privacy-friendly analytics and traffic metrics for kaifcoder.in - Mohd Kaif portfolio.',
    canonical: 'https://www.kaifcoder.in/analytics',
  });

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
