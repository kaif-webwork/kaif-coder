import { Link } from 'react-router';
import { HiArrowLeft, HiOutlineEnvelope, HiOutlineSparkles, HiOutlineClock } from 'react-icons/hi2';
import { FaGithub } from 'react-icons/fa';
import { useSEO } from '../../hooks/useSEO';
import SectionTitle from '../../components/sectionTitle/SectionTitle';
import Footer from '../../components/footer/Footer';
import { playClickSound } from '../../utils/sound';
import './ResumeLayout.css';

export default function ResumeLayout() {
  useSEO({
    title: 'Resume | Mohd Kaif - Full Stack Developer • kaifcoder.in',
    description:
      'Mohd Kaif (kaifcoder / kaif coder) Full Stack Developer resume. Skills in React, TypeScript, Node.js, Python, MongoDB, MySQL, and scalable systems.',
    canonical: 'https://www.kaifcoder.in/resume',
  });

  return (
    <div className="resume-page-wrapper">
      <div className="resume-page">
        <SectionTitle>/resume</SectionTitle>

        <p className="resume-subtitle">
          Professional background, technical stack, and career history.
        </p>

        {/* Coming Soon Showcase Card */}
        <div className="resume-coming-soon-card">
          <div className="resume-icon-badge-wrapper">
            <div className="resume-icon-badge">
              <HiOutlineClock className="resume-clock-icon" />
              <HiOutlineSparkles className="resume-sparkle-mini" />
            </div>
          </div>

          <div className="resume-status-pill">
            <span className="resume-status-dot" />
            <span>Currently Under Revision</span>
          </div>

          <h2 className="resume-soon-heading">Resume Coming Soon</h2>

          <p className="resume-soon-desc">
            I am currently refining my resume with my latest full-stack software engineering projects, system architectures, and production accomplishments.
          </p>

          {/* Highlights Row */}
          <div className="resume-specs-row">
            <div className="resume-spec-box">
              <span className="spec-tag">Status</span>
              <span className="spec-val">Updating Experience</span>
            </div>
            <div className="resume-spec-box">
              <span className="spec-tag">Formats</span>
              <span className="spec-val">PDF &amp; Inline Viewer</span>
            </div>
            <div className="resume-spec-box">
              <span className="spec-tag">Availability</span>
              <span className="spec-val">Soon ✦</span>
            </div>
          </div>

          {/* Direct CTA Buttons */}
          <div className="resume-actions-row">
            <a
              href="mailto:kaif.webwork@gmail.com"
              className="resume-primary-cta"
              onClick={() => playClickSound()}
            >
              <HiOutlineEnvelope className="cta-icon" />
              <span>Request via Email</span>
            </a>

            <a
              href="https://github.com/kaif-webwork"
              target="_blank"
              rel="noopener noreferrer"
              className="resume-secondary-cta"
              onClick={() => playClickSound()}
            >
              <FaGithub className="cta-icon" />
              <span>GitHub Profile</span>
            </a>
          </div>
        </div>

        {/* Back Navigation */}
        <div className="resume-nav-row">
          <Link
            to="/"
            className="resume-nav-btn"
            aria-label="back to home"
            onClick={() => playClickSound()}
          >
            <HiArrowLeft />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
