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
      <Experience />
      <Projects />
      <UsesSection />
      <AnalyticsSection />
      <ContactMe />
      <Footer />
    </main>
  );
}
