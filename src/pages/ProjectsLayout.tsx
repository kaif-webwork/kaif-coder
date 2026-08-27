import { useSEO } from '../hooks/useSEO';
import AllProjects from '../components/projects/AllProjects';
import Footer from '../components/footer/Footer';

export default function ProjectsLayout() {
  useSEO({
    title: 'Projects by Mohd Kaif | Full Stack Developer • kaifcoder.in',
    description:
      'Explore projects built by Mohd Kaif (kaifcoder / kaif coder) including AdZero Android App, full stack web apps, AI tools, and open source repositories.',
    canonical: 'https://www.kaifcoder.in/projects',
  });

  return (
    <div className="projects-page-wrapper">
      <AllProjects />
      <Footer />
    </div>
  );
}
