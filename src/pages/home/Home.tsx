import { lazy, Suspense } from 'react';
import { useSEO } from '../../hooks/useSEO';
import HeroSection from '../../components/heroSection/HeroSection';
import SkillSection from '../../components/skillSection/SkillSection';

// Below-the-fold sections are code-split & lazy-loaded to achieve 100% mobile Lighthouse performance
const Experience = lazy(() => import('../../components/experience/Experience'));
const Projects = lazy(() => import('../../components/projects/Projects'));
const UsesSection = lazy(() => import('../../components/uses/UsesSection'));
const AnalyticsSection = lazy(() => import('../../components/analyticsSection/AnalyticsSection'));
const ContactMe = lazy(() => import('../../components/contactMe/ContactMe'));
const Footer = lazy(() => import('../../components/footer/Footer'));

export default function Home() {
  useSEO({
    title: 'Mohd Kaif (kaifcoder) | Full Stack Developer & AI Engineer',
    description:
      'Official portfolio of Mohd Kaif (kaifcoder). Full Stack Developer & AI Engineer based in Delhi, India. Creator of AdZero, building high-performance web applications with React, TypeScript, Node.js, Python, Docker, and Generative AI.',
    canonical: 'https://www.kaifcoder.in/',
    keywords:
      'Mohd Kaif, kaifcoder, kaif coder, kaif, kaifcodr, mohd kaif portfolio, kaif coder portfolio, mohd kaif developer, kaif developer, full stack developer delhi, full stack developer india, mohd kaif full stack developer, mohd kaif ai engineer, adzero, sheryians mohd kaif, react developer, node.js developer, python developer, kaifcoder.in, www.kaifcoder.in',
  });

  return (
    <main className="home-page">
      <HeroSection />
      <SkillSection />
      <Suspense fallback={<div style={{ minHeight: '260px' }} />}>
        <Experience />
      </Suspense>
      <Suspense fallback={<div style={{ minHeight: '380px' }} />}>
        <Projects />
      </Suspense>
      <Suspense fallback={<div style={{ minHeight: '140px' }} />}>
        <UsesSection />
      </Suspense>
      <Suspense fallback={<div style={{ minHeight: '320px' }} />}>
        <AnalyticsSection />
      </Suspense>
      <Suspense fallback={<div style={{ minHeight: '160px' }} />}>
        <ContactMe />
      </Suspense>
      <Suspense fallback={<div style={{ minHeight: '90px' }} />}>
        <Footer />
      </Suspense>
    </main>
  );
}
