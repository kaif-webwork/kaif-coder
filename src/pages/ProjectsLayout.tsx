import AllProjects from '../components/projects/AllProjects';
import Footer from '../components/footer/Footer';

export default function ProjectsLayout() {
  return (
    <div className="projects-page-wrapper">
      <AllProjects />
      <Footer />
    </div>
  );
}
