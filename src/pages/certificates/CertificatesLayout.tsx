import { useSEO } from '../../hooks/useSEO';
import CertificatesSection from '../../components/certificates/CertificatesSection';
import Footer from '../../components/footer/Footer';
import './CertificatesLayout.css';

export default function CertificatesLayout() {
  useSEO({
    title: 'Certifications | Mohd Kaif (kaifcoder) - Full Stack & AI Engineer',
    description:
      'Verified technical certifications, engineering specializations, and professional credentials achieved by Mohd Kaif (kaifcoder / kaif coder). Includes Sheryians AI Cohort and MAAC APDMD.',
    canonical: 'https://www.kaifcoder.in/certificates',
    keywords:
      'Mohd Kaif certificates, kaif coder certifications, Sheryians cohort certificate, MAAC certificate Mohd Kaif, 2.0 Job Ready AI Powered Cohort, kaifcoder credentials',
  });

  return (
    <div className="projects-page-wrapper">
      <CertificatesSection />
      <Footer />
    </div>
  );
}
