import { useRef } from 'react';
import { HiChevronDown, HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';

interface ExperienceCardProps {
  company: string;
  link?: string;
  status: string;
  statusText?: string;
  role: string;
  dates: string;
  logoUrl?: string;
  description: string[];
  isExpanded: boolean;
  onToggle: () => void;
}

export default function ExperienceCard({
  logoUrl,
  company,
  link,
  status,
  statusText,
  role,
  dates,
  description,
  isExpanded,
  onToggle,
}: ExperienceCardProps) {
  const touchStartY = useRef<number | null>(null);
  const isScrolling = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    isScrolling.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current !== null && Math.abs(e.touches[0].clientY - touchStartY.current) > 8) {
      isScrolling.current = true;
    }
  };

  const handleClick = () => {
    if (isScrolling.current) return;
    onToggle();
  };

  return (
    <div className="exp-card">
      <span className={`exp-dot ${status}`} />
      <div
        className="exp-header"
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <div className="exp-logo">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={company}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const target = e.target as HTMLElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <span className="exp-logo-fallback">{company.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div className="exp-info">
          <div className="exp-company-row">
            <span className="exp-company">{company}</span>
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="exp-company-ext-link"
                onClick={(e) => e.stopPropagation()}
                title="Open link"
                aria-label={`Visit ${company}`}
              >
                <HiOutlineArrowTopRightOnSquare />
              </a>
            )}
            <span className={`exp-status-pill ${status}`}>
              <span className="exp-status-dot-inner" />
              {statusText || (status === 'present' ? 'Active' : 'Done')}
            </span>
          </div>
          <div className="exp-role">{role}</div>
        </div>

        <div className="exp-right-meta">
          <span className="exp-dates">{dates}</span>
          <span className={`exp-expand-btn ${isExpanded ? 'expanded' : ''}`}>
            <HiChevronDown />
          </span>
        </div>
      </div>

      <div className={`exp-content-wrapper ${isExpanded ? 'expanded' : ''}`}>
        <div className="exp-content">
          <ul className="exp-description">
            {description.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
