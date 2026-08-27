import { useSEO } from '../../hooks/useSEO';
import HeroSection from '../../components/heroSection/HeroSection';
import SkillSection from '../../components/skillSection/SkillSection';
import Experience from '../../components/experience/Experience';
import Projects from '../../components/projects/Projects';
import UsesSection from '../../components/uses/UsesSection';
import AnalyticsSection from '../../components/analyticsSection/AnalyticsSection';
import ContactMe from '../../components/contactMe/ContactMe';
import Footer from '../../components/footer/Footer';

export default function Home() {
  useSEO({
    title: 'Mohd Kaif (kaifcoder) | Full Stack Developer • kaifcoder.in',
    description:
      'Mohd Kaif (kaifcoder / kaif coder) is a Full Stack Developer based in Delhi, India. Building scalable web & mobile apps with React, TypeScript, Node.js, Python, and open source projects.',
    canonical: 'https://www.kaifcoder.in/',
  });

  return (
    <main className="home-page">
      <HeroSection />
      <SkillSection />
      <Experience />
      <Projects />
      <UsesSection />
      <AnalyticsSection />
      <ContactMe />
      <Footer />
    </main>
  );
}
