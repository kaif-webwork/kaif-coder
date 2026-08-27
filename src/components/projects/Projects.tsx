import { Link } from 'react-router';
import { HiArrowRight } from 'react-icons/hi2';
import { featuredProjects } from '../../data/projects';
import SectionTitle from '../sectionTitle/SectionTitle';
import ProjectCard from './ProjectCard';
import './Projects.css';

export default function Projects() {
  return (
    <section className="projects-section">
      <SectionTitle>My Projects</SectionTitle>
      <div className="projects-grid">
        {featuredProjects.map((project) => (
          <ProjectCard key={project.name} {...project} />
        ))}
      </div>
      <div className="projects-footer-action">
        <Link to="/projects" className="projects-more-btn">
          More Projects <HiArrowRight className="arrow" />
        </Link>
      </div>
      <div className="projects-section-divider" />
    </section>
  );
}
