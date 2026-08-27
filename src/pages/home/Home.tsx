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
    title: 'Mohd Kaif | Full Stack Developer | Portfolio',
    description:
      'Mohd Kaif (kaifcoder) is a Full Stack Developer based in Delhi, India. Creator of AdZero, building high-performance web & mobile applications with React, TypeScript, Node.js, and Python.',
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
