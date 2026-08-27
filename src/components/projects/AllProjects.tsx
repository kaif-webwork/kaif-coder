import { Link } from 'react-router';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi2';
import { allProjects } from '../../data/projects';
import SectionTitle from '../sectionTitle/SectionTitle';
import ProjectCard from './ProjectCard';
import './Projects.css';

export default function AllProjects() {
  return (
    <div className="all-projects-container">
      <SectionTitle>My Projects</SectionTitle>

      <div className="projects-grid">
        {allProjects.map((project) => (
          <ProjectCard key={project.name} {...project} />
        ))}
      </div>

      <div className="all-projects-navigation-row">
        <Link to="/" className="projects-nav-pill-btn">
          <HiArrowLeft /> <span>Back to Home</span>
        </Link>
        <Link to="/blogs" className="projects-nav-pill-btn">
          <span>View Blogs</span> <HiArrowRight />
        </Link>
      </div>
    </div>
  );
}
