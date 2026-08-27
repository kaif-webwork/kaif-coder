import { Link } from 'react-router';
import { FaGithub } from 'react-icons/fa';
import { HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';
import type { ProjectData } from '../../data/projects';
import { playClickSound } from '../../utils/sound';

export default function ProjectCard({
  banner,
  name,
  desc,
  tech,
  github,
  live,
  preview,
  badgeLeft,
  badgeRight,
  statusIcon,
  icon,
}: ProjectData) {
  return (
    <div className="project-card">
      <div className="project-banner-wrapper">
        <img src={banner} alt={name} className="project-banner" loading="lazy" />
        {badgeLeft && <span className="project-banner-badge-left">{badgeLeft}</span>}
        {badgeRight && <span className="project-banner-badge-right">{badgeRight}</span>}
      </div>

      <div className="project-content">
        <div className="project-header-row">
          <h3 className="project-title">
            {name}
            {icon && <img src={icon} alt={name} className="project-title-icon" />}
            {statusIcon && <span className="project-status-icon">{statusIcon}</span>}
          </h3>

          <div className="project-action-links">
            {preview && (
              <Link
                to={preview}
                className="project-action-btn"
                onClick={() => playClickSound()}
              >
                <HiOutlineArrowTopRightOnSquare /> Preview
              </Link>
            )}
            {live && (
              <a
                href={live}
                target="_blank"
                rel="noopener noreferrer"
                className="project-action-btn"
                onClick={() => playClickSound()}
              >
                <HiOutlineArrowTopRightOnSquare /> Live
              </a>
            )}
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="project-action-btn"
                onClick={() => playClickSound()}
              >
                <FaGithub /> GitHub
              </a>
            )}
          </div>
        </div>

        <p className="project-desc">{desc}</p>

        <div className="project-tech-section">
          <span className="project-tech-label">Technologies Used:</span>
          <div className="project-tech-list">
            {tech.map((t) => (
              <span key={t} className="project-tech-pill">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
