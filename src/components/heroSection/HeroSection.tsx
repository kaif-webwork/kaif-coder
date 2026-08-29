import { useState, useEffect } from 'react';
import { RiVerifiedBadgeFill } from 'react-icons/ri';
import { HiOutlineEnvelope, HiOutlineSparkles } from 'react-icons/hi2';
import { FaGithub, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { HiOutlineDocumentDownload } from 'react-icons/hi';
import { IoLocationOutline, IoTimeOutline } from 'react-icons/io5';
import PixelTransition from '../pixelTransition/PixelTransition';
import { userImages } from '../../data/images';
import { playQrToggleSound, playClickSound } from '../../utils/sound';
import './HeroSection.css';

export default function HeroSection() {
  const [time, setTime] = useState('');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istTime = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setTime(istTime);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleQR = () => {
    const nextState = !showQR;
    playQrToggleSound(nextState);
    setShowQR(nextState);
  };

  return (
    <section className="hero-section">
      {/* Profile Header */}
      <div className="hero-profile">
        <div
          className="hero-avatar-wrapper"
          onClick={handleToggleQR}
          data-tooltip={showQR ? 'Tap for Photo' : 'Tap to QR'}
          title={showQR ? 'Click to show Photo' : 'Click to show QR Code'}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggleQR();
            }
          }}
        >
          <PixelTransition
            firstContent={
              <img
                src={userImages.profile.avatar}
                alt="Mohd Kaif"
                className="hero-avatar hero-avatar-img"
                loading="eager"
              />
            }
            secondContent={
              <img
                src={userImages.profile.qrCode}
                alt="Mohd Kaif QR Code"
                className="hero-avatar hero-avatar-qr"
                loading="eager"
              />
            }
            gridSize={12}
            pixelColor="#ffffff"
            animationStepDuration={0.35}
            isActive={showQR}
            trigger="none"
            aspectRatio="100%"
            className="hero-pixel-avatar"
          />
        </div>

        <div className="hero-info">
          <h1 className="hero-name">
            Mohd Kaif
          </h1>
          <p className="hero-username">
            <a
              href="https://x.com/kaif_coder"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playClickSound()}
            >
              @kaif_coder
            </a>
          </p>

          <div className="hero-meta">
            <span className="hero-meta-location">
              <IoLocationOutline className="hero-location-icon" /> Delhi, India
            </span>
            <span className="hero-meta-dot">•</span>
            <span className="hero-meta-time">
              <IoTimeOutline className="hero-time-icon" /> {time || '01:14:11 PM'}
            </span>
          </div>
        </div>
      </div>

      {/* Bio List */}
      <div className="hero-bio">
        <ul className="hero-bio-list">
          <li className="hero-bio-item">
            <span className="hero-bullet" />
            <span className="hero-bio-text">
              Hi, I am a <span className="hero-bio-highlight">Full Stack Developer</span>
            </span>
          </li>
          <li className="hero-bio-item">
            <span className="hero-bullet" />
            <span className="hero-bio-text">
              Passionate about building{' '}
              <span className="hero-bio-highlight">scalable web & mobile apps</span> and contributing to{' '}
              <span className="hero-bio-highlight">open source</span>.
            </span>
          </li>
          <li className="hero-bio-item">
            <span className="hero-bullet" />
            <span className="hero-bio-text">
              Always <span className="hero-bio-highlight">shipping</span>,{' '}
              <span className="hero-bio-highlight">learning</span>, and turning ideas into products people actually use.
            </span>
          </li>
        </ul>
      </div>

      {/* Social Cards Grid (Twitter & Discord Side-by-Side) */}
      <div className="hero-cards-grid">
        {/* Twitter Card */}
        <div className="hero-social-card">
          <div className="hero-card-icon-box twitter-bg">
            <FaXTwitter />
          </div>
          <div className="hero-card-details">
            <div className="hero-card-name">
              Mohd Kaif
              <RiVerifiedBadgeFill className="hero-verified-icon" />
            </div>
            <div className="hero-card-handle">@kaif_coder</div>
          </div>
          <a
            href="https://x.com/kaif_coder"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-card-btn twitter-btn"
            onClick={() => playClickSound()}
          >
            Follow
          </a>
        </div>

        {/* Blurred Mystery / Coming Soon Card */}
        <div className="hero-social-card hero-blurred-card" title="Coming Soon">
          <div className="hero-card-icon-box blurred-icon-bg">
            <HiOutlineSparkles className="sparkle-pulse" />
          </div>
          <div className="hero-card-details">
            <div className="hero-card-name">Something exciting...</div>
            <div className="hero-card-sub">
              <span className="hero-online-indicator orange" />
              Cooking up soon
            </div>
          </div>
          <span className="hero-card-btn blurred-btn">Soon ✦</span>
        </div>
      </div>

      {/* Quick Contact & Icon Row */}
      <div className="hero-quick-row">
        <a
          href="mailto:kaif.webwork@gmail.com"
          className="hero-email-pill"
          data-tooltip="24x7 available for your emails"
          aria-label="Email Me"
          onClick={() => playClickSound()}
        >
          <HiOutlineEnvelope className="hero-email-icon" />
          <span>Email Me</span>
        </a>
        <span className="hero-row-pipe">|</span>
        <div className="hero-icon-links">
          <a
            href="https://www.linkedin.com/in/mohd-kaif-6a453741a?utm_source=share_via&utm_content=profile&utm_medium=member_android"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-icon-btn"
            data-tooltip="LinkedIn"
            aria-label="LinkedIn"
            onClick={() => playClickSound()}
          >
            <FaLinkedinIn />
          </a>
          <a
            href="https://github.com/kaif-webwork"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-icon-btn"
            data-tooltip="GitHub"
            aria-label="GitHub"
            onClick={() => playClickSound()}
          >
            <FaGithub />
          </a>
          <a
            href="https://instagram.com/Kaif_Coder"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-icon-btn"
            data-tooltip="Instagram"
            aria-label="Instagram"
            onClick={() => playClickSound()}
          >
            <FaInstagram />
          </a>
          <a
            href="/resume"
            className="hero-icon-btn"
            data-tooltip="Resume"
            aria-label="Resume"
            onClick={() => playClickSound()}
          >
            <HiOutlineDocumentDownload />
          </a>
        </div>
      </div>

      <div className="hero-section-divider" />
    </section>
  );
}
