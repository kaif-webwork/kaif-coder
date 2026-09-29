import { useSEO } from '../hooks/useSEO';
import AllProjects from '../components/projects/AllProjects';
import Footer from '../components/footer/Footer';

export default function ProjectsLayout() {
  useSEO({
    title: 'Projects by Mohd Kaif (kaifcoder) | Full Stack & AI Projects',
    description:
      'Explore projects built by Mohd Kaif (kaifcoder / kaif coder) including AdZero Android App, full stack web apps, AI agentic systems, and open source repositories.',
    canonical: 'https://www.kaifcoder.in/projects',
    keywords:
      'Mohd Kaif projects, kaif coder projects, AdZero, AdZero app Mohd Kaif, full stack projects, AI projects, React projects, kaifcoder portfolio',
  });

  return (
    <div className="projects-page-wrapper">
      <AllProjects />
      <Footer />
    </div>
  );
}
