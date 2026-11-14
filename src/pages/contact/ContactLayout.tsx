import { useState } from 'react';
import { Link } from 'react-router';
import { useSEO } from '../../hooks/useSEO';
import { FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import {
  HiOutlineEnvelope,
  HiOutlineClipboardDocument,
  HiOutlineCheck,
  HiArrowTopRightOnSquare,
  HiOutlineDocumentArrowDown,
} from 'react-icons/hi2';
import SectionTitle from '../../components/sectionTitle/SectionTitle';
import Footer from '../../components/footer/Footer';
import { playClickSound } from '../../utils/sound';
import './ContactLayout.css';

interface Channel {
  name: string;
  handle: string;
  url: string;
  icon: React.ReactNode;
  isInternal?: boolean;
}

const channels: Channel[] = [
  {
    name: 'LinkedIn',
    handle: 'in/mohd-kaif-6a453741a',
    url: 'https://www.linkedin.com/in/mohd-kaif-6a453741a?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    icon: <FaLinkedin />,
  },
  {
    name: 'GitHub',
    handle: 'kaif-webwork',
    url: 'https://github.com/kaif-webwork',
    icon: <FaGithub />,
  },
  {
    name: 'X (Twitter)',
    handle: '@kaif_coder',
    url: 'https://x.com/kaif_coder',
    icon: <FaXTwitter />,
  },
  {
    name: 'Instagram',
    handle: '@Kaif_Coder',
    url: 'https://instagram.com/Kaif_Coder',
    icon: <FaInstagram />,
  },
  {
    name: 'Resume',
    handle: 'View & Download CV',
    url: '/resume',
    icon: <HiOutlineDocumentArrowDown />,
    isInternal: true,
  },
];

export default function ContactLayout() {
  useSEO({
    title: 'Get in Touch | Mohd Kaif (kaifcoder) • Full Stack & AI Engineer',
    description:
      'Connect with Mohd Kaif (kaifcoder / kaif coder). Full Stack Developer & AI Engineer based in Delhi, India. Open for full-time roles, high-impact contracts, and collaborations via hello@kaifcoder.in.',
    canonical: 'https://www.kaifcoder.in/contact',
    keywords:
      'Contact Mohd Kaif, kaifcoder contact, hire Mohd Kaif, kaif coder email, hello@kaifcoder.in, full stack developer delhi, ai engineer contact, kaifcoder portfolio',
  });

  const [copied, setCopied] = useState(false);
  const email = 'hello@kaifcoder.in';

  const handleCopyEmail = async () => {
    playClickSound();
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="contact-page-wrapper">
      <div className="contact-page">
        <div className="contact-header-box">
          <SectionTitle>/contact</SectionTitle>
        </div>

        <p className="contact-page-subtitle">
          Let&apos;s build something remarkable together. Reach out for engineering roles, freelance contracts, or technical collaborations.
        </p>

        {/* Primary Direct Mail Card */}
        <div className="contact-primary-card">
          <div className="contact-primary-badge">
            <span className="contact-status-dot" />
            <span>Open for Opportunities</span>
          </div>

          <h2 className="contact-primary-title">Direct Inquiries & Collaboration</h2>
          <p className="contact-primary-desc">
            The quickest and most reliable way to discuss projects, interview requests, or contracts.
          </p>

          <div className="contact-email-box">
            <div className="contact-email-display">
              <HiOutlineEnvelope className="contact-email-icon" />
              <span>{email}</span>
            </div>

            <button
              type="button"
              className={`contact-action-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopyEmail}
              aria-label="Copy official email address"
            >
              {copied ? (
                <>
                  <HiOutlineCheck />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <HiOutlineClipboardDocument />
                  <span>Copy</span>
                </>
              )}
            </button>

            <a
              href={`mailto:${email}`}
              className="contact-action-btn"
              onClick={() => playClickSound()}
              aria-label="Send direct email"
            >
              <HiArrowTopRightOnSquare />
              <span>Send Mail</span>
            </a>
          </div>

          <p className="contact-reply-promise">
            ⚡ Direct response typically within 12–24 hours
          </p>
        </div>

        {/* Professional & Social Channels */}
        <h3 className="contact-section-heading">Connect Across Platforms</h3>
        <p className="contact-section-desc">
          Feel free to reach out, connect, or explore open-source work across these channels:
        </p>

        <div className="contact-channels-grid">
          {channels.map((ch) => {
            if (ch.isInternal) {
              return (
                <Link
                  key={ch.name}
                  to={ch.url}
                  className="contact-channel-card"
                  onClick={() => playClickSound()}
                  aria-label={`Open ${ch.name}`}
                >
                  <div className="contact-channel-top">
                    <span className="contact-channel-icon">{ch.icon}</span>
                    <HiArrowTopRightOnSquare className="contact-channel-ext" />
                  </div>
                  <h4 className="contact-channel-name">{ch.name}</h4>
                  <p className="contact-channel-handle">{ch.handle}</p>
                </Link>
              );
            }

            return (
              <a
                key={ch.name}
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-channel-card"
                onClick={() => playClickSound()}
                aria-label={`Visit Mohd Kaif on ${ch.name}`}
              >
                <div className="contact-channel-top">
                  <span className="contact-channel-icon">{ch.icon}</span>
                  <HiArrowTopRightOnSquare className="contact-channel-ext" />
                </div>
                <h4 className="contact-channel-name">{ch.name}</h4>
                <p className="contact-channel-handle">{ch.handle}</p>
              </a>
            );
          })}
        </div>

        {/* Status & Availability Details */}
        <h3 className="contact-section-heading">Details & Timezone</h3>
        <p className="contact-section-desc">
          Key working details for recruiters, founders, and hiring teams:
        </p>

        <div className="contact-meta-card">
          <div className="contact-meta-row">
            <span className="contact-meta-label">Location</span>
            <span className="contact-meta-value">Delhi, India</span>
          </div>
          <div className="contact-meta-row">
            <span className="contact-meta-label">Timezone</span>
            <span className="contact-meta-value">IST (UTC +5:30)</span>
          </div>
          <div className="contact-meta-row">
            <span className="contact-meta-label">Availability</span>
            <span className="contact-meta-value">Full-Time / Contracts / Remote Worldwide</span>
          </div>
          <div className="contact-meta-row">
            <span className="contact-meta-label">Core Focus</span>
            <span className="contact-meta-value">Full Stack Web, Mobile Apps, Agentic AI Systems</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

