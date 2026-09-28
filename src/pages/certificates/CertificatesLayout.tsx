import { useSEO } from '../../hooks/useSEO';
import CertificatesSection from '../../components/certificates/CertificatesSection';
import Footer from '../../components/footer/Footer';

export default function CertificatesLayout() {
  useSEO({
    title: 'Certifications | Mohd Kaif - Full Stack Developer • kaifcoder.in',
    description:
      'Verified technical certifications, engineering specializations, and professional credentials achieved by Mohd Kaif (kaifcoder / kaif coder).',
    canonical: 'https://www.kaifcoder.in/certificates',
  });

  return (
    <div className="projects-page-wrapper">
      <CertificatesSection />
      <Footer />
    </div>
  );
}
