import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  HiArrowLeft,
  HiArrowRight,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCheckBadge,
  HiOutlineEye,
  HiOutlineClipboardDocumentCheck,
  HiOutlineSparkles,
  HiOutlineXMark,
  HiOutlineGlobeAlt,
  HiOutlineCloud,
  HiOutlineCommandLine,
  HiOutlinePaintBrush,
  HiOutlineFilm,
  HiOutlineCpuChip,
} from 'react-icons/hi2';
import { RiVerifiedBadgeFill } from 'react-icons/ri';
import SectionTitle from '../sectionTitle/SectionTitle';
import { certificatesList } from '../../data/certificates';
import { playClickSound } from '../../utils/sound';
import './CertificatesSection.css';

interface PreviewModalData {
  src: string;
  title: string;
}

const getCategoryIcon = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes('mern') || lower.includes('web')) return <HiOutlineGlobeAlt className="cert-category-icon" />;
  if (lower.includes('devops') || lower.includes('cloud')) return <HiOutlineCloud className="cert-category-icon" />;
  if (lower.includes('ai') || lower.includes('agent')) return <HiOutlineCpuChip className="cert-category-icon" />;
  if (lower.includes('dsa') || lower.includes('algorithm')) return <HiOutlineCommandLine className="cert-category-icon" />;
  if (lower.includes('graphic') || lower.includes('ui/ux') || lower.includes('design')) return <HiOutlinePaintBrush className="cert-category-icon" />;
  if (lower.includes('animation') || lower.includes('video') || lower.includes('audio')) return <HiOutlineFilm className="cert-category-icon" />;
  return <HiOutlineSparkles className="cert-category-icon" />;
};

export default function CertificatesSection() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<PreviewModalData | null>(null);

  const handleCopyId = (id: string) => {
    playClickSound();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id).catch(() => {});
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleOpenLightbox = (src: string, title: string) => {
    playClickSound();
    setPreviewImage({ src, title });
  };

  const handleCloseLightbox = () => {
    playClickSound();
    setPreviewImage(null);
  };

  // Close lightbox on Escape key & manage body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewImage) {
        setPreviewImage(null);
      }
    };

    if (previewImage) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewImage]);

  return (
    <div className="all-projects-container cert-clean-page">
      <SectionTitle>/certificates</SectionTitle>

      <p className="certificates-subtitle">
        Verified professional credentials &amp; certified technical programs.
      </p>

      {/* Certificates Stack */}
      <div className="cert-cards-stack">
        {certificatesList.map((cert) => (
          <div key={cert.id} className="cert-clean-card">
            {/* Top Header Row */}
            <div className="cert-clean-top">
              <div className="cert-status-badge">
                <span
                  className="status-live-dot"
                  style={{
                    background: cert.accentColor,
                    boxShadow: `0 0 8px ${cert.accentColor}99`,
                  }}
                />
                <RiVerifiedBadgeFill
                  className="verified-icon"
                  style={{ color: cert.accentColor }}
                />
                <span>Officially Verified Credential</span>
              </div>
              <span className="cert-institute-badge">{cert.issuerBadge}</span>
            </div>

            {/* Header Titles */}
            <div className="cert-card-header-info">
              <h2 className="cert-main-title">{cert.title}</h2>
              <p className="cert-issuer-line">{cert.issuer}</p>
            </div>

            {/* Prominent Large Certificate Document Preview - SAME PAGE MODAL */}
            <div className="cert-large-preview-wrap">
              <button
                type="button"
                className="cert-large-preview-link"
                title="Click to view full certificate on this page"
                onClick={() => handleOpenLightbox(cert.image, cert.title)}
              >
                <img
                  src={cert.image}
                  alt={`${cert.title} - Mohd Kaif - ${cert.issuer}`}
                  className={`cert-large-img ${cert.id === 'maac-apdmd' ? 'portrait' : 'landscape'}`}
                  loading="eager"
                />
                <div className="cert-large-hover-overlay">
                  <HiOutlineEye className="overlay-icon" />
                  <span>Click to view in full resolution</span>
                </div>
              </button>
            </div>

            {/* Structured Specifications Grid */}
            <div className="cert-spec-grid">
              {cert.grade && (
                <div className="cert-spec-cell">
                  <span className="spec-label">Grade Awarded</span>
                  <span className="spec-value highlight-gold">{cert.grade}</span>
                </div>
              )}

              {cert.programType && (
                <div className="cert-spec-cell">
                  <span className="spec-label">Program Type</span>
                  <span className="spec-value">{cert.programType}</span>
                </div>
              )}

              {cert.specialization && (
                <div className="cert-spec-cell">
                  <span className="spec-label">Specialization</span>
                  <span className="spec-value">{cert.specialization}</span>
                </div>
              )}

              {cert.instructor && (
                <div className="cert-spec-cell">
                  <span className="spec-label">Instructor</span>
                  <span className="spec-value">{cert.instructor}</span>
                </div>
              )}

              <div className="cert-spec-cell">
                <span className="spec-label">Date of Completion</span>
                <span className="spec-value">{cert.issueDate}</span>
              </div>

              {cert.location && (
                <div className="cert-spec-cell">
                  <span className="spec-label">
                    {cert.id === 'sheryians-ai-cohort' ? 'Learning Format' : 'Training Center'}
                  </span>
                  <span className="spec-value">{cert.location}</span>
                </div>
              )}

              <div className="cert-spec-cell cert-id-spec-cell">
                <span className="spec-label">Credential ID</span>
                <button
                  type="button"
                  className={`spec-copy-btn ${copiedId === cert.credentialId ? 'copied' : ''}`}
                  onClick={() => handleCopyId(cert.credentialId)}
                  title="Click to copy Credential ID"
                >
                  {copiedId === cert.credentialId ? (
                    <>
                      <span className="spec-mono">Copied to Clipboard</span>
                      <HiOutlineClipboardDocumentCheck className="copy-icon" />
                    </>
                  ) : (
                    <>
                      <span className="spec-mono">{cert.credentialId}</span>
                      <span className="copy-icon">⧉</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="cert-actions-cluster">
              {cert.credentialUrl && (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cert-btn cert-btn-primary"
                  onClick={() => playClickSound()}
                >
                  <HiOutlineCheckBadge className="btn-icon" />
                  <span>Verify Online</span>
                  <HiOutlineArrowTopRightOnSquare className="btn-icon-ext" />
                </a>
              )}

              {/* Same-Page View Button - No Redirect */}
              <button
                type="button"
                className="cert-btn cert-btn-secondary"
                onClick={() => handleOpenLightbox(cert.image, cert.title)}
                title="View full certificate document"
              >
                <HiOutlineEye className="btn-icon" />
                <span>View Certificate</span>
              </button>
            </div>

            {/* Clean Structured Modules / Skills Section */}
            <div className="cert-modules-container">
              <div className="cert-modules-title-row">
                <HiOutlineSparkles
                  className="modules-sparkle"
                  style={{ color: cert.accentColor }}
                />
                <h3 className="cert-modules-title">
                  Curriculum &amp; Skills Covered ({cert.skills.length} Competencies)
                </h3>
              </div>

              {cert.moduleCategories && cert.moduleCategories.length > 0 ? (
                <div className="cert-categories-grid">
                  {cert.moduleCategories.map((cat) => (
                    <div key={cat.title} className="cert-category-block">
                      <h4 className="cert-category-label">
                        {getCategoryIcon(cat.title)}
                        <span>{cat.title}</span>
                      </h4>
                      <div className="cert-pills-wrap">
                        {cat.skills.map((skill) => (
                          <span key={skill} className="cert-skill-pill">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cert-pills-wrap">
                  {cert.skills.map((skill) => (
                    <span key={skill} className="cert-skill-pill">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons Row */}
      <div className="all-projects-navigation-row">
        <Link
          to="/"
          className="projects-nav-pill-btn"
          onClick={() => playClickSound()}
          aria-label="Back to Home"
        >
          <HiArrowLeft /> <span>Back to Home</span>
        </Link>
        <Link
          to="/resume"
          className="projects-nav-pill-btn"
          onClick={() => playClickSound()}
          aria-label="View Resume"
        >
          <span>View Resume</span> <HiArrowRight />
        </Link>
      </div>

      {/* Same-Page Lightbox Modal (No Redirect!) */}
      {previewImage && (
        <div
          className="cert-lightbox-overlay"
          onClick={handleCloseLightbox}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="cert-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dedicated Top Header Bar - Never Overlaps Certificate Image */}
            <div className="cert-lightbox-header">
              <div className="cert-lightbox-header-title">
                <RiVerifiedBadgeFill className="lightbox-verified-icon" />
                <span className="lightbox-header-text">{previewImage.title}</span>
              </div>
              <button
                type="button"
                className="cert-lightbox-close-btn"
                onClick={handleCloseLightbox}
                aria-label="Close"
                title="Close"
              >
                <HiOutlineXMark />
              </button>
            </div>

            {/* Certificate Image - 100% Unobstructed Full View */}
            <div className="cert-lightbox-img-wrapper">
              <img
                src={previewImage.src}
                alt={previewImage.title}
                className="cert-lightbox-img"
              />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
